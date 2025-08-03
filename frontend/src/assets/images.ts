// 이미지 경로를 전역적으로 관리하는 파일

// 사이드바 관련 이미지
export const SIDEBAR_IMAGES = {
  LOGO: '/src/img/Sidebar_button_logo.png',
  DEFAULT_ICON: '/src/img/Sidebar_button_logo.png',
  ADMIN_ICON: '/src/img/admin-icon.png',
  ATTENDANCE_ICON: '/src/img/attendance-icon.png',
  TIMETABLE_ICON: '/src/img/timetable-icon.png',
  STUDENTS_ICON: '/src/img/students-icon.png',
  LEARNING_ICON: '/src/img/learning-icon.png',
  GRADES_ICON: '/src/img/grades-icon.png'
} as const

// 버튼 관련 이미지
export const BUTTON_IMAGES = {
  PRIMARY: '/src/img/button-primary.png',
  SECONDARY: '/src/img/button-secondary.png',
  SUCCESS: '/src/img/button-success.png',
  WARNING: '/src/img/button-warning.png',
  ERROR: '/src/img/button-error.png'
} as const

// 아이콘 관련 이미지
export const ICON_IMAGES = {
  HOME: '/src/img/icons/home.png',
  SETTINGS: '/src/img/icons/settings.png',
  USER: '/src/img/icons/user.png',
  SEARCH: '/src/img/icons/search.png',
  ADD: '/src/img/icons/add.png',
  EDIT: '/src/img/icons/edit.png',
  DELETE: '/src/img/icons/delete.png',
  SAVE: '/src/img/icons/save.png',
  CANCEL: '/src/img/icons/cancel.png'
} as const

// 로고 관련 이미지
export const LOGO_IMAGES = {
  MAIN_LOGO: '/src/img/logo/main-logo.png',
  SIDEBAR_LOGO: '/src/img/logo/sidebar-logo.png',
  FOOTER_LOGO: '/src/img/logo/footer-logo.png'
} as const

// 배경 이미지
export const BACKGROUND_IMAGES = {
  LOGIN_BG: '/src/img/backgrounds/login-bg.jpg',
  DASHBOARD_BG: '/src/img/backgrounds/dashboard-bg.jpg',
  HERO_BG: '/src/img/backgrounds/hero-bg.jpg'
} as const

// 모든 이미지 경로를 하나의 객체로 통합
export const IMAGES = {
  SIDEBAR: SIDEBAR_IMAGES,
  BUTTON: BUTTON_IMAGES,
  ICON: ICON_IMAGES,
  LOGO: LOGO_IMAGES,
  BACKGROUND: BACKGROUND_IMAGES
} as const

// 이미지 경로 타입 정의
export type ImagePath = typeof IMAGES[keyof typeof IMAGES][keyof typeof IMAGES[keyof typeof IMAGES]]

// 이미지 경로 유효성 검사 함수
export const isValidImagePath = (path: string): path is ImagePath => {
  return Object.values(IMAGES).some(category => 
    Object.values(category).includes(path as any)
  )
}

// 이미지 경로 가져오기 함수
export const getImagePath = (category: keyof typeof IMAGES, key: string): string => {
  const imageCategory = IMAGES[category]
  if (key in imageCategory) {
    return imageCategory[key as keyof typeof imageCategory]
  }
  throw new Error(`Image not found: ${category}.${key}`)
} 