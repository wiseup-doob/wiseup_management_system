export const ROUTES = {
  // 메인 페이지
  HOME: '/',
  
  // 관리 시스템 페이지들
  ATTENDANCE: '/attendance',
  TIMETABLE: '/timetable',
  STUDENTS: '/students',
  LEARNING: '/learning',
  GRADES: '/grades'
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
  [ROUTES.TIMETABLE]: {
    title: '시간표 관리',
    description: '수업 시간표 관리'
  },
  [ROUTES.STUDENTS]: {
    title: '원생 관리',
    description: '원생 정보 관리'
  },
  [ROUTES.LEARNING]: {
    title: '학습데이터 관리',
    description: '학습 진도 및 성과 관리'
  },
  [ROUTES.GRADES]: {
    title: '성적 분석 시스템',
    description: '성적 분석 및 통계'
  }
}