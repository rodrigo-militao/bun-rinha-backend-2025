# --- BUILD STAGE ---
FROM oven/bun:1.1.18 as builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile # O Bun usará o bun.lock automaticamente

COPY . . 

RUN bun build src/api.ts --target=bun --outfile=dist/api.js --minify
RUN bun build src/worker.ts --target=bun --outfile=dist/worker.js --minify

# --- RUNTIME STAGE ---
FROM oven/bun:1.1.18-alpine as runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/.env ./.env 

EXPOSE 3000

CMD ["bun", "dist/api.js"]
