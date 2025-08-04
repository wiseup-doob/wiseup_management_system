/**
 * 학생 이름 포맷팅
 */
export const formatStudentName = (name: string): string => {
  return name.trim().toUpperCase()
}

/**
 * 날짜 포맷팅
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ko-KR')
}

/**
 * 시간 포맷팅
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 날짜와 시간 포맷팅
 */
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`
}

/**
 * 숫자에 천 단위 콤마 추가
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR')
}

/**
 * 퍼센트 포맷팅
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * 파일 크기 포맷팅
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 전화번호 포맷팅
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return phone
}

/**
 * 이메일 마스킹
 */
export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@')
  if (localPart.length <= 2) return email
  
  const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1)
  return `${maskedLocal}@${domain}`
} 