# Backend Dockerfile — uses tsx to run TypeScript directly
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files first to install deps
COPY package.json package-lock.json* ./

# Install all dependencies (including dev for tsx)
RUN npm ci --silent

# Copy rest of the source
COPY . ./

# Build step optional (TypeScript is run with tsx)
# Expose port
EXPOSE 3001

# Run migrations then start server
CMD ["/bin/sh", "-c", "npm run migrate:prod && npm run start:prod"]
