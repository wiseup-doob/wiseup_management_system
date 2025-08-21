import type { CreateTeacherRequest } from '@shared/types'

// 5명의 교사 테스트 데이터
export const teachersTestData: CreateTeacherRequest[] = [
  {
    name: '김수학',
    email: 'kim.math@wiseup.ac.kr',
    phone: '010-5001-0001',
    subjects: ['mathematics']
  },
  {
    name: '이영어',
    email: 'lee.english@wiseup.ac.kr',
    phone: '010-5001-0002',
    subjects: ['english']
  },
  {
    name: '박과학',
    email: 'park.science@wiseup.ac.kr',
    phone: '010-5001-0003',
    subjects: ['other'] // 과학 관련 과목들을 'other'로 통합
  },
  {
    name: '최국어',
    email: 'choi.korean@wiseup.ac.kr',
    phone: '010-5001-0004',
    subjects: ['korean', 'other'] // 역사, 지리를 'other'로 통합
  },
  {
    name: '정컴퓨터',
    email: 'jung.computer@wiseup.ac.kr',
    phone: '010-5001-0005',
    subjects: ['other', 'mathematics'] // 컴퓨터 과학을 'other'로 변경
  }
]

// 교사 데이터 생성 함수
export const createTeacherData = (): CreateTeacherRequest[] => {
  return teachersTestData
}

// 전체 교사 수 반환 함수
export const getTotalTeacherCount = (): number => {
  return teachersTestData.length
}
