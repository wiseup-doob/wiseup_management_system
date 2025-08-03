import { ROUTES } from '../routes/paths'
import { SIDEBAR_IMPORTS } from '../assets/imageImports'

// 메뉴 아이템 타입 정의
export interface MenuItem {
  id: string
  label: string
  path: string
  icon: any
  description?: string
  permissions?: string[]
}

// 사이드바 메뉴 아이템 설정
export const SIDEBAR_MENU_ITEMS: MenuItem[] = [
  {
    id: 'attendance',
    label: '출결 관리',
    path: ROUTES.ATTENDANCE,
    icon: SIDEBAR_IMPORTS.DEFAULT_ICON,
    description: '원생 출결 현황 관리'
  },
  {
    id: 'timetable',
    label: '시간표 관리',
    path: ROUTES.TIMETABLE,
    icon: SIDEBAR_IMPORTS.DEFAULT_ICON,
    description: '수업 시간표 관리'
  },
  {
    id: 'students',
    label: '원생 관리',
    path: ROUTES.STUDENTS,
    icon: SIDEBAR_IMPORTS.DEFAULT_ICON,
    description: '원생 정보 관리'
  },
  {
    id: 'learning',
    label: '학습데이터 관리',
    path: ROUTES.LEARNING,
    icon: SIDEBAR_IMPORTS.DEFAULT_ICON,
    description: '학습 진도 및 성과 관리'
  },
  {
    id: 'grades',
    label: '성적 분석 시스템',
    path: ROUTES.GRADES,
    icon: SIDEBAR_IMPORTS.DEFAULT_ICON,
    description: '성적 분석 및 통계'
  }
]

// 관리자 메뉴 아이템 설정
export const ADMIN_MENU_ITEM: MenuItem = {
  id: 'admin',
  label: '관리자',
  path: ROUTES.HOME,
  icon: SIDEBAR_IMPORTS.DEFAULT_ICON,
  description: '시스템 관리'
}

// 메뉴 아이템 가져오기 함수
export const getMenuItems = (): MenuItem[] => {
  return SIDEBAR_MENU_ITEMS
}

// 특정 메뉴 아이템 가져오기 함수
export const getMenuItemById = (id: string): MenuItem | undefined => {
  return SIDEBAR_MENU_ITEMS.find(item => item.id === id)
}

// 메뉴 아이템 검색 함수
export const searchMenuItems = (searchTerm: string): MenuItem[] => {
  const term = searchTerm.toLowerCase()
  return SIDEBAR_MENU_ITEMS.filter(item => 
    item.label.toLowerCase().includes(term) ||
    item.description?.toLowerCase().includes(term)
  )
} 