"""“行”页 AI 行动建议适配层。"""

from __future__ import annotations

import json
import re
from datetime import datetime, timedelta
from typing import Callable, Optional

from app.db.connection import RefactorSessionLocal
from app.db.repositories.refactored import KnowledgeRepository, MoodRepository, ScheduleNewRepository


class ScheduleSuggestionService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal):
        self._session_factory = session_factory

    def suggest(self, date: Optional[str] = None) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        yesterday = (datetime.strptime(target_date, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            knowledge = KnowledgeRepository.list_for_suggestion(db, 50)
            today_mood = MoodRepository.get_by_date(db, target_date)
            yesterday_mood = MoodRepository.get_by_date(db, yesterday)
            yesterday_schedules = ScheduleNewRepository.list_by_date(db, yesterday)
            existing_schedules = ScheduleNewRepository.list_by_date(db, target_date)
            return self._build(
                target_date,
                knowledge,
                today_mood,
                yesterday_mood,
                yesterday_schedules,
                existing_schedules,
            )
        finally:
            db.close()

    @staticmethod
    def _parse_tags(raw_tags) -> list[str]:
        if not raw_tags:
            return []
        if isinstance(raw_tags, list):
            return [str(tag) for tag in raw_tags]
        try:
            parsed = json.loads(raw_tags)
            if isinstance(parsed, list):
                return [str(tag) for tag in parsed]
        except (TypeError, json.JSONDecodeError):
            pass
        return [tag.strip() for tag in str(raw_tags).split(",") if tag.strip()]

    @staticmethod
    def _normalize_key(content: str) -> str:
        text = re.sub(r"\s+", "", content.lower())
        text = re.sub(r"day\d+", "", text)
        text = re.sub(r"并.*$", "", text)
        for old, new in {"搭建": "建立", "创建": "建立", "制作": "建立", "一次": "", "一个": "", "今日": "", "今天": ""}.items():
            text = text.replace(old, new)
        return re.sub(r"[，。；、,.!?！？:：\-—（）()]", "", text)

    @staticmethod
    def _category(text: str, tags: list[str]) -> str:
        joined = " ".join(tags) + " " + text
        mapping = [
            ("交易", ["交易", "复盘", "入场", "出场", "仓位", "模板"]),
            ("健身", ["健身", "拉伸", "深蹲", "散步", "训练", "身体"]),
            ("读书", ["读书", "毛选", "阅读", "摘", "佛学", "存在主义"]),
            ("心法", ["心法", "冥想", "觉察", "情绪", "压力"]),
        ]
        for category, keywords in mapping:
            if category in tags or any(keyword in joined for keyword in keywords):
                return category
        return tags[0] if tags else "日常"

    @staticmethod
    def _effort(text: str, category: str) -> str:
        if any(word in text for word in ["拉伸", "散步", "读一篇", "摘一句", "维护", "复习", "冥想"]):
            return "light"
        if category == "交易" or any(word in text for word in ["建立", "搭建", "设计", "复盘体系", "模板", "总结", "分析", "规则", "交易"]):
            return "deep"
        return "medium"

    @staticmethod
    def _clean(content: str) -> str:
        cleaned = content.strip(" ：:??")
        if "：" in cleaned or ":" in cleaned:
            prefix, suffix = re.split(r"[：:]", cleaned, maxsplit=1)
            if any(word in prefix for word in ["体系", "计划", "系统", "实践", "学习"]):
                cleaned = suffix.strip()
        cleaned = re.sub(r"^Day\s*\d+\s*", "", cleaned, flags=re.IGNORECASE).strip()
        cleaned = re.sub(r"^(每天|每日|状态差时|收盘后|先|再|然后|最后|并|和|要|能|试着|尝试)", "", cleaned).strip(" ：:??")
        cleaned = re.sub(r"^(建立|搭建|设计).{0,12}(体系|计划)[：:]?", "", cleaned).strip(" ：:??")
        return cleaned[:80]

    @staticmethod
    def _is_actionable_clause(clause: str) -> bool:
        text = clause.strip()
        if "：" in text or ":" in text:
            prefix, suffix = re.split(r"[：:]", text, maxsplit=1)
            if any(word in prefix for word in ["体系", "计划", "系统", "实践", "学习"]):
                text = suffix.strip()
        if re.match(r"^Day\s*\d+", text, flags=re.IGNORECASE):
            return True
        if re.search(r"\d+\s*(分钟|小时|篇|段|句|个|笔|次)", text):
            return True
        return text.startswith((
            "今天", "每日", "每天", "状态差时", "收盘后", "先", "再", "然后", "最后",
            "建立", "搭建", "回填", "总结", "复盘", "拉伸", "深蹲", "散步", "读", "阅读",
            "摘", "冥想", "记录", "训练", "整理", "写", "沉淀", "选", "列", "沟通", "回想", "陈述", "观察", "把",
        ))

    @classmethod
    def _extract_actions(cls, item) -> list[dict]:
        title = getattr(item, "title", "") or ""
        text = f"{title}。{getattr(item, 'content', '') or ''}"
        tags = cls._parse_tags(getattr(item, "tags", None))
        raw: list[tuple[str, Optional[int]]] = []
        for match in re.compile(r"Day\s*(\d+)\s*[：: ]\s*([^，。；\n]+)", re.IGNORECASE).finditer(text):
            raw.append((match.group(2).strip(), int(match.group(1))))
        keywords = "建立|搭建|回填|总结|复盘|拉伸|深蹲|散步|读一篇|阅读|摘一句|冥想|记录|训练|整理|写一段|沉淀|选择|检验|讨论|列出|沟通|回想|陈述|看穿|观察|换成|分开"
        for index, clause in enumerate([part.strip() for part in re.split(r"[，。；\n]+", text) if part.strip()], start=1):
            if clause == title or not re.search(keywords, clause) or not cls._is_actionable_clause(clause):
                continue
            action = cls._clean(clause)
            if len(action) >= 4:
                raw.append((action, index))
        actions, seen = [], set()
        for content, step_day in raw:
            cleaned = cls._clean(content)
            key = cls._normalize_key(cleaned)
            if not cleaned or len(key) < 3 or key in seen:
                continue
            seen.add(key)
            category = cls._category(f"{title} {cleaned}", tags)
            actions.append({"content": cleaned, "category": category, "knowledge_id": getattr(item, "id", None), "source_title": title, "step_day": step_day, "effort": cls._effort(cleaned, category)})
        return actions

    @staticmethod
    def _energy(today_mood, yesterday_mood) -> str:
        mood = today_mood or yesterday_mood
        energy = getattr(mood, "energy", None) if mood else None
        stress = getattr(mood, "stress", None) if mood else None
        score = getattr(mood, "mood_score", None) if mood else None
        if energy is not None and energy >= 7 and (stress is None or stress <= 6):
            return "high"
        if (energy is not None and energy <= 4) or (stress is not None and stress >= 7) or (score is not None and score <= 4):
            return "low"
        return "medium"

    @classmethod
    def _build(cls, target_date, knowledge, today_mood, yesterday_mood, yesterday_schedules, existing_schedules) -> dict:
        energy = cls._energy(today_mood, yesterday_mood)
        existing = {cls._normalize_key(getattr(item, "content", "")) for item in [*yesterday_schedules, *existing_schedules] if not getattr(item, "is_done", False)}
        completed = {cls._category(getattr(item, "content", ""), []) for item in yesterday_schedules if getattr(item, "is_done", False)}
        merged = {}
        for item in knowledge:
            for action in cls._extract_actions(item):
                key = cls._normalize_key(action["content"])
                if key in existing:
                    continue
                duplicate = next((candidate for candidate in merged if key in candidate or candidate in key), None)
                target = duplicate or key
                if target in merged:
                    merged[target]["sources"].append(action["source_title"])
                    merged[target]["score"] += 1
                    if action.get("step_day") and not merged[target].get("step_day"):
                        merged[target]["step_day"] = action["step_day"]
                    continue
                action["sources"] = [action["source_title"]]
                action["score"] = 0
                merged[target] = action
        weights = {"high": {"deep": 8, "medium": 5, "light": 2}, "low": {"light": 8, "medium": 4, "deep": 1}, "medium": {"medium": 7, "light": 5, "deep": 4}}[energy]
        for action in merged.values():
            action["score"] += weights[action["effort"]]
            if action["category"] in completed:
                action["score"] += 2
            if action.get("step_day"):
                action["score"] += max(0, 10 - action["step_day"]) * 2 if energy != "low" else max(0, 5 - action["step_day"]) * 2
            if len(action["sources"]) > 1:
                action["score"] += 1
        ranked = sorted(merged.values(), key=lambda item: (-item["score"], item.get("step_day") or 99, item["content"]))
        capacity = {"low": 3, "medium": 5, "high": 6}[energy]
        suggestions = [{"content": action["content"], "priority": index, "category": action["category"], "source": "knowledge_suggest", "knowledge_id": action.get("knowledge_id"), "reason": f"来自《{action['source_title']}》；当前状态={energy}；来源数={len(action['sources'])}", "step_day": action.get("step_day"), "effort": action["effort"]} for index, action in enumerate(ranked[:capacity], start=1)]
        return {"suggestions": suggestions, "note": "按 知识理想做法 + 当前状态 + 昨日完成情况 排序，已合并同类动作。", "context": {"date": target_date, "energy_level": energy, "knowledge_count": len(knowledge), "candidate_count": len(merged), "daily_capacity": capacity}}
