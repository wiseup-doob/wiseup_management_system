export const ROUTES = {
  // 메인 페이지
  HOME: '/',

  // 관리 시스템 페이지들
  ATTENDANCE: '/attendance',
  STUDENTS: '/students',
  CLASS: '/class',
  SCHEDULE: '/schedule',

  // 관리자 페이지
  ADMIN_TIMETABLE_VERSIONS: '/admin/timetable-versions'
}

// 페이지별 메타데이터 정의
export const PAGE_METADATA = {
  [ROUTES.HOME]: {
    title: '홈',
    description: 'WiseUp 관리 시스템 홈페이지'
  },
  [ROUTES.ATTENDANCE]: {
    title: '출결 관리',
    description: '원생 출결 현황 관리'
  },
  [ROUTES.STUDENTS]: {
    title: '원생 관리',
    description: '원생 정보 관리'
  },
  [ROUTES.CLASS]: {
    title: '클래스 관리',
    description: '수업 클래스 관리'
  },
  [ROUTES.SCHEDULE]: {
    title: '시간표 관리',
    description: '학생 시간표 관리'
  },
  [ROUTES.ADMIN_TIMETABLE_VERSIONS]: {
    title: '시간표 버전 관리',
    description: '시간표 버전 생성 및 관리'
  }
}