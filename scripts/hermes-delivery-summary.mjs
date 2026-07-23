#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const deliveriesDir = path.join(root, '.hermes', 'deliveries');
const templatePath = path.join(root, '.hermes', 'delivery-template.md');

function run(command) {
  try {
    return execSync(command, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 1024 * 1024 * 10,
    }).trim();
  } catch (error) {
    const stdout = error.stdout ? String(error.stdout).trim() : '';
    const stderr = error.stderr ? String(error.stderr).trim() : '';
    return [stdout, stderr].filter(Boolean).join('\n').trim() || `命令失败：${command}`;
  }
}

function sanitizeTitle(input) {
  return input
    .trim()
    .replace(/[\s/\\:*?"<>|]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'life-os-delivery';
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function parseArgs(argv) {
  const args = { title: '', decision: '', verify: '', risk: '无', xiaoxue: '无', jieyi: '无', next: '无' };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--title') args.title = argv[++i] || '';
    else if (arg === '--decision') args.decision = argv[++i] || '';
    else if (arg === '--verify') args.verify = argv[++i] || '';
    else if (arg === '--risk') args.risk = argv[++i] || '无';
    else if (arg === '--xiaoxue') args.xiaoxue = argv[++i] || '无';
    else if (arg === '--jieyi') args.jieyi = argv[++i] || '无';
    else if (arg === '--next') args.next = argv[++i] || '无';
    else if (!args.title) args.title = arg;
  }
  return args;
}

const args = parseArgs(process.argv);
const title = args.title || run('git log -1 --pretty=%s') || 'Life OS 交付记录';
const branch = run('git branch --show-current');
const head = run('git rev-parse --short HEAD');
const gitStatus = run('git status --short -- . ":!node_modules" ":!**/node_modules" ":!packages/*/dist"');
const changedFiles = run('git diff --name-only -- . ":!node_modules" ":!**/node_modules" ":!packages/*/dist"');
const stagedFiles = run('git diff --cached --name-only -- . ":!node_modules" ":!**/node_modules" ":!packages/*/dist"');
const recentCommit = run('git log -1 --pretty=format:"%h %s"');

mkdirSync(deliveriesDir, { recursive: true });

const fileName = `${nowStamp()}-${sanitizeTitle(title)}.md`;
const outPath = path.join(deliveriesDir, fileName);

const changedList = [...new Set([...changedFiles.split('\n'), ...stagedFiles.split('\n')].map((s) => s.trim()).filter(Boolean))];
const changedSection = changedList.length
  ? changedList.map((file) => `- \`${file}\``).join('\n')
  : '- 无未提交代码变更；请在任务说明中补充交付内容。';

const templateNote = existsSync(templatePath) ? `模板：${path.relative(root, templatePath)}` : '模板：未找到';

const content = `# ${title}\n\n生成时间：${new Date().toISOString()}\n分支：${branch || 'unknown'}\nHEAD：${head || 'unknown'}\n${templateNote}\n\n## 任务\n\n- ${title}\n\n## 变更文件\n\n${changedSection}\n\n## 关键决策\n\n- 本记录由 \`pnpm hermes:summary\` 生成；Codex 保留全量工程上下文，小白只读运维/备用接手摘要，结衣和小雪只读各自业务摘要。\n- ${args.decision || '本次没有额外产品方向变更；按 Goal 和现有事实源执行。'}\n\n## 验证结果\n\n- ${args.verify || '请补充实际执行过的构建/测试/接口验证，格式必须包含：命令 + 结果 + 证据。'}\n\n## 风险与遗留\n\n- ${args.risk}\n\n## 可见范围\n\n| 对象 | 可见内容 |\n|------|----------|\n| Codex | 全量任务、变更文件、关键决策、验证、风险、后续动作 |\n| 小白 | 只看运维、bot 恢复、外部状态变化和备用接手所需摘要 |\n| 结衣 | 只看「给结衣」摘要和结衣知行合一相关影响；小雪电竞人生细节不展开 |\n| 小雪 | 只看「给小雪」摘要和小雪电竞人生相关影响；结衣知行合一细节不展开 |\n\n## 给小雪\n\n- ${args.xiaoxue}\n\n## 给结衣\n\n- ${args.jieyi}\n\n## 后续动作\n\n- ${args.next}\n\n## Git 摘要\n\n最近提交：${recentCommit || '无'}\n\n\`\`\`text\n${gitStatus || 'working tree clean（忽略 node_modules/dist）'}\n\`\`\`\n`;

writeFileSync(outPath, content, 'utf8');
writeFileSync(path.join(deliveriesDir, 'latest.md'), content, 'utf8');

console.log(`已生成交付记录: ${outPath}`);
console.log(`已更新 latest: ${path.join(deliveriesDir, 'latest.md')}`);
