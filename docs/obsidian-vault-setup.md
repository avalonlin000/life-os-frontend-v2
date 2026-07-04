# Obsidian vault setup

## Current state

- Obsidian desktop app: installed with Snap classic package.
- Installed package: `obsidian 1.12.7` from Snap channel `latest/stable`.
- Launch command: `/snap/bin/obsidian`.
- Vault path: `/home/ubuntu/workspace/knowledge/wiki`.
- Markdown files in vault: 1290.
- Total files in vault before adding `.obsidian`: 1298.
- `index.md`: present.
- `log.md`: present.

## Environment binding

`OBSIDIAN_VAULT_PATH` is set to:

`/home/ubuntu/workspace/knowledge/wiki`

Configured in:

- `/home/ubuntu/.hermes/profiles/xiaobai/.env` for the xiaobai Hermes profile.
- `/home/ubuntu/.bashrc` for interactive shell sessions.
- `/home/ubuntu/.profile` for login shell sessions.

No tokens or secrets are required for this vault binding.

## Obsidian vault config

Minimal safe Obsidian config directory:

`/home/ubuntu/workspace/knowledge/wiki/.obsidian`

Created files:

- `.obsidian/app.json`
- `.obsidian/appearance.json`
- `.obsidian/core-plugins.json`

The existing markdown body files were not rewritten.

## Verification commands

```bash
command -v obsidian
snap list obsidian
bash -ic 'printf "%s\n" "$OBSIDIAN_VAULT_PATH"'
bash -lc 'source /home/ubuntu/.hermes/profiles/xiaobai/.env; printf "%s\n" "$OBSIDIAN_VAULT_PATH"'
python3 - <<'PY'
from pathlib import Path
root = Path('/home/ubuntu/workspace/knowledge/wiki')
print(len(list(root.rglob('*.md'))))
print((root / 'index.md').is_file())
print((root / 'log.md').is_file())
print((root / '.obsidian').is_dir())
PY
```

## Runtime limitation

`obsidian --version` exists as a command path but is a GUI/Electron Snap app; in the current headless server environment it loads the app package and then segfaults instead of printing a clean CLI version. Package installation and version are therefore verified with `snap list obsidian` and `snap info obsidian`; GUI launch needs a desktop environment/session.
