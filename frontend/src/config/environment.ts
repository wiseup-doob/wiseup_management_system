// 환경 설정
export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/wiseupmanagementsystem/us-central1/api',
  },
  firebase: {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wiseupmanagementsystem',
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// 테스트 환경 확인
export const isTestEnvironment = () => {
  return config.isDevelopment || window.location.hostname === 'localhost';
};

// API URL 동적 생성
export const getApiUrl = (endpoint: string) => {
  return `${config.api.baseURL}${endpoint}`;
}; 