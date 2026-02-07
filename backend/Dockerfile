# Multi-stage build for production
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
FROM base AS dependencies
RUN npm ci --only=production

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
