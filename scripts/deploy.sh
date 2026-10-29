#!/usr/bin/env sh
# Builds Purrgress and uploads the finished build to your own server.
# Settings live in .env.deploy (template: .env.deploy.example).
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env.deploy ]; then
  echo "Missing: .env.deploy – copy .env.deploy.example to .env.deploy and enter your server." >&2
  exit 1
fi

# shellcheck disable=SC1091
. ./.env.deploy
: "${DEPLOY_HOST:?DEPLOY_HOST is missing in .env.deploy}"
: "${DEPLOY_PATH:?DEPLOY_PATH is missing in .env.deploy}"

npm run build
rsync -avz --delete dist/ "$DEPLOY_HOST:$DEPLOY_PATH/"

echo "Done: $DEPLOY_PATH on $DEPLOY_HOST is up to date."
