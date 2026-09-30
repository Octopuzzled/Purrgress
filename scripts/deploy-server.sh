#!/usr/bin/env sh
# Lädt die Sync-Server-Dateien (server/) hoch und startet PocketBase neu.
# Die Datenbank (pb_data) wird dabei nie angefasst.
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env.deploy ]; then
  echo "Fehlt: .env.deploy – kopiere .env.deploy.example nach .env.deploy und trage deinen Server ein." >&2
  exit 1
fi

# shellcheck disable=SC1091
. ./.env.deploy
: "${DEPLOY_HOST:?DEPLOY_HOST fehlt in .env.deploy}"
: "${SERVER_PATH:?SERVER_PATH fehlt in .env.deploy}"

rsync -avz --exclude pb_data --exclude .gitignore server/ "$DEPLOY_HOST:$SERVER_PATH/"
ssh "$DEPLOY_HOST" "cd '$SERVER_PATH' && docker compose up -d --build"

echo "Fertig: Sync-Server in $SERVER_PATH auf $DEPLOY_HOST ist aktuell."
