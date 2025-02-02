FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

COPY apps/cli/package.json apps/cli/
COPY packages/shared-utils/package.json packages/shared-utils/
COPY packages/shared-types/package.json packages/shared-types/

RUN pnpm install

COPY . .

RUN pnpm -r run build

FROM ubuntu:latest AS runner

WORKDIR /opt/zero-backup

COPY --from=builder /app/apps/cli/dist/zero-backup ./zero-backup

RUN chmod +x /opt/zero-backup/zero-backup

ENTRYPOINT ["/bin/sh", "-c"]

CMD ["/opt/zero-backup/zero-backup"]

