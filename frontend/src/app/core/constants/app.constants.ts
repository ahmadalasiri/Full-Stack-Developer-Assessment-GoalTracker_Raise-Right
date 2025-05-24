// Application-wide constants
export const APP_CONSTANTS = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },

  // API Response Messages
  MESSAGES: {
    LOADING: 'Loading...',
    NO_DATA: 'No data available',
    ERROR_GENERIC: 'An error occurred. Please try again.',
    ERROR_NETWORK: 'Network error. Please check your connection.',
    SUCCESS_SAVE: 'Successfully saved',
    SUCCESS_DELETE: 'Successfully deleted',
    SUCCESS_UPDATE: 'Successfully updated',
    CONFIRM_DELETE: 'Are you sure you want to delete this item?',
  },

  // UI Constants
  UI: {
    DEBOUNCE_TIME: 300,
    ANIMATION_DURATION: 200,
    TOAST_DURATION: 3000,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  },

  // Validation Rules
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MIN_USERNAME_LENGTH: 3,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_TITLE_LENGTH: 255,
  },

  // Date Formats
  DATE_FORMATS: {
    DISPLAY: 'MMM dd, yyyy',
    API: 'yyyy-MM-dd',
    FULL: 'MMM dd, yyyy HH:mm',
  },

  // Storage Keys
  STORAGE_KEYS: {
    THEME: 'theme',
    LANGUAGE: 'language',
    USER_PREFERENCES: 'user_preferences',
  },
} as const;

// Goal specific constants
export const GOAL_CONSTANTS = {
  MAX_NESTING_DEPTH: 3,
  DEFAULT_PAGE_SIZE: 10,
  MAX_CHILDREN_LIMIT: 3,
  STATUS_OPTIONS: [
    'Not Started',
    'In Progress',
    'Completed',
    'On Hold',
  ] as const,
} as const;

// Type definitions for constants
export type StatusOption = (typeof GOAL_CONSTANTS.STATUS_OPTIONS)[number];
