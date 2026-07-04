#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const latestPath = path.join(root, '.hermes', 'deliveries', 'latest.md');
const defaultChatId = 'oc_c05b35b0e6052bbbc8743637fd2303cb';

function parseArgs(argv) {
  const args = { dryRun: false, chatId: process.env.LIFE_OS_SYNC_CHAT_ID || defaultChatId };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--chat-id') args.chatId = argv[++i] || args.chatId;
  }
  return args;
}

function section(md, name) {
  const re = new RegExp(`## ${name}\\n\\n([\\s\\S]*?)(?=\\n## |$)`);
  const m = md.match(re);
  return m ? m[1].trim() : '无';
}

function firstHeading(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : 'Life OS delivery 可选广播';
}

function compact(text, max = 500) {
  const cleaned = text.replace(/```[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim();
  return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned;
}

const args = parseArgs(process.argv);
if (!existsSync(latestPath)) {
  console.error(`FAIL: 找不到交付记录：${latestPath}`);
  console.error('先运行：pnpm hermes:summary -- --title "任务名" --verify "验证结果"');
  process.exit(1);
}

const md = readFileSync(latestPath, 'utf8');
const title = firstHeading(md);
const task = compact(section(md, '任务'), 260);
const xiaoxue = compact(section(md, '给小雪'), 260);
const jieyi = compact(section(md, '给结衣'), 260);
const risks = compact(section(md, '风险与遗留'), 220);

const text = `Life OS delivery 可选广播：${title}\n\n同步机制：\n小雪/结衣同步项目上下文靠读取 delivery 文件，不靠飞书 @ 或唤醒。latest.md 是当前共享上下文入口；本消息只是可选通知。\n\n读取边界：\n小雪只看「给小雪」；结衣只看「给结衣」。双方不展开对方项目细节；小白保留全量。\n\n任务：\n${task}\n\n风险：\n${risks}\n\n给小雪：\n${xiaoxue}\n\n给结衣：\n${jieyi}\n\n完整记录：${latestPath}\n\n说明书：\n结衣：/home/ubuntu/life-os-frontend-v2/docs/products/jieyi-zhixing-heyi/BOT_GUIDE.md\n小雪：/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/BOT_GUIDE.md`;

const commandArgs = [
  'im', '+messages-send',
  '--as', 'bot',
  '--chat-id', args.chatId,
  '--msg-type', 'text',
  '--content', JSON.stringify({ text }),
];
if (args.dryRun) commandArgs.push('--dry-run');

try {
  const output = execFileSync('lark-cli', commandArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  console.log(args.dryRun ? 'DRY-RUN: 已生成可选广播消息，未发送。' : 'OK: 已发送 Life OS delivery 可选广播。');
  console.log(output.trim());
} catch (error) {
  console.error('FAIL: 广播失败，不影响 delivery 文件同步。');
  console.error(`delivery 文件仍可读取：${latestPath}`);
  if (error.stdout) console.error(String(error.stdout));
  if (error.stderr) console.error(String(error.stderr));
  process.exit(error.status || 1);
}
