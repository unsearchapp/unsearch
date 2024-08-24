# Use official Node.js image as the base
FROM node:21.7 AS development

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and other config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/

# Copy shared assets
COPY packages/ ./packages

# Install dependencies
RUN pnpm install --no-link

# Copy the rest of the application code
COPY backend/ ./backend

# Default environment variables
ENV NODE_ENV=development
ARG HTTP_PORT=5000
ARG WS_PORT=1234

ENV HTTP_PORT=${HTTP_PORT}
ENV WS_PORT=${WS_PORT}

# Expose the ports
EXPOSE ${HTTP_PORT}
EXPOSE ${WS_PORT}

# Define the command to run the app
CMD ["pnpm", "--filter", "backend", "dev"]

# Build stage
FROM node:22-slim AS build

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and other config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY packages/ ./packages

# Install dependencies
RUN pnpm install --no-link

# Copy the rest of the application code
COPY backend/ ./backend

# Build the application
RUN pnpm --filter backend build

# Production Stage
FROM node:22-slim AS production

# Set the working directory
WORKDIR /usr/src/app

# Copy necessary files from build stage
COPY --from=build /usr/src/app/backend/dist ./backend/dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/backend/node_modules ./backend/node_modules
COPY --from=build /usr/src/app/packages ./packages
COPY --from=build /usr/src/app/package.json ./

# Set environment variables for production
ENV NODE_ENV=production
ARG HTTP_PORT=5000
ARG WS_PORT=1234

ENV HTTP_PORT=${HTTP_PORT}
ENV WS_PORT=${WS_PORT}

# Expose the ports
EXPOSE ${HTTP_PORT}
EXPOSE ${WS_PORT}

# Command for production mode
CMD ["node", "backend/dist/index.js"]