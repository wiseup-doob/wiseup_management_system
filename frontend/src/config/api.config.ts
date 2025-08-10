// 프론트엔드 API 설정
export const API_CONFIG = {
  // 프로덕션 Firebase Functions URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://us-central1-wiseupmanagementsystem-a6189.cloudfunctions.net/wiseupApi',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
} as const

// Shared에서 정의된 API 엔드포인트를 그대로 사용
export { API_ENDPOINTS } from '@shared/constants'; 