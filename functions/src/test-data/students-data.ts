import type { CreateStudentRequest } from '@shared/types'

// 64명의 학생 테스트 데이터
export const studentsTestData: CreateStudentRequest[] = [
  // 초1 학생들 (20명)
  {
    name: '김민수',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0001',
      email: 'kim.minsu@test.com',
      address: '서울시 강남구 테헤란로 123'
    }
  },
  {
    name: '이지은',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0002',
      email: 'lee.jieun@test.com',
      address: '서울시 강남구 테헤란로 124'
    }
  },
  {
    name: '박준호',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0003',
      email: 'park.junho@test.com',
      address: '서울시 강남구 테헤란로 125'
    }
  },
  {
    name: '최수진',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0004',
      email: 'choi.sujin@test.com',
      address: '서울시 강남구 테헤란로 126'
    }
  },
  {
    name: '정현우',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0005',
      email: 'jung.hyunwoo@test.com',
      address: '서울시 강남구 테헤란로 127'
    }
  },
  {
    name: '한소영',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0006',
      email: 'han.soyoung@test.com',
      address: '서울시 강남구 테헤란로 128'
    }
  },
  {
    name: '윤도현',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0007',
      email: 'yoon.dohyun@test.com',
      address: '서울시 강남구 테헤란로 129'
    }
  },
  {
    name: '송미래',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0008',
      email: 'song.mirae@test.com',
      address: '서울시 강남구 테헤란로 130'
    }
  },
  {
    name: '임태영',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0009',
      email: 'lim.taeyoung@test.com',
      address: '서울시 강남구 테헤란로 131'
    }
  },
  {
    name: '강하은',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0010',
      email: 'kang.haeun@test.com',
      address: '서울시 강남구 테헤란로 132'
    }
  },
  {
    name: '조성민',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0011',
      email: 'cho.sungmin@test.com',
      address: '서울시 강남구 테헤란로 133'
    }
  },
  {
    name: '백지원',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0012',
      email: 'baek.jiwon@test.com',
      address: '서울시 강남구 테헤란로 134'
    }
  },
  {
    name: '남궁준',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0013',
      email: 'namgung.jun@test.com',
      address: '서울시 강남구 테헤란로 135'
    }
  },
  {
    name: '서연우',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0014',
      email: 'seo.yeonwoo@test.com',
      address: '서울시 강남구 테헤란로 136'
    }
  },
  {
    name: '오승현',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0015',
      email: 'oh.seunghyun@test.com',
      address: '서울시 강남구 테헤란로 137'
    }
  },
  {
    name: '신유진',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0016',
      email: 'shin.yujin@test.com',
      address: '서울시 강남구 테헤란로 138'
    }
  },
  {
    name: '권민석',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0017',
      email: 'kwon.minseok@test.com',
      address: '서울시 강남구 테헤란로 139'
    }
  },
  {
    name: '황서연',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0018',
      email: 'hwang.seoyeon@test.com',
      address: '서울시 강남구 테헤란로 140'
    }
  },
  {
    name: '안준서',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0019',
      email: 'ahn.junseo@test.com',
      address: '서울시 강남구 테헤란로 141'
    }
  },
  {
    name: '유재현',
    grade: '초1',
    firstAttendanceDate: new Date('2024-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-1001-0020',
      email: 'yoo.jaehyun@test.com',
      address: '서울시 강남구 테헤란로 142'
    }
  },

  // 2학년 학생들 (22명)
  {
    name: '김서연',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0001',
      email: 'kim.seoyeon@test.com',
      address: '서울시 강남구 테헤란로 200'
    }
  },
  {
    name: '이민준',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0002',
      email: 'lee.minjun@test.com',
      address: '서울시 강남구 테헤란로 201'
    }
  },
  {
    name: '박지우',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0003',
      email: 'park.jiwoo@test.com',
      address: '서울시 강남구 테헤란로 202'
    }
  },
  {
    name: '최동현',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0004',
      email: 'choi.donghyun@test.com',
      address: '서울시 강남구 테헤란로 203'
    }
  },
  {
    name: '정수빈',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0005',
      email: 'jung.soobin@test.com',
      address: '서울시 강남구 테헤란로 204'
    }
  },
  {
    name: '한승우',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0006',
      email: 'han.seungwoo@test.com',
      address: '서울시 강남구 테헤란로 205'
    }
  },
  {
    name: '윤서진',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0007',
      email: 'yoon.seojin@test.com',
      address: '서울시 강남구 테헤란로 206'
    }
  },
  {
    name: '송현준',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0008',
      email: 'song.hyunjun@test.com',
      address: '서울시 강남구 테헤란로 207'
    }
  },
  {
    name: '임지민',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0009',
      email: 'lim.jimin@test.com',
      address: '서울시 강남구 테헤란로 208'
    }
  },
  {
    name: '강도윤',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0010',
      email: 'kang.doyoon@test.com',
      address: '서울시 강남구 테헤란로 209'
    }
  },
  {
    name: '조하나',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0011',
      email: 'cho.hana@test.com',
      address: '서울시 강남구 테헤란로 210'
    }
  },
  {
    name: '백준영',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0012',
      email: 'baek.joonyoung@test.com',
      address: '서울시 강남구 테헤란로 211'
    }
  },
  {
    name: '남궁서연',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0013',
      email: 'namgung.seoyeon@test.com',
      address: '서울시 강남구 테헤란로 212'
    }
  },
  {
    name: '서민재',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0014',
      email: 'seo.minjae@test.com',
      address: '서울시 강남구 테헤란로 213'
    }
  },
  {
    name: '오지원',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0015',
      email: 'oh.jiwon@test.com',
      address: '서울시 강남구 테헤란로 214'
    }
  },
  {
    name: '신현우',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0016',
      email: 'shin.hyunwoo@test.com',
      address: '서울시 강남구 테헤란로 215'
    }
  },
  {
    name: '권소영',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0017',
      email: 'kwon.soyoung@test.com',
      address: '서울시 강남구 테헤란로 216'
    }
  },
  {
    name: '황도현',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0018',
      email: 'hwang.dohyun@test.com',
      address: '서울시 강남구 테헤란로 217'
    }
  },
  {
    name: '안미래',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0019',
      email: 'ahn.mirae@test.com',
      address: '서울시 강남구 테헤란로 218'
    }
  },
  {
    name: '유태영',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0020',
      email: 'yoo.taeyoung@test.com',
      address: '서울시 강남구 테헤란로 219'
    }
  },
  {
    name: '김하은',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0021',
      email: 'kim.haeun@test.com',
      address: '서울시 강남구 테헤란로 220'
    }
  },
  {
    name: '이성민',
    grade: '초2',
    firstAttendanceDate: new Date('2023-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-2002-0022',
      email: 'lee.sungmin@test.com',
      address: '서울시 강남구 테헤란로 221'
    }
  },

  // 3학년 학생들 (22명)
  {
    name: '박지원',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0001',
      email: 'park.jiwon@test.com',
      address: '서울시 강남구 테헤란로 300'
    }
  },
  {
    name: '최준서',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0002',
      email: 'choi.junseo@test.com',
      address: '서울시 강남구 테헤란로 301'
    }
  },
  {
    name: '정연우',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0003',
      email: 'jung.yeonwoo@test.com',
      address: '서울시 강남구 테헤란로 302'
    }
  },
  {
    name: '한승현',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0004',
      email: 'han.seunghyun@test.com',
      address: '서울시 강남구 테헤란로 303'
    }
  },
  {
    name: '윤유진',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0005',
      email: 'yoon.yujin@test.com',
      address: '서울시 강남구 테헤란로 304'
    }
  },
  {
    name: '송민석',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0006',
      email: 'song.minseok@test.com',
      address: '서울시 강남구 테헤란로 305'
    }
  },
  {
    name: '임서연',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0007',
      email: 'lim.seoyeon@test.com',
      address: '서울시 강남구 테헤란로 306'
    }
  },
  {
    name: '강준서',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0008',
      email: 'kang.junseo@test.com',
      address: '서울시 강남구 테헤란로 307'
    }
  },
  {
    name: '조재현',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0009',
      email: 'cho.jaehyun@test.com',
      address: '서울시 강남구 테헤란로 308'
    }
  },
  {
    name: '백소영',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0010',
      email: 'baek.soyoung@test.com',
      address: '서울시 강남구 테헤란로 309'
    }
  },
  {
    name: '남궁도현',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0011',
      email: 'namgung.dohyun@test.com',
      address: '서울시 강남구 테헤란로 310'
    }
  },
  {
    name: '서미래',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0012',
      email: 'seo.mirae@test.com',
      address: '서울시 강남구 테헤란로 311'
    }
  },
  {
    name: '오태영',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0013',
      email: 'oh.taeyoung@test.com',
      address: '서울시 강남구 테헤란로 312'
    }
  },
  {
    name: '신하은',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0014',
      email: 'shin.haeun@test.com',
      address: '서울시 강남구 테헤란로 313'
    }
  },
  {
    name: '권성민',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0015',
      email: 'kwon.sungmin@test.com',
      address: '서울시 강남구 테헤란로 314'
    }
  },
  {
    name: '황지원',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0016',
      email: 'hwang.jiwon@test.com',
      address: '서울시 강남구 테헤란로 315'
    }
  },
  {
    name: '안준',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0017',
      email: 'ahn.jun@test.com',
      address: '서울시 강남구 테헤란로 316'
    }
  },
  {
    name: '유연우',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0018',
      email: 'yoo.yeonwoo@test.com',
      address: '서울시 강남구 테헤란로 317'
    }
  },
  {
    name: '김승현',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0019',
      email: 'kim.seunghyun@test.com',
      address: '서울시 강남구 테헤란로 318'
    }
  },
  {
    name: '이유진',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0020',
      email: 'lee.yujin@test.com',
      address: '서울시 강남구 테헤란로 319'
    }
  },
  {
    name: '박민석',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0021',
      email: 'park.minseok@test.com',
      address: '서울시 강남구 테헤란로 320'
    }
  },
  {
    name: '최서연',
    grade: '초3',
    firstAttendanceDate: new Date('2022-03-01') as any,
    status: 'active',
    contactInfo: {
      phone: '010-3003-0022',
      email: 'choi.seoyeon@test.com',
      address: '서울시 강남구 테헤란로 321'
    }
  }
]

// 학생 데이터 생성 함수
export const createStudentData = (): CreateStudentRequest[] => {
  return studentsTestData
}

// 학년별 학생 수 반환 함수
export const getStudentCountByGrade = () => {
  const counts = {
    '초1': studentsTestData.filter(s => s.grade === '초1').length,
    '초2': studentsTestData.filter(s => s.grade === '초2').length,
    '초3': studentsTestData.filter(s => s.grade === '초3').length
  }
  return counts
}

// 전체 학생 수 반환 함수
export const getTotalStudentCount = (): number => {
  return studentsTestData.length
}
