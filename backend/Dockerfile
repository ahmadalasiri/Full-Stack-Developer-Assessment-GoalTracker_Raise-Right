# Use Node.js 20 for better crypto module support
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies, including dev dependencies for TypeORM and NestJS
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install netcat for health checks
RUN apk add --no-cache netcat-openbsd

# Expose port
EXPOSE 3001

# Start the application with a simple check for database availability first
CMD sh -c "echo 'Waiting for PostgreSQL to be ready...' && \
           until nc -z $DB_HOST $DB_PORT; do \
             echo 'PostgreSQL is unavailable - sleeping'; \
             sleep 2; \
           done && \
           echo 'PostgreSQL is up - executing command' && \
           npm run start:prod"
