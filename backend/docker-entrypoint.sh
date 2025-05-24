#!/bin/sh
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until nc -z $DB_HOST $DB_PORT; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "PostgreSQL is up - continuing"

# Run database initialization (TypeORM will create tables via synchronize:true)
echo "Initializing database..."

# If we want to run migrations later, we can uncomment this
# echo "Running database migrations..."
# npm run migration:run

# Load seed data after schema is created
echo "Loading test data..."
npx ts-node -r tsconfig-paths/register src/database/seeds/load-test-data.ts || echo "Failed to load test data, continuing anyway..."

# Start the application
echo "Starting application..."
# Check if the JS file exists
if [ -f "dist/main.js" ]; then
  echo "Starting from dist/main.js..."
  exec "$@"
else
  echo "dist/main.js not found, starting in development mode..."
  exec npm run start:dev
fi
