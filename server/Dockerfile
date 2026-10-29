# PocketBase für den Purrgress-Sync.
# Version bewusst fest: vor einem Update das Changelog lesen und pb_data sichern.
FROM alpine:3.22

ARG PB_VERSION=0.40.4
# SHA-256 aus checksums.txt des Releases. Bei einem Versionswechsel mit aktualisieren –
# so landet nie eine manipulierte oder beschädigte Datei im Container.
ARG PB_SHA256=9042ec818570e79c3628dadcd0a756c1496d9e1173918ec409d133c02f82e5fa

RUN apk add --no-cache ca-certificates \
 && apk add --no-cache --virtual .fetch unzip wget \
 && wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -O /tmp/pb.zip \
 && echo "${PB_SHA256}  /tmp/pb.zip" | sha256sum -c - \
 && unzip /tmp/pb.zip pocketbase -d /pb \
 && rm /tmp/pb.zip \
 && apk del .fetch

EXPOSE 8090

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data", "--migrationsDir=/pb/pb_migrations", "--hooksDir=/pb/pb_hooks"]
