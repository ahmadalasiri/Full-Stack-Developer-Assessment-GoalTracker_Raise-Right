const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from .env file
const envConfig = dotenv.parse(fs.readFileSync(".env"));

// Create env.js content
let envJsContent = `window.__env = window.__env || {};\n`;

// Add each environment variable to window.__env
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

// Write env.js file
fs.writeFileSync("src/assets/env.js", envJsContent);
console.log("Environment variables have been written to src/assets/env.js");
