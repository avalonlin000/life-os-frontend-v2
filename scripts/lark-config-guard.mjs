#!/usr/bin/env node
import { createHash } from 'node:crypto';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const command = process.argv[2];
const baselinePath = process.argv[3] || '/home/ubuntu/.lark-channel/profiles/xiaobai/lark-config-baseline.json';
const backupDir = join(dirname(baselinePath), 'lark-config-backup');

const requiredEnv = [
  'LARK_CHANNEL',
  'LARK_CHANNEL_HOME',
  'LARK_CHANNEL_PROFILE',
  'LARK_CHANNEL_CONFIG',
  'LARKSUITE_CLI_CONFIG_DIR',
];

const watchedFiles = [
  process.env.LARK_CHANNEL_CONFIG,
  `${process.env.LARK_CHANNEL_HOME || ''}/config.json`,
  `${process.env.LARK_CHANNEL_HOME || ''}/active-profile`,
  `${process.env.LARK_CHANNEL_HOME || ''}/profiles/${process.env.LARK_CHANNEL_PROFILE || ''}/sessions.json`,
  `${process.env.LARK_CHANNEL_HOME || ''}/profiles/${process.env.LARK_CHANNEL_PROFILE || ''}/sessions.json.catalog.json`,
  `${process.env.LARK_CHANNEL_HOME || ''}/profiles/${process.env.LARK_CHANNEL_PROFILE || ''}/secrets.enc`,
  `${process.env.LARK_CHANNEL_HOME || ''}/profiles/${process.env.LARK_CHANNEL_PROFILE || ''}/.keystore.salt`,
].filter(Boolean);

const expectedProfiles = ['xiaobai'];
const expectedApps = ['jieyi-web', 'xiaoxue-web'];

