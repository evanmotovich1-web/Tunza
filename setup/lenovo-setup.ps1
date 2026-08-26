<#
  lenovo-setup.ps1 — one-shot setup for a Windows (Lenovo) machine in PowerShell.

  Installs:
    - Git for Windows   (Claude Code and pi both use its bash.exe to run shell commands)
    - Node.js LTS       (needed to install the pi coding agent via npm)
    - Claude Code       (Anthropic's native Windows build — no Node needed for this one)
    - pi coding agent   (npm global package: @earendil-works/pi-coding-agent)
    - GLM via z.ai      (stores your Z.AI API key and adds a `glm` command that runs
                         Claude Code against GLM instead of your Anthropic account)

  How to run (regular PowerShell window, no admin needed — winget may prompt to elevate):
    powershell -ExecutionPolicy Bypass -File .\lenovo-setup.ps1
#>

$ErrorActionPreference = "Stop"

function Refresh-Path {
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [Environment]::GetEnvironmentVariable("Path", "User")
}

function Test-Cmd($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }

Write-Host "==> Checking for winget..." -ForegroundColor Cyan
if (-not (Test-Cmd winget)) {
    Write-Error "winget not found. Install 'App Installer' from the Microsoft Store, then re-run this script."
}

# 1. Git for Windows
if (Test-Cmd git) {
    Write-Host "Git already installed: $(git --version)"
} else {
    Write-Host "==> Installing Git for Windows..." -ForegroundColor Cyan
    winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    Refresh-Path
}

# 2. Node.js LTS (for pi; Claude Code's native build doesn't need it)
if (Test-Cmd node) {
    Write-Host "Node already installed: $(node --version)"
} else {
    Write-Host "==> Installing Node.js LTS..." -ForegroundColor Cyan
    winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
    Refresh-Path
}

# 3. Claude Code (native Windows installer, self-contained, auto-updates)
if (Test-Cmd claude) {
    Write-Host "Claude Code already installed: $(claude --version)"
} else {
    Write-Host "==> Installing Claude Code..." -ForegroundColor Cyan
    irm https://claude.ai/install.ps1 | iex
    # The native installer puts claude.exe in %USERPROFILE%\.local\bin — make sure it's on PATH
    $claudeBin = Join-Path $env:USERPROFILE ".local\bin"
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($userPath -notlike "*$claudeBin*") {
        [Environment]::SetEnvironmentVariable("Path", "$userPath;$claudeBin", "User")
    }
    Refresh-Path
}

# 4. pi coding agent
if (Test-Cmd pi) {
    Write-Host "pi already installed."
} else {
    Write-Host "==> Installing pi coding agent..." -ForegroundColor Cyan
    npm install -g --ignore-scripts @earendil-works/pi-coding-agent
    Refresh-Path
}

# 5. GLM (z.ai): store the API key and add a `glm` launcher for Claude Code
Write-Host ""
$zaiKey = Read-Host "Paste your Z.AI API key for GLM (from z.ai -> API Keys), or press Enter to skip"
if ($zaiKey) {
    # pi's zai provider reads ZAI_API_KEY; the glm function below reuses it for Claude Code
    [Environment]::SetEnvironmentVariable("ZAI_API_KEY", $zaiKey, "User")
    $env:ZAI_API_KEY = $zaiKey
    Write-Host "Saved ZAI_API_KEY as a user environment variable."
}

# `glm` = Claude Code pointed at z.ai's GLM endpoint for that one session only.
# Plain `claude` keeps using your normal Anthropic login.
$glmFunc = @'

# --- added by lenovo-setup.ps1: run Claude Code against z.ai GLM ---
function glm {
    if (-not $env:ZAI_API_KEY) { Write-Error "ZAI_API_KEY is not set. Get a key from z.ai and run: [Environment]::SetEnvironmentVariable('ZAI_API_KEY','<key>','User')"; return }
    $env:ANTHROPIC_BASE_URL   = "https://api.z.ai/api/anthropic"
    $env:ANTHROPIC_AUTH_TOKEN = $env:ZAI_API_KEY
    try { claude @args }
    finally {
        Remove-Item Env:\ANTHROPIC_BASE_URL   -ErrorAction SilentlyContinue
        Remove-Item Env:\ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue
    }
}
'@
if (-not (Test-Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force | Out-Null }
if (-not (Select-String -Path $PROFILE -Pattern "function glm" -Quiet)) {
    Add-Content -Path $PROFILE -Value $glmFunc
    Write-Host "Added 'glm' command to your PowerShell profile ($PROFILE)."
}

Write-Host ""
Write-Host "Done. Close this window, open a NEW PowerShell window, then:" -ForegroundColor Green
Write-Host "  claude    # first run opens a browser to log in with your Claude account"
Write-Host "  glm       # Claude Code running on GLM through your z.ai key"
Write-Host "  pi        # pi agent: /login for Claude subscription, or it uses ZAI_API_KEY for GLM"
