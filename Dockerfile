# Build stage
FROM node:24-slim AS base
WORKDIR /app

# Copy manifest and install only production deps (currently none)
COPY package*.json ./
RUN npm install --omit=dev || true

# Copy source
COPY . .

# Ensure data directory exists and is writable for SQLite
RUN mkdir -p /app/data && chmod -R 777 /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["node", "server.js"]
