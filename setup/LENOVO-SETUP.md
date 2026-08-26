# Lenovo (Windows) setup: pi agent + Claude Code + GLM

How to get three coding-agent setups running on a Windows laptop using PowerShell:

- **Claude Code** — Anthropic's terminal coding agent, running on your Claude account
- **pi** — a lightweight open-source coding agent (pi.dev, by Mario Zechner) that can talk to many model providers
- **GLM** — Z.AI's GLM models (the cheap "GLM Coding Plan"), plugged into *both* Claude Code and pi

GLM is not a separate app — it's a model provider. You "install" it by getting a Z.AI API key and pointing Claude Code and/or pi at it.

---

## Quick path: run the script

Copy `setup/lenovo-setup.ps1` from this repo onto the laptop, open PowerShell, and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\lenovo-setup.ps1
```

It installs everything below, asks for your Z.AI key (optional, Enter to skip), and adds a `glm` command. Then open a **new** PowerShell window and use `claude`, `glm`, or `pi`.

The rest of this doc is the same thing done by hand, plus troubleshooting.

---

## Manual steps

### 0. Prerequisites (one-time)

Open PowerShell (Start menu → type "PowerShell" → Enter). Install Git and Node with winget:

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

- **Git for Windows** matters because both Claude Code and pi run shell commands through its `bash.exe`.
- **Node.js** is only needed for pi (installed through npm). Claude Code's native installer doesn't need it.

Close and reopen PowerShell after this so `git`/`node`/`npm` are on your PATH.

### 1. Claude Code

```powershell
irm https://claude.ai/install.ps1 | iex
```

This is Anthropic's native Windows installer — a self-contained binary, no WSL and no Node required, and it auto-updates. Then:

```powershell
claude
```

First run opens a browser to log in with your Claude (Anthropic) account, or you can use an `ANTHROPIC_API_KEY`.

If `claude` isn't recognized in a new window: the binary lives in `%USERPROFILE%\.local\bin` — add that folder to your user PATH (Settings → search "environment variables" → edit `Path` → New) and reopen PowerShell.

### 2. pi coding agent

```powershell
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```

Then run `pi` in any project folder. Useful bits:

- `/login` — authenticate with a subscription (Claude Pro/Max, ChatGPT Plus, Copilot) instead of an API key
- `/model` or `Ctrl+L` — switch models; `pi --list-models glm` shows GLM options
- On Windows, pi automatically finds Git Bash (`C:\Program Files\Git\bin\bash.exe`). If you use a nonstandard bash, set `shellPath` in `~/.pi/agent/settings.json`.

### 3. GLM (Z.AI)

1. Sign up at [z.ai](https://z.ai) and (optionally) buy the **GLM Coding Plan** — the cheap flat-rate subscription for coding agents.
2. Create an API key in the Z.AI console (API Keys page).
3. Store it as a user environment variable in PowerShell:

```powershell
[Environment]::SetEnvironmentVariable("ZAI_API_KEY", "<your-key>", "User")
```

Reopen PowerShell. Now wire it into each agent:

**GLM inside pi** — pi's built-in `zai` provider reads `ZAI_API_KEY` automatically. Start pi and pick a GLM model with `/model` (or `pi --model <glm-model-id>`).

**GLM inside Claude Code** — Z.AI exposes an Anthropic-compatible endpoint, so Claude Code works unchanged when two env vars are overridden:

```powershell
$env:ANTHROPIC_BASE_URL   = "https://api.z.ai/api/anthropic"
$env:ANTHROPIC_AUTH_TOKEN = $env:ZAI_API_KEY
claude
```

Don't put those in `~/.claude/settings.json` permanently unless you want *every* Claude Code session on GLM — it would bypass your Anthropic login. The setup script instead adds this `glm` function to your PowerShell profile, so `claude` stays normal and `glm` runs on GLM:

```powershell
function glm {
    $env:ANTHROPIC_BASE_URL   = "https://api.z.ai/api/anthropic"
    $env:ANTHROPIC_AUTH_TOKEN = $env:ZAI_API_KEY
    try { claude @args }
    finally {
        Remove-Item Env:\ANTHROPIC_BASE_URL   -ErrorAction SilentlyContinue
        Remove-Item Env:\ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue
    }
}
```

The coding-plan endpoint maps Claude Code's model tiers to current GLM models (GLM-5.x as of mid-2026) automatically; Z.AI also ships a guided installer (`npx @z_ai/coding-helper`) if you prefer that.

---

## Daily use

| Command | What you get |
|---------|--------------|
| `claude` | Claude Code on your Anthropic/Claude account |
| `glm` | Claude Code on GLM via your Z.AI key (cheap) |
| `pi` | pi agent — switch between Claude, GLM, and others with `/model` |

## Troubleshooting

- **"not recognized as a cmdlet"** after installing → open a new PowerShell window first; if it persists, the install folder isn't on PATH (`%USERPROFILE%\.local\bin` for claude, `%APPDATA%\npm` for pi).
- **Scripts blocked** ("running scripts is disabled") → run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or launch scripts with `powershell -ExecutionPolicy Bypass -File ...`.
- **pi can't run shell commands** → install Git for Windows; pi needs its bash.
- **pi subagents fail with `spawn pi ENOENT`** → known Windows npm-shim issue; update pi (`npm update -g @earendil-works/pi-coding-agent`) or see pi's `docs/windows.md`.
- **`glm` says key not set** → set `ZAI_API_KEY` as shown above and open a new window.
