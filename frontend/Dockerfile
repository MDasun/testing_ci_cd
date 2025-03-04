# Use Node.js 20 on Alpine Linux as the base image for building the React app
FROM node:20-alpine AS build

# Install dependencies required for npm packages
RUN apk add --no-cache python3 make g++ curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies without scripts (to avoid Cypress issues)
RUN npm install --legacy-peer-deps --ignore-scripts

# Manually install Cypress
RUN npx cypress install || echo "Cypress installation skipped"

# Copy project files and build the app
COPY . .
RUN npm run build

# Use Caddy as the web server
FROM caddy:2.9.1-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
