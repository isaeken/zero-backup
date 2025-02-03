FROM ubuntu:latest

WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl git && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . .
RUN pnpm install
RUN pnpm -r run build

COPY storage/data /data
RUN mkdir /backups

ENTRYPOINT ["/bin/sh", "-c"]

CMD ["node", "/opt/zero-backup/zero-backup.js"]
