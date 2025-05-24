# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create env.js file for runtime environment variables
RUN mkdir -p dist/frontend/browser && \
    echo "window.__env = window.__env || {};" > dist/frontend/browser/env.js && \
    echo "window.__env.API_URL = \"${API_URL:-http://localhost:3001/api}\";" >> dist/frontend/browser/env.js

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Create a script to dynamically replace environment variables at container startup
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-env-config.sh && \
    echo 'echo "window.__env = window.__env || {};" > /usr/share/nginx/html/env.js' >> /docker-entrypoint.d/40-env-config.sh && \
    echo 'echo "window.__env.API_URL = \"${API_URL:-https://api.goal-tracker.ahmadalasiri.info/api}\";" >> /usr/share/nginx/html/env.js' >> /docker-entrypoint.d/40-env-config.sh && \
    chmod +x /docker-entrypoint.d/40-env-config.sh

# Configure nginx to handle Angular routing
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 4200

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
