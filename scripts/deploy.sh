#!/usr/bin/env sh
# Baut Purrgress und lädt den fertigen Build auf den eigenen Server.
# Einstellungen stehen in .env.deploy (Vorlage: .env.deploy.example).
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env.deploy ]; then
  echo "Fehlt: .env.deploy – kopiere .env.deploy.example nach .env.deploy und trage deinen Server ein." >&2
  exit 1
fi

# shellcheck disable=SC1091
. ./.env.deploy
: "${DEPLOY_HOST:?DEPLOY_HOST fehlt in .env.deploy}"
: "${DEPLOY_PATH:?DEPLOY_PATH fehlt in .env.deploy}"

npm run build
rsync -avz --delete dist/ "$DEPLOY_HOST:$DEPLOY_PATH/"

echo "Fertig: $DEPLOY_PATH auf $DEPLOY_HOST ist aktuell."
