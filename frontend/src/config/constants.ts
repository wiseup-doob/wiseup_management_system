export const APP_CONFIG = {
  NAME: 'WiseUp Management System',
  VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development'
};

export const API_CONFIG = {
  BASE_URL: 'https://us-central1-wiseupmanagementsystem-a6189.cloudfunctions.net/wiseupApi',
  TIMEOUT: 10000
};

export const ATTENDANCE_CONFIG = {
  SEAT_COUNT: 48,
  ROWS: 8,
  COLS: 6,
  STATUSES: {
    PRESENT: 'present',
    DISMISSED: 'dismissed',
    UNAUTHORIZED_ABSENT: 'unauthorized_absent',
    AUTHORIZED_ABSENT: 'authorized_absent'
  }
};

export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  SIDEBAR_WIDTH: 400,
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
  }
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  API_ERROR: 'API 요청 중 오류가 발생했습니다.',
  VALIDATION_ERROR: '입력 데이터가 올바르지 않습니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.'
}; 