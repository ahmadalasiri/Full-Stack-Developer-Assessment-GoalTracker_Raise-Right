const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Create env.js content
let envJsContent = `window.__env = window.__env || {};\n`;

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
let envConfig = {};

try {
  if (fs.existsSync(envPath)) {
    // Load environment variables from .env file
    envConfig = dotenv.parse(fs.readFileSync(envPath));
    console.log(".env file found, loading variables");
  } else {
    console.log("No .env file found, using process.env variables");
  }
} catch (err) {
  console.error("Error reading .env file:", err);
}

// First add variables from .env file
for (const key in envConfig) {
  if (envConfig.hasOwnProperty(key)) {
    let value = envConfig[key];

    // Handle string values
    if (typeof value === "string") {
      value = `"${value}"`;
    }

    envJsContent += `window.__env['${key}'] = ${value};\n`;
  }
}

// Then add important variables from process.env (for Vercel/production)
const criticalVars = ['BASE_API_URL', 'ANGULAR_PRODUCTION'];
for (const key of criticalVars) {
  if (process.env[key]) {
    envJsContent += `window.__env['${key}'] = "${process.env[key]}";\n`;
  }
}

// Add default values for critical variables if not set
if (!process.env.BASE_API_URL && !envConfig.BASE_API_URL) {
  envJsContent += `window.__env['BASE_API_URL'] = "https://api.goal-tracker.ahmadalasiri.info/api";\n`;
}

// Make sure assets directory exists
const assetsDir = path.resolve(process.cwd(), 'src/assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log("Created assets directory");
}

// Write env.js file
fs.writeFileSync(path.join(assetsDir, "env.js"), envJsContent);
console.log("Environment variables have been written to src/assets/env.js");