function usage() {
  console.log(`Usage:
  node scripts/lark-config-guard.mjs snapshot [baseline-path]
  node scripts/lark-config-guard.mjs check [baseline-path]
  node scripts/lark-config-guard.mjs restore [baseline-path]

Default baseline:
  ${baselinePath}`);
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function fileRecord(path) {
  if (!existsSync(path)) {
    return { path, exists: false };
  }

  const stat = statSync(path);
  return {
    path,
    exists: true,
    mode: (stat.mode & 0o777).toString(8).padStart(3, '0'),
    size: stat.size,
    sha256: sha256(path),
  };
}

function runText(argv, options = {}) {
  return execFileSync(argv[0], argv.slice(1), {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function larkCliVersion() {
  const output = runText(['lark-cli', '--version']);
  return output.replace(/^lark-cli version\s+/, '').trim();
}

function larkDoctorOffline() {
  const output = runText(['lark-cli', 'doctor', '--offline']);
  return JSON.parse(output);
}

function collect() {
  const env = Object.fromEntries(requiredEnv.map((key) => [key, process.env[key] || '']));
  const missingEnv = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingEnv.length > 0) {
    throw new Error(`Missing lark-channel env: ${missingEnv.join(', ')}`);
  }

  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const appPackageFiles = expectedApps.map((name) => `packages/${name}/package.json`);
  const appPackages = Object.fromEntries(
    appPackageFiles.map((path) => [path, JSON.parse(readFileSync(path, 'utf8'))]),
  );

  return {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    note: 'Hashes only. This baseline intentionally does not store lark secrets or config contents.',
    expectedProfiles,
    expectedApps,
    env,
    cliVersion: larkCliVersion(),
    doctorOffline: larkDoctorOffline(),
    files: watchedFiles.map(fileRecord),
    workspace: {
      packageScripts: packageJson.scripts || {},
      apps: appPackages,
      viteConfigs: [
        fileRecord('packages/jieyi-web/vite.config.ts'),
        fileRecord('packages/xiaoxue-web/vite.config.ts'),
      ],
    },
  };
}

function indexByPath(records) {
  return new Map(records.map((record) => [record.path, record]));
}

function backupName(path) {
  return `${createHash('sha256').update(path).digest('hex').slice(0, 16)}-${basename(path)}`;
}

function writeFileBackups(current) {
  rmSync(backupDir, { recursive: true, force: true });
  mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  chmodSync(backupDir, 0o700);

  const entries = [];
  for (const record of current.files || []) {
    if (!record.exists) {
      continue;
    }

    const name = backupName(record.path);
    const backupPath = join(backupDir, name);
    copyFileSync(record.path, backupPath);
    chmodSync(backupPath, 0o600);
    entries.push({
      path: record.path,
      backup: name,
      mode: record.mode,
      sha256: record.sha256,
    });
  }

  writeFileSync(
    join(backupDir, 'manifest.json'),
    `${JSON.stringify({
      createdAt: new Date().toISOString(),
      baselinePath,
      entries,
    }, null, 2)}\n`,
    { mode: 0o600 },
  );
}

function compareBaseline(baseline, current) {
  const failures = [];
  const warnings = [];

  for (const key of requiredEnv) {
    if (baseline.env?.[key] !== current.env[key]) {
      failures.push(`env changed: ${key}`);
    }
  }

  if (baseline.cliVersion !== current.cliVersion) {
    warnings.push(`lark-cli version changed: ${baseline.cliVersion} -> ${current.cliVersion}`);
  }

  if (!current.doctorOffline?.ok) {
    failures.push('lark-cli doctor --offline is not ok');
  }

  const doctorFailures = current.doctorOffline?.checks
    ?.filter((check) => check.status === 'fail')
    .map((check) => `${check.name}: ${check.message}`) || [];
  failures.push(...doctorFailures);

  const baselineFiles = indexByPath(baseline.files || []);
  const currentFiles = indexByPath(current.files || []);

  for (const [path, before] of baselineFiles.entries()) {
    const after = currentFiles.get(path);
    if (!after) {
      failures.push(`file no longer watched: ${path}`);
      continue;
    }
    if (before.exists !== after.exists) {
      failures.push(`file existence changed: ${path}`);
      continue;
    }
    if (!before.exists) {
      continue;
    }
    if (before.mode !== after.mode) {
      failures.push(`file mode changed: ${path} ${before.mode} -> ${after.mode}`);
    }
    if (before.sha256 !== after.sha256) {
      failures.push(`file hash changed: ${path}`);
    }
  }

  const beforeScripts = baseline.workspace?.packageScripts || {};
  const afterScripts = current.workspace?.packageScripts || {};
  for (const name of ['dev:jieyi', 'dev:xiaoxue', 'build:jieyi', 'build:xiaoxue', 'build:all']) {
    if (beforeScripts[name] !== afterScripts[name]) {
      failures.push(`package script changed: ${name}`);
    }
  }

  const beforeVite = indexByPath(baseline.workspace?.viteConfigs || []);
  const afterVite = indexByPath(current.workspace?.viteConfigs || []);
  for (const path of ['packages/jieyi-web/vite.config.ts', 'packages/xiaoxue-web/vite.config.ts']) {
    if (beforeVite.get(path)?.sha256 !== afterVite.get(path)?.sha256) {
      failures.push(`vite config changed: ${path}`);
    }
  }

  return { failures, warnings };
}

function writeBaseline() {
  const current = collect();
  mkdirSync(dirname(baselinePath), { recursive: true, mode: 0o700 });
  writeFileBackups(current);
  writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`, { mode: 0o600 });
  console.log(`Baseline written: ${baselinePath}`);
  console.log(`Backup written: ${backupDir}`);
  console.log(`lark-cli: ${current.cliVersion}`);
  console.log(`profile: ${current.env.LARK_CHANNEL_PROFILE}`);
  console.log(`doctor offline: ${current.doctorOffline.ok ? 'ok' : 'failed'}`);
}

function checkBaseline() {
  if (!existsSync(baselinePath)) {
    throw new Error(`Baseline missing: ${baselinePath}. Run snapshot first.`);
  }

  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const current = collect();
  const { failures, warnings } = compareBaseline(baseline, current);

  for (const warning of warnings) {
    console.warn(`WARN ${warning}`);
  }

  if (failures.length > 0) {
    console.error('Lark config guard failed. Confirm the change, then refresh the baseline only if it is intentional.');
    for (const failure of failures) {
      console.error(`FAIL ${failure}`);
    }
    process.exit(1);
  }

  console.log(`Lark config guard passed: ${baselinePath}`);
}

function restoreBaseline() {
  if (!existsSync(baselinePath)) {
    throw new Error(`Baseline missing: ${baselinePath}. Run snapshot first.`);
  }

  const manifestPath = join(backupDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Error(`Backup manifest missing: ${manifestPath}. Run snapshot first.`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const entry of manifest.entries || []) {
    const source = join(backupDir, entry.backup);
    if (!existsSync(source)) {
      throw new Error(`Backup file missing: ${source}`);
    }

    mkdirSync(dirname(entry.path), { recursive: true, mode: 0o700 });
    copyFileSync(source, entry.path);
    chmodSync(entry.path, Number.parseInt(entry.mode || '600', 8));
  }

  checkBaseline();
  console.log(`Lark config restored from backup: ${backupDir}`);
}

try {
  if (command === 'snapshot') {
    writeBaseline();
  } else if (command === 'check') {
    checkBaseline();
  } else if (command === 'restore') {
    restoreBaseline();
  } else {
    usage();
    process.exit(command ? 1 : 0);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
