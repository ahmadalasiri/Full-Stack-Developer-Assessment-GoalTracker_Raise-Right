export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
  appName: 'GoalTracker',
  version: '1.0.0',
  features: {
    enableLogging: true,
    enableAnalytics: false,
    enableDebug: true,
    mockApi: false,
    publicGoals: true,
    goalCategories: true,
    notifications: false,
    darkMode: true,
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  auth: {
    tokenKey: 'goaltracker_token',
    userKey: 'goaltracker_user',
    sessionTimeout: 86400000, // 24 hours in milliseconds
  },
  goals: {
    maxNestingDepth: 3,
    maxChildrenLimit: 10,
  },
  ui: {
    debounceTime: 300,
    animationDuration: 200,
    toastDuration: 3000,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  },
  logging: {
    level: 'info',
    enableConsole: true,
    enableRemote: false,
  },
};
