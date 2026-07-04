#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const profiles = [
  {
    name: 'xiaoxue',
    home: '/home/ubuntu/.hermes',
    service: 'hermes-gateway.service',
  },
  {
    name: 'jieyi',
    home: '/home/ubuntu/.hermes/profiles/jieyi',
    service: 'hermes-gateway-jieyi.service',
  },
];

const tokenLimit = Number(process.env.HERMES_CONTEXT_TOKEN_LIMIT || 60000);
const messageLimit = Number(process.env.HERMES_CONTEXT_MESSAGE_LIMIT || 220);
const logPath = '/home/ubuntu/.hermes/logs/context-maintenance.log';

function nowIso() {
  return new Date().toISOString();
}

function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    '_',
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
}

function log(line) {
  mkdirSync(dirname(logPath), { recursive: true, mode: 0o700 });
  writeFileSync(logPath, `[${nowIso()}] ${line}\n`, { flag: 'a', mode: 0o600 });
  console.log(line);
}

function run(argv, options = {}) {
  return execFileSync(argv[0], argv.slice(1), {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function serviceStatus(service) {
  try {
    return run(['systemctl', '--user', 'is-active', service]);
  } catch {
    return 'inactive';
  }
}

function readJson(path, fallback) {
  if (!existsSync(path)) {
    return fallback;
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

function hasActiveAgent(home) {
  const statePath = `${home}/gateway_state.json`;
  const state = readJson(statePath, {});
  return Number(state.active_agents || 0) > 0;
}

function sessionNeedsReset(entry) {
  return (
    Number(entry.last_prompt_tokens || 0) > tokenLimit
    || Number(entry.message_count || 0) > messageLimit
    || Number(entry.total_tokens || 0) > tokenLimit
  );
}

function summarizeEntries(entries) {
  const rows = Object.values(entries || {});
  const hot = rows.filter(sessionNeedsReset);
  const maxPrompt = rows.reduce((max, row) => Math.max(max, Number(row.last_prompt_tokens || 0)), 0);
  const maxMessages = rows.reduce((max, row) => Math.max(max, Number(row.message_count || 0)), 0);
  return { total: rows.length, hot: hot.length, maxPrompt, maxMessages };
}

function waitForReady(profile, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  let last = null;

  while (Date.now() < deadline) {
    const status = serviceStatus(profile.service);
    const state = readJson(`${profile.home}/gateway_state.json`, {});
    const gateway = state.gateway_state;
    const feishu = state.platforms?.feishu?.state;
    last = { status, gateway, feishu };

    if (status === 'active' && gateway === 'running' && feishu === 'connected') {
      return last;
    }

    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }

  return last;
}

function resetSessionIndex(profile, summary) {
  const sessionsPath = `${profile.home}/sessions/sessions.json`;
  const entries = readJson(sessionsPath, {});
  if (Object.keys(entries).length === 0) {
    log(`${profile.name}: session index already clean`);
    return false;
  }

  const backupPath = `${sessionsPath}.bak.context-maintenance.${timestamp()}`;
  run(['systemctl', '--user', 'stop', profile.service]);
  copyFileSync(sessionsPath, backupPath);
  writeJson(sessionsPath, {});

  run(['systemctl', '--user', 'start', profile.service]);
  const ready = waitForReady(profile);
  if (ready?.status !== 'active' || ready?.gateway !== 'running' || ready?.feishu !== 'connected') {
    throw new Error(`${profile.name}: restart incomplete service=${ready?.status} gateway=${ready?.gateway} feishu=${ready?.feishu}`);
  }

  log(`${profile.name}: reset session index; entries=${summary.total}, hot=${summary.hot}, max_prompt=${summary.maxPrompt}, max_messages=${summary.maxMessages}, backup=${backupPath}`);
  return true;
}

let changed = false;

for (const profile of profiles) {
  try {
    const sessionsPath = `${profile.home}/sessions/sessions.json`;
    const entries = readJson(sessionsPath, {});
    const summary = summarizeEntries(entries);

    if (serviceStatus(profile.service) !== 'active') {
      log(`${profile.name}: service not active, skipped`);
      continue;
    }

    if (hasActiveAgent(profile.home)) {
      log(`${profile.name}: active agent running, skipped`);
      continue;
    }

    if (summary.hot === 0) {
      log(`${profile.name}: ok entries=${summary.total}, max_prompt=${summary.maxPrompt}, max_messages=${summary.maxMessages}`);
      continue;
    }

    changed = resetSessionIndex(profile, summary) || changed;
  } catch (error) {
    log(`${profile.name}: ERROR ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

if (!changed && !process.exitCode) {
  log('maintenance complete: no reset needed');
}
