// 프론트엔드 API 설정
export const API_CONFIG = {
  // 로컬 Firebase 에뮬레이터 URL (올바른 함수명 포함)
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/wiseupmanagementsystem/us-central1/wiseupApi',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
} as const

// Shared에서 정의된 API 엔드포인트를 그대로 사용
export { API_ENDPOINTS } from '@shared/constants'; 