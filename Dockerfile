# Use official Node.js image as base
FROM node:18-slim AS base

# Set working directory
WORKDIR /app

# Install system dependencies for MariaDB client
RUN apt-get update \
    && apt-get install -y --no-install-recommends mariadb-client \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Run as non-root user for security
RUN useradd --uid 1001 --create-home --shell /bin/bash nodejs
USER nodejs

# Start the API
CMD ["npm", "start"] 