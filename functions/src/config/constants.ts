// 환경 변수 검증 함수
const validateEnvironmentVariables = () => {
  const requiredEnvVars = ['JWT_SECRET', 'NODE_ENV'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  환경 변수가 누락되었습니다: ${missingVars.join(', ')}`);
    console.warn('개발 환경에서는 기본값을 사용합니다.');
    
    // 개발 환경에서 기본값 설정
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'dev-secret-key-change-in-production';
    }
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development';
    }
  }
};

// 환경 변수 검증 실행
validateEnvironmentVariables();

export const APP_CONFIG = {
  NAME: 'WiseUp Management System API',
  VERSION: '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development'
};

export const FIREBASE_CONFIG = {
  PROJECT_ID: 'wiseupmanagementsystem',
  COLLECTIONS: {
    STUDENTS: 'students',
    USERS: 'users',
    ATTENDANCE: 'attendance'
  }
};

export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: '24h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  BCRYPT_ROUNDS: 10
};

export const ATTENDANCE_CONFIG = {
  VALID_STATUSES: ['present', 'dismissed', 'unauthorized_absent', 'authorized_absent'],
  HISTORY_CONFIG: {
    DEFAULT_DAYS: 7,
    MAX_DAYS: 30
  },
  DATA_GENERATION: {
    STUDENT_COUNT: 48,
    ATTENDANCE_WEIGHTS: {
      present: 0.6,
      dismissed: 0.2,
      unauthorized_absent: 0.15,
      authorized_absent: 0.05
    }
  }
};

export const API_CONFIG = {
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15분
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  },
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '30000'), // 30초
  MAX_PAYLOAD_SIZE: '10mb'
};

export const ERROR_MESSAGES = {
  STUDENT_NOT_FOUND: '학생을 찾을 수 없습니다.',
  INVALID_ATTENDANCE_STATUS: '유효하지 않은 출석 상태입니다.',
  DATABASE_ERROR: '데이터베이스 오류가 발생했습니다.',
  VALIDATION_ERROR: '입력 데이터가 올바르지 않습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.',
  INVALID_TOKEN: '유효하지 않은 토큰입니다.',
  TOKEN_EXPIRED: '토큰이 만료되었습니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  USER_ALREADY_EXISTS: '이미 존재하는 사용자입니다.',
  MISSING_REQUIRED_FIELD: '필수 필드가 누락되었습니다.',
  INVALID_REQUEST_DATA: '요청 데이터가 올바르지 않습니다.'
}; 