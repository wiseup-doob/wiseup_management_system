// 프론트엔드 API 설정
export const API_CONFIG = {
  // 환경변수를 통한 BASE_URL 설정
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api-xkhcgo7jrq-uc.a.run.app',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
} as const

// Shared에서 정의된 API 엔드포인트를 그대로 사용
export { API_ENDPOINTS } from '@shared/constants'; 