// This file reads environment variables and provides defaults
// Environment variables are injected at build/runtime via env.js

// Extend the Window interface to include __env
declare global {
  interface Window {
    __env?: { [key: string]: any };
  }
}

// Helper function to access environment variables with fallbacks
const getEnvVar = (
  key: string,
  defaultValue: string | boolean | number
): any => {
  if (
    typeof window !== 'undefined' &&
    window.__env &&
    window.__env[key] !== undefined
  ) {
    const value = window.__env[key];
    // Convert string 'true'/'false' to boolean if needed
    if (
      typeof defaultValue === 'boolean' &&
      (value === 'true' || value === 'false')
    ) {
      return value === 'true';
    }
    // Convert to number if default is a number
    if (typeof defaultValue === 'number' && !isNaN(Number(value))) {
      return Number(value);
    }
    return value;
  }
  return defaultValue;
};

export const environment = {
  production: getEnvVar('ANGULAR_PRODUCTION', false),
  apiUrl: getEnvVar('BASE_API_URL', 'http://localhost:3001/api'),
  appName: getEnvVar('ANGULAR_APP_NAME', 'GoalTracker'),
  version: getEnvVar('ANGULAR_APP_VERSION', '1.0.0'),
  features: {
    enableLogging: getEnvVar('ANGULAR_ENABLE_LOGGING', true),
    publicGoals: getEnvVar('ANGULAR_FEATURE_PUBLIC_GOALS', true),
  },
  pagination: {
    defaultPageSize: getEnvVar('ANGULAR_DEFAULT_PAGE_SIZE', 20),
    maxPageSize: getEnvVar('ANGULAR_MAX_PAGE_SIZE', 100),
  },
  auth: {
    tokenKey: getEnvVar('ANGULAR_TOKEN_KEY', 'goaltracker_token'),
    userKey: getEnvVar('ANGULAR_USER_KEY', 'goaltracker_user'),
  },
  goals: {
    maxNestingDepth: getEnvVar('ANGULAR_MAX_NESTING_DEPTH', 3),
    maxChildrenLimit: getEnvVar('ANGULAR_MAX_CHILDREN_LIMIT', 10),
  },
  ui: {
    toastDuration: getEnvVar('ANGULAR_TOAST_DURATION', 3000),
  },
};
