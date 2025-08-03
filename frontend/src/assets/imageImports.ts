// 실제 이미지 파일들을 import하는 유틸리티

// 사이드바 이미지 imports
import sidebarLogo from '../img/Sidebar_button_logo.png'

// 사이드바 관련 이미지 객체
export const SIDEBAR_IMPORTS = {
  LOGO: sidebarLogo,
  DEFAULT_ICON: sidebarLogo,
  // 실제 이미지 파일이 있을 때 추가
  // ADMIN_ICON: adminIcon,
  // ATTENDANCE_ICON: attendanceIcon,
  // TIMETABLE_ICON: timetableIcon,
  // STUDENTS_ICON: studentsIcon,
  // LEARNING_ICON: learningIcon,
  // GRADES_ICON: gradesIcon
} as const

// 버튼 관련 이미지 객체
export const BUTTON_IMPORTS = {
  // 실제 이미지 파일이 있을 때 추가
  // PRIMARY: primaryButton,
  // SECONDARY: secondaryButton,
  // SUCCESS: successButton,
  // WARNING: warningButton,
  // ERROR: errorButton
} as const

// 아이콘 관련 이미지 객체
export const ICON_IMPORTS = {
  // 실제 이미지 파일이 있을 때 추가
  // HOME: homeIcon,
  // SETTINGS: settingsIcon,
  // USER: userIcon,
  // SEARCH: searchIcon,
  // ADD: addIcon,
  // EDIT: editIcon,
  // DELETE: deleteIcon,
  // SAVE: saveIcon,
  // CANCEL: cancelIcon
} as const

// 로고 관련 이미지 객체
export const LOGO_IMPORTS = {
  // 실제 이미지 파일이 있을 때 추가
  // MAIN_LOGO: mainLogo,
  // SIDEBAR_LOGO: sidebarLogo,
  // FOOTER_LOGO: footerLogo
} as const

// 배경 이미지 객체
export const BACKGROUND_IMPORTS = {
  // 실제 이미지 파일이 있을 때 추가
  // LOGIN_BG: loginBg,
  // DASHBOARD_BG: dashboardBg,
  // HERO_BG: heroBg
} as const

// 모든 이미지 import를 하나의 객체로 통합
export const IMAGE_IMPORTS = {
  SIDEBAR: SIDEBAR_IMPORTS,
  BUTTON: BUTTON_IMPORTS,
  ICON: ICON_IMPORTS,
  LOGO: LOGO_IMPORTS,
  BACKGROUND: BACKGROUND_IMPORTS
} as const

// 이미지 import 타입 정의
export type ImageImport = typeof IMAGE_IMPORTS[keyof typeof IMAGE_IMPORTS][keyof typeof IMAGE_IMPORTS[keyof typeof IMAGE_IMPORTS]]

// 이미지 import 가져오기 함수
export const getImageImport = (category: keyof typeof IMAGE_IMPORTS, key: string): ImageImport => {
  const imageCategory = IMAGE_IMPORTS[category]
  if (key in imageCategory) {
    return imageCategory[key as keyof typeof imageCategory]
  }
  throw new Error(`Image import not found: ${category}.${key}`)
}

// 기본 이미지 fallback
export const DEFAULT_IMAGES = {
  SIDEBAR_ICON: sidebarLogo,
  BUTTON_ICON: sidebarLogo,
  ICON: sidebarLogo,
  LOGO: sidebarLogo
} as const 