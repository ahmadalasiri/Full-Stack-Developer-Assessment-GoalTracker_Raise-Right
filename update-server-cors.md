# Update CORS Settings on Server

Follow these steps to update the CORS settings on your production server:

## SSH into your server

```bash
ssh your-username@your-server-ip
```

## Update your production environment configuration

If using Docker on your server:

```bash
# Navigate to your deployment directory
cd /path/to/your/goal-tracker

# Stop the running containers
docker-compose down

# Update the docker-compose.yml file with the new CORS settings
# Make sure this line exists in the backend service's environment section:
# - CORS_ORIGINS=http://localhost:4200,https://goal-tracker-virid-eight.vercel.app

# Pull the latest changes if you pushed to a repository
git pull

# Rebuild and restart the containers
docker-compose up -d --build backend
```

If running directly with Node/NestJS:

```bash
# Navigate to your backend directory
cd /path/to/your/goal-tracker/backend

# Create or update .env file
echo "CORS_ORIGINS=http://localhost:4200,https://goal-tracker-virid-eight.vercel.app" >> .env

# Restart the NestJS application
# If using pm2:
pm2 restart your-app-name
# If using systemd:
sudo systemctl restart your-service-name
```

## Verify the CORS settings

After restarting your service, you can verify the CORS settings by making a test request:

```bash
curl -I -H "Origin: https://goal-tracker-virid-eight.vercel.app" \
  https://api.goal-tracker.ahmadalasiri.info/api/auth/login
```

The response should include:

```
Access-Control-Allow-Origin: https://goal-tracker-virid-eight.vercel.app
```

## Additional CORS debugging

If you're still having issues, you might need to ensure your NestJS application is properly handling the CORS origins:

1. Add some debugging to your `main.ts`:

```typescript
// Add this after setting corsOrigins
console.log("CORS Origins configured as:", corsOrigins);
console.log("Parsed Origins:", origins);
```

2. Restart your server and check the logs:

```bash
docker logs goaltracker-backend
# or
pm2 logs your-app-name
```

## Other potential issues

- If using a reverse proxy like Nginx, ensure it's not stripping CORS headers
- Check if there are any middleware or other services that might be interfering with CORS
- Ensure your backend server is not caching the old CORS configuration
