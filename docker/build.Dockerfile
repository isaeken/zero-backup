FROM ubuntu:latest AS builder

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
RUN find . -name "node_modules" -type d -not -path "./node_modules" -exec rm -rf {} +
RUN rm -rf node_modules
RUN pnpm install --production --node-linker=hoisted

FROM ubuntu:latest AS runner

WORKDIR /opt/zero-backup

RUN apt-get update && \
    apt-get install -y curl git && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/cli/dist/zero-backup.js ./zero-backup.js

COPY storage/data /data
RUN mkdir /backups

RUN chmod +x /opt/zero-backup/zero-backup.js

ENTRYPOINT ["/bin/sh", "-c"]

CMD ["node", "/opt/zero-backup/zero-backup.js"]

