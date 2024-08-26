# Use official Node.js image as the base
FROM node:21.7 AS development

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy the client package.json
COPY client/package.json ./client/
COPY client/vite.config.ts ./client/
COPY client/tailwind.config.js ./client/
COPY client/postcss.config.js ./client/

# Copy shared assets
COPY packages ./packages

# Copy the rest of the application code
COPY client ./client

# Install dependencies
RUN pnpm install --no-link

# Default ports (overrided by docker-compose.yml)
ENV CLIENT_PORT=3000

# Expose the port the app runs on
EXPOSE ${CLIENT_PORT}

# Command to serve the app
CMD ["pnpm", "run", "dev"]

# Build stage
FROM node:21.7 AS build

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy the client package.json and other configuration files
COPY client/package.json ./client/
COPY client/vite.config.ts ./client/
COPY client/tailwind.config.js ./client/
COPY client/postcss.config.js ./client/

# Copy shared assets
COPY packages ./packages

# Copy the rest of the application code
COPY client ./client

# Install dependencies
RUN pnpm install --no-link

# Build the application
RUN pnpm --filter client build

# Production stage
FROM nginx:stable-alpine AS production

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/app/client/dist /usr/share/nginx/html

# Copy your custom Nginx configuration file
COPY client/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Set environment variable for port
ENV CLIENT_PORT=3000

# Expose the port the app runs on
EXPOSE ${CLIENT_PORT}

# Command to serve the app
ENTRYPOINT ["nginx","-g","daemon off;"]