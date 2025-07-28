// 어떤 파일이 존재해야 하는지 명시해주는 파일
export interface Student {
  user_id: string               // 🔗 연결된 사용자 ID (필수)
  name: string
  school: string
  grade?: number
  phoneNumber?: string
  targetUniversity?: string     // 🔧 오타 수정: targetUniveristy → targetUniversity
}

export interface StudentFilter {
  user_id?: string
  name?: string
  school?: string
  grade?: number
}