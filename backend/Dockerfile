FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source
COPY src/ ./src/
COPY tsconfig.json ./

# # Create data directory for bugs.json
# RUN mkdir -p /app/data

# Copy data folder
COPY data/ ./data/

EXPOSE 10000

CMD ["bun", "run", "src/index.ts"]