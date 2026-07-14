#!/usr/bin/env bash

set -euo pipefail

PROJECT_PATH="."
PROD=false
INSPECT=true
LOGIN=false

usage() {
  cat <<'USAGE'
Usage: deploy-vercel.sh [--path <project-dir>] [--prod] [--preview] [--no-inspect] [--login]

Deploy a local project to Vercel with Vercel CLI authentication.

Environment:
  VERCEL_TOKEN       Optional when the Vercel CLI is already logged in
  VERCEL_ORG_ID      Optional; read from .vercel/project.json when absent
  VERCEL_PROJECT_ID  Optional; read from .vercel/project.json when absent
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --path)
      PROJECT_PATH="${2:-}"
      if [[ -z "$PROJECT_PATH" ]]; then
        echo "Error: --path requires a directory." >&2
        exit 2
      fi
      shift 2
      ;;
    --prod|--production)
      PROD=true
      shift
      ;;
    --preview)
      PROD=false
      shift
      ;;
    --no-inspect)
      INSPECT=false
      shift
      ;;
    --login)
      LOGIN=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ ! -d "$PROJECT_PATH" ]]; then
  echo "Error: Project path does not exist: $PROJECT_PATH" >&2
  exit 1
fi

cd "$PROJECT_PATH"

load_env_var() {
  local name="$1"
  if [[ -n "${!name:-}" ]]; then
    return 0
  fi

  if [[ -f ".env" ]]; then
    local line
    line="$(grep -E "^${name}=" .env 2>/dev/null | tail -n 1 || true)"
    if [[ -n "$line" ]]; then
      export "$name=${line#*=}"
      return 0
    fi
  fi

  return 1
}

open_url() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 || true
  elif command -v start >/dev/null 2>&1; then
    start "$url" >/dev/null 2>&1 || true
  fi
}

json_value() {
  local key="$1"
  local file="$2"

  node -e '
const fs = require("fs");
const key = process.argv[1];
const file = process.argv[2];
try {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  if (data && typeof data[key] === "string") process.stdout.write(data[key]);
} catch {}
' "$key" "$file"
}

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Installing..." >&2
  npm install -g vercel
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "Error: Vercel CLI is still unavailable after installation." >&2
  exit 1
fi

load_env_var VERCEL_TOKEN || true

if [[ -z "${VERCEL_ORG_ID:-}" && -f ".vercel/project.json" ]]; then
  VERCEL_ORG_ID="$(json_value orgId .vercel/project.json)"
  export VERCEL_ORG_ID
fi

if [[ -z "${VERCEL_PROJECT_ID:-}" && -f ".vercel/project.json" ]]; then
  VERCEL_PROJECT_ID="$(json_value projectId .vercel/project.json)"
  export VERCEL_PROJECT_ID
fi

if [[ "$LOGIN" == true && -z "${VERCEL_TOKEN:-}" ]]; then
  echo "Opening Vercel login..." >&2
  open_url "https://vercel.com/login"
  vercel login
fi

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  if ! vercel whoami >/dev/null 2>&1; then
    echo "Error: Vercel CLI is not authenticated." >&2
    echo "Run this to open login and authenticate:" >&2
    echo "  bash \"deploy skills/deploy-to-vercel/vercel-deploy-workbuddy/scripts/deploy-vercel.sh\" --login" >&2
    echo "For unattended deploys, create a token here and add it to WorkBuddy as VERCEL_TOKEN:" >&2
    echo "  https://vercel.com/account/tokens" >&2
    open_url "https://vercel.com/account/tokens"
    exit 1
  fi
fi

DEPLOY_ARGS=(deploy -y --no-wait)
if [[ "$PROD" == true ]]; then
  DEPLOY_ARGS+=(--prod)
fi

echo "Deploying to Vercel..." >&2
if [[ "$PROD" == true ]]; then
  echo "Mode: production" >&2
else
  echo "Mode: preview" >&2
fi

DEPLOY_OUTPUT="$(vercel "${DEPLOY_ARGS[@]}")"
echo "$DEPLOY_OUTPUT"

DEPLOY_URL="$(printf '%s\n' "$DEPLOY_OUTPUT" | grep -Eo 'https://[^[:space:]]+\.vercel\.app[^[:space:]]*' | tail -n 1 || true)"

if [[ -z "$DEPLOY_URL" ]]; then
  echo "Warning: Could not extract a Vercel deployment URL from CLI output." >&2
  exit 0
fi

echo "Deployment URL: $DEPLOY_URL"

if [[ "$INSPECT" == true ]]; then
  echo "Inspecting deployment..." >&2
  vercel inspect "$DEPLOY_URL" || true
fi
