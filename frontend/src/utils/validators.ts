/**
 * 학생 ID 유효성 검사
 */
export const isValidStudentId = (id: string): boolean => {
  return /^[A-Z]{2}\d{6}$/.test(id)
}

/**
 * 출결 상태 유효성 검사
 */
export const validateAttendanceStatus = (status: string): status is 'present' | 'absent' | 'late' | 'unknown' => {
  return ['present', 'absent', 'late', 'unknown'].includes(status)
}

/**
 * 이메일 유효성 검사
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 전화번호 유효성 검사
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/
  return phoneRegex.test(phone)
}

/**
 * 비밀번호 유효성 검사
 */
export const isValidPassword = (password: string): boolean => {
  // 최소 8자, 영문/숫자/특수문자 조합
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

/**
 * 필수 필드 검사
 */
export const isRequired = (value: string | number | null | undefined): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

/**
 * 최소 길이 검사
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength
}

/**
 * 최대 길이 검사
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength
}

/**
 * 숫자 범위 검사
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

/**
 * 날짜 유효성 검사
 */
export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date)
  return !isNaN(dateObj.getTime())
}

/**
 * 파일 크기 검사
 */
export const isValidFileSize = (fileSize: number, maxSize: number): boolean => {
  return fileSize <= maxSize
}

/**
 * 파일 타입 검사
 */
export const isValidFileType = (fileName: string, allowedTypes: string[]): boolean => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase()
  return fileExtension ? allowedTypes.includes(fileExtension) : false
} 