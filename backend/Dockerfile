# Use official Node.js image as the base
FROM node:21.7

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy backend/package.json
COPY backend/package.json ./backend/

# Install dependencies
RUN pnpm install --no-link

# Copy the rest of the application code
COPY backend/ ./backend

# Copy shared assets
COPY packages/ ./packages

# Default ports (overrided by docker-compose.yml)
ARG HTTP_PORT=5000
ARG WS_PORT=1234

ENV HTTP_PORT=${HTTP_PORT}
ENV WS_PORT=${WS_PORT}

# Expose the port the app runs on
EXPOSE ${HTTP_PORT}
EXPOSE ${WS_PORT}

# Define the command to run the app
CMD ["pnpm", "run", "dev:backend"]
