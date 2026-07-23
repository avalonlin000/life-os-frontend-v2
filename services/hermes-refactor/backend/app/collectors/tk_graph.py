"""
TK 概念关系图更新采集器（迁移自 scripts/update_tk_graph.sh）
=============================================================
现状：/home/ubuntu/lol_data/scripts/update_tk_graph.sh
迁移方式：新旧并存，输出对比一致后才切 cron

用法:
    python -c "from app.collectors.tk_graph import run; run()"
"""

import os
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Optional


# 知识库路径（使用绝对路径，避免 expanduser 在 hermes 环境下解析错误）
TK_DIR = "/home/ubuntu/workspace/knowledge/tk"
OUTPUT_DIR = "/home/ubuntu/tk_graph_serve"


def run(output_dir: Optional[str] = None, verbose: bool = True) -> dict:
    """
    重建 TK 概念关系图数据
    
    Returns:
        {nodes: int, links: int, records: int}
    """
    target_dir = output_dir or OUTPUT_DIR
    os.makedirs(target_dir, exist_ok=True)
    
    if not os.path.isdir(TK_DIR):
        if verbose:
            print(f"[tk_graph] TK 目录不存在: {TK_DIR}")
        return {"nodes": 0, "links": 0, "records": 0}
    
    tag_counter = Counter()
    cooccur = defaultdict(int)
    node_types = {}
    tk_by_tag = defaultdict(list)
    all_records = []
    
    # 解析所有 .md 文件
    try:
        import yaml
    except ImportError:
        if verbose:
            print("[tk_graph] ⚠️  yaml 未安装，降级为无 frontmatter 解析")
        yaml = None
    
    for fp in sorted(Path(TK_DIR).glob('*.md'), key=lambda p: p.name, reverse=True):
        try:
            raw = fp.read_text(encoding='utf-8')
        except Exception:
            continue
        
        meta = {}
        body = raw
        if raw.startswith('---') and yaml:
            parts = raw.split('---', 2)
            if len(parts) >= 3:
                try:
                    meta = yaml.safe_load(parts[1]) or {}
                except Exception:
                    meta = {}
                body = parts[2].strip()
        
        tags_list = meta.get('tags', [])
        if isinstance(tags_list, str):
            tags_list = [t.strip() for t in tags_list.split(',')]
        
        source_type = meta.get('source_type', '') or ''
        source = meta.get('source', '') or ''
        tid = fp.stem
        
        all_records.append({
            'id': tid,
            'tags': tags_list,
            'content': body[:120],
            'source_type': source_type,
            'source': source[:20],
        })
    
    # 构建标签计数和共现
    for rec in all_records:
        tags = rec['tags']
        for t in tags:
            tag_counter[t] += 1
            if t.startswith('队伍:'):
                node_types[t] = 'team'
            elif t.startswith('选手:'):
                node_types[t] = 'player'
            else:
                node_types[t] = 'concept'
            tk_by_tag[t].append({
                'id': rec['id'],
                'content': rec['content'],
                'type': rec['source_type'],
                'source': rec['source'],
            })
        for i in range(len(tags)):
            for j in range(i + 1, len(tags)):
                key = tuple(sorted([tags[i], tags[j]]))
                cooccur[key] += 1
    
    # 构建节点
    nodes = []
    node_id_map = {}
    for tag, cnt in tag_counter.most_common(120):
        if cnt < 2 and not tag.startswith('队伍:'):
            continue
        ntype = node_types.get(tag, 'concept')
        nid = tag.replace(':', '_').replace(' ', '_')
        node_id_map[tag] = nid
        nodes.append({
            'id': nid, 'label': tag, 'type': ntype,
            'count': cnt, 'tk_count': len(tk_by_tag.get(tag, [])),
        })
    
    # 构建链接
    links = []
    for (a, b), w in cooccur.items():
        if w < 2:
            continue
        if a in node_id_map and b in node_id_map:
            links.append({'source': node_id_map[a], 'target': node_id_map[b], 'weight': min(w, 10)})
    
    # 构建索引
    tk_index = {}
    for tag, items in tk_by_tag.items():
        if tag in node_id_map:
            tk_index[node_id_map[tag]] = items[:8]
    
    data = {'nodes': nodes, 'links': links, 'tk_index': tk_index}
    
    with open(f'{target_dir}/data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)
    
    if verbose:
        print(f"[tk_graph] ✅ {len(nodes)} nodes, {len(links)} links, {len(all_records)} records -> {target_dir}/data.json")
    
    # 新旧对比 TODO
    return {"nodes": len(nodes), "links": len(links), "records": len(all_records)}


if __name__ == "__main__":
    run()
