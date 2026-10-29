#!/usr/bin/env sh
# Uploads the sync server files (server/) and restarts PocketBase.
# The database (pb_data) is never touched.
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env.deploy ]; then
  echo "Missing: .env.deploy – copy .env.deploy.example to .env.deploy and enter your server." >&2
  exit 1
fi

# shellcheck disable=SC1091
. ./.env.deploy
: "${DEPLOY_HOST:?DEPLOY_HOST is missing in .env.deploy}"
: "${SERVER_PATH:?SERVER_PATH is missing in .env.deploy}"

rsync -avz --exclude pb_data --exclude .gitignore server/ "$DEPLOY_HOST:$SERVER_PATH/"
ssh "$DEPLOY_HOST" "cd '$SERVER_PATH' && docker compose up -d --build"

echo "Done: sync server in $SERVER_PATH on $DEPLOY_HOST is up to date."
