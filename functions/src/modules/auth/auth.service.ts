import { LoginRequest, LoginResponse, ChangePasswordRequest, RegisterRequest } from './auth.types'
import { 
  getUserByEmailInternal, 
  getUserByIdInternal, 
  verifyPassword, 
  hashPassword, 
  updateUserPassword,
  createUser 
} from '../users/user.service'

// 사용자 데이터에서 password_hash 제거
function toPublicUser(user: any): any {
  const { password_hash, ...publicUser } = user
  return publicUser
}

// 회원가입
export async function register(data: RegisterRequest): Promise<LoginResponse> {
  // Users 서비스를 활용하여 사용자 생성
  const newUser = await createUser({
    name: data.name,
    phone: data.phone,
    email: data.email,
    password: data.password,
    status: data.status || 'active'
  })

  // 회원가입 성공 시 바로 로그인 상태로 반환
  return {
    user: newUser
    // token: // JWT 토큰 생성 로직 추후 구현
    // refreshToken: // 리프레시 토큰 생성 로직 추후 구현
  }
}

// 로그인
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const user = await getUserByEmailInternal(credentials.email)
  
  if (!user) {
    const error = new Error('Invalid email or password')
    ;(error as any).status = 401
    throw error
  }

  const isPasswordValid = await verifyPassword(credentials.password, user.password_hash)
  
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password')
    ;(error as any).status = 401
    throw error
  }

  if (user.status === 'inactive') {
    const error = new Error('Account is inactive')
    ;(error as any).status = 403
    throw error
  }

  return {
    user: toPublicUser(user)
    // token: // JWT 토큰 생성 로직 추후 구현
    // refreshToken: // 리프레시 토큰 생성 로직 추후 구현
  }
}

// 비밀번호 변경
export async function changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
  const user = await getUserByIdInternal(userId)
  
  if (!user) {
    const error = new Error('User not found')
    ;(error as any).status = 404
    throw error
  }

  // 현재 비밀번호 확인
  const isCurrentPasswordValid = await verifyPassword(data.currentPassword, user.password_hash)
  
  if (!isCurrentPasswordValid) {
    const error = new Error('Current password is incorrect')
    ;(error as any).status = 400
    throw error
  }

  // 새 비밀번호 해싱 및 업데이트
  const newPasswordHash = await hashPassword(data.newPassword)
  await updateUserPassword(userId, newPasswordHash)
}

// 비밀번호 재설정 요청
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await getUserByEmailInternal(email)
  
  if (!user) {
    // 보안상 이메일이 존재하지 않아도 성공으로 응답
    return
  }

  // TODO: 이메일 발송 로직 구현
  // - 재설정 토큰 생성
  // - 이메일 발송
  // - 토큰을 임시 저장소에 저장 (만료 시간과 함께)
  
  console.log(`Password reset requested for ${email}`)
}

// 비밀번호 재설정 확인
export async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  // TODO: 토큰 검증 로직 구현
  // - 토큰 유효성 확인
  // - 만료 시간 확인
  // - 사용자 식별
  // - 새 비밀번호 해싱 후 updateUserPassword 호출
  
  throw new Error('Password reset confirmation not implemented yet')
}

// 로그아웃 (향후 JWT 토큰 무효화 용)
export async function logout(userId: string): Promise<void> {
  // TODO: JWT 토큰 블랙리스트 처리
  // - 토큰을 블랙리스트에 추가
  // - 세션 정보 삭제
  
  console.log(`User ${userId} logged out`)
}

// 토큰 검증 (향후 JWT 구현 시)
export async function verifyToken(token: string): Promise<any> {
  // TODO: JWT 토큰 검증 로직
  // - 토큰 서명 검증
  // - 만료 시간 확인
  // - 블랙리스트 확인
  // - getUserByIdInternal로 사용자 정보 반환
  
  throw new Error('Token verification not implemented yet')
}

// 토큰 갱신 (향후 리프레시 토큰 구현 시)
export async function refreshToken(refreshToken: string): Promise<any> {
  // TODO: 리프레시 토큰으로 새 액세스 토큰 생성
  // - 리프레시 토큰 검증
  // - 새 액세스 토큰 생성
  // - 새 리프레시 토큰 생성 (선택적)
  
  throw new Error('Token refresh not implemented yet')
} 