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
    enableAnalytics: getEnvVar('ANGULAR_ENABLE_ANALYTICS', false),
    enableDebug: getEnvVar('ANGULAR_ENABLE_DEBUG', true),
    mockApi: getEnvVar('ANGULAR_MOCK_API', false),
    publicGoals: getEnvVar('ANGULAR_FEATURE_PUBLIC_GOALS', true),
    goalCategories: getEnvVar('ANGULAR_FEATURE_GOAL_CATEGORIES', true),
    notifications: getEnvVar('ANGULAR_FEATURE_NOTIFICATIONS', false),
    darkMode: getEnvVar('ANGULAR_FEATURE_DARK_MODE', true),
  },
  pagination: {
    defaultPageSize: getEnvVar('ANGULAR_DEFAULT_PAGE_SIZE', 10),
    maxPageSize: getEnvVar('ANGULAR_MAX_PAGE_SIZE', 100),
  },
  auth: {
    tokenKey: getEnvVar('ANGULAR_TOKEN_KEY', 'goaltracker_token'),
    userKey: getEnvVar('ANGULAR_USER_KEY', 'goaltracker_user'),
    sessionTimeout: getEnvVar('ANGULAR_SESSION_TIMEOUT', 86400000), // 24 hours in milliseconds
  },
  goals: {
    maxNestingDepth: getEnvVar('ANGULAR_MAX_NESTING_DEPTH', 3),
    maxChildrenLimit: getEnvVar('ANGULAR_MAX_CHILDREN_LIMIT', 10),
  },
  ui: {
    debounceTime: getEnvVar('ANGULAR_DEBOUNCE_TIME', 300),
    animationDuration: getEnvVar('ANGULAR_ANIMATION_DURATION', 200),
    toastDuration: getEnvVar('ANGULAR_TOAST_DURATION', 3000),
    maxFileSize: getEnvVar('ANGULAR_MAX_FILE_SIZE', 5 * 1024 * 1024), // 5MB
    supportedImageTypes: getEnvVar(
      'ANGULAR_SUPPORTED_IMAGE_TYPES',
      'image/jpeg,image/png,image/gif'
    ).split(','),
  },
  logging: {
    level: getEnvVar('ANGULAR_LOG_LEVEL', 'info'),
    enableConsole: getEnvVar('ANGULAR_ENABLE_LOGGING', true),
    enableRemote: false,
  },
};
