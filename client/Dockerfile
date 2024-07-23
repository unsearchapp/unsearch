# Use official Node.js image as the base
FROM node:21.7

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
ARG CLIENT_PORT=3000

ENV CLIENT_PORT=${CLIENT_PORT}

# Expose the port the app runs on
EXPOSE ${CLIENT_PORT}

# Command to serve the app
CMD ["pnpm", "run", "dev"]

