#!/usr/bin/env node
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const sessionsPath = '/home/ubuntu/.hermes/profiles/jieyi/sessions/sessions.json';
const serviceName = 'hermes-gateway-jieyi.service';

function run(argv) {
  return execFileSync(argv[0], argv.slice(1), {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
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

function assertJson(path) {
  JSON.parse(readFileSync(path, 'utf8'));
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function readGatewayState() {
  const stateRaw = readFileSync('/home/ubuntu/.hermes/profiles/jieyi/gateway_state.json', 'utf8');
  return JSON.parse(stateRaw);
}

function waitForReady(timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  let last = null;

  while (Date.now() < deadline) {
    const status = run(['systemctl', '--user', 'is-active', serviceName]);
    const state = readGatewayState();
    const feishuState = state.platforms?.feishu?.state;
    last = { status, gateway: state.gateway_state, feishu: feishuState };

    if (status === 'active' && state.gateway_state === 'running' && feishuState === 'connected') {
      return last;
    }

    sleep(1000);
  }

  return last;
}

if (!existsSync(sessionsPath)) {
  console.error(`Missing Jieyi session index: ${sessionsPath}`);
  process.exit(1);
}

assertJson(sessionsPath);

run(['systemctl', '--user', 'stop', serviceName]);

const backupPath = `${sessionsPath}.bak.${timestamp()}`;
copyFileSync(sessionsPath, backupPath);
writeFileSync(sessionsPath, '{}\n', { mode: 0o600 });

run(['systemctl', '--user', 'start', serviceName]);

const ready = waitForReady();

if (ready?.status !== 'active' || ready?.gateway !== 'running' || ready?.feishu !== 'connected') {
  console.error(`Jieyi revive incomplete: service=${ready?.status}, gateway=${ready?.gateway}, feishu=${ready?.feishu}`);
  process.exit(1);
}

console.log(`Jieyi session index reset: ${sessionsPath}`);
console.log(`Backup: ${backupPath}`);
console.log(`Service: ${ready.status}`);
console.log(`Feishu: ${ready.feishu}`);
