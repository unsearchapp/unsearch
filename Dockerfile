# Use official Node.js image as the base
FROM node:21.7 AS development

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and other config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY client/package.json ./client/

# Copy shared assets
COPY packages/ ./packages

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY backend/ ./backend
COPY client/ ./client

# Default environment variables
ENV NODE_ENV=development
ENV HTTP_PORT=5000
ENV WS_PORT=1234
ENV CLIENT_PORT=3000

# Expose the ports
EXPOSE ${HTTP_PORT}
EXPOSE ${WS_PORT}
EXPOSE ${CLIENT_PORT}

# Define the command to run the app
CMD ["pnpm", "run", "dev:fullstack"]

# Build stage
FROM node:22-slim AS build

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and other config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY client/package.json ./client/
COPY packages/ ./packages

# Install dependencies
RUN pnpm install --no-link

# Copy backend code and build it
COPY backend/ ./backend
RUN pnpm --filter backend build

# Copy client code and build it
COPY client/ ./client
ARG VITE_SELF_HOSTED
RUN VITE_SELF_HOSTED=${VITE_SELF_HOSTED} pnpm --filter client build

# Production stage
FROM nginx:stable-alpine AS production

# Install Node.js
RUN apk add --no-cache nodejs npm

# Copy the built backend dist
COPY --from=build /usr/src/app/backend/dist /usr/src/app/backend/dist
# Copy the built client dist
COPY --from=build /usr/src/app/client/dist /usr/share/nginx/html

# Copy backend dependencies
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/backend/node_modules /usr/src/app/backend/node_modules
COPY --from=build /usr/src/app/packages /usr/src/app/packages

# Copy your custom Nginx configuration file
COPY client/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Set environment variables for production
ENV NODE_ENV=production
ENV HTTP_PORT=5000
ENV WS_PORT=1234
ENV CLIENT_PORT=3000

# Expose the port the app runs on
EXPOSE ${HTTP_PORT}
EXPOSE ${WS_PORT}
EXPOSE ${CLIENT_PORT}

# Command to serve the app
CMD ["sh", "-c", "node /usr/src/app/backend/dist/index.js & nginx -g 'daemon off;'"]

# FROM node:22-slim AS production

# # Set the working directory
# WORKDIR /usr/src/app

# # Copy necessary files from build stage
# COPY --from=build /usr/src/app/backend/dist ./backend/dist
# COPY --from=build /usr/src/app/node_modules ./node_modules
# COPY --from=build /usr/src/app/backend/node_modules ./backend/node_modules
# COPY --from=build /usr/src/app/packages ./packages
# COPY --from=build /usr/src/app/package.json ./

# # Set environment variables for production
# ENV NODE_ENV=production
# ENV HTTP_PORT=5000
# ENV WS_PORT=1234

# # Expose the ports
# EXPOSE ${HTTP_PORT}
# EXPOSE ${WS_PORT}

# # Command for production mode
# CMD ["node", "backend/dist/index.js"]