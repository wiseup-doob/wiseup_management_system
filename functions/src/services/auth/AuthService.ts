import { BaseService } from '../base/BaseService'
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../../types/auth'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'

export class AuthService extends BaseService {
  private static readonly COLLECTION_NAME = "users"
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
  private static readonly JWT_EXPIRES_IN = '24h'
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d'

  // 초기 관리자 계정 생성
  async initializeAdmin(): Promise<void> {
    const adminEmail = 'admin@test.com'
    const adminPassword = 'admin'
    
    // 이미 존재하는지 확인
    const existingAdmin = await this.getUserByEmail(adminEmail)
    if (existingAdmin) {
      return
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    const adminUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email: adminEmail,
      name: '관리자',
      role: 'admin',
      lastLoginAt: new Date()
    }

    const docRef = this.getCollection(AuthService.COLLECTION_NAME).doc()
    await docRef.set({
      ...adminUser,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  // 이메일로 사용자 조회
  async getUserByEmail(email: string): Promise<User | null> {
    const snapshot = await this.getCollection(AuthService.COLLECTION_NAME)
      .where('email', '==', email)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    const data = doc.data()
    
    return {
      id: doc.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      lastLoginAt: data.lastLoginAt?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as User
  }

  // 로그인 처리
  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const { email, password } = loginRequest

    // 사용자 조회
    const user = await this.getUserByEmail(email)
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    // 비밀번호 확인
    const userDoc = await this.getCollection(AuthService.COLLECTION_NAME)
      .where('email', '==', email)
      .limit(1)
      .get()

    if (userDoc.empty) {
      throw new Error('사용자를 찾을 수 없습니다.')
    }

    const userData = userDoc.docs[0].data()
    const isPasswordValid = await bcrypt.compare(password, userData.password)

    if (!isPasswordValid) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      AuthService.JWT_SECRET,
      { expiresIn: AuthService.JWT_EXPIRES_IN }
    )

    // 리프레시 토큰 생성
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      AuthService.JWT_SECRET,
      { expiresIn: AuthService.REFRESH_TOKEN_EXPIRES_IN }
    )

    // 마지막 로그인 시간 업데이트
    await this.getCollection(AuthService.COLLECTION_NAME)
      .doc(user.id)
      .update({
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })

    return {
      user: {
        ...user,
        lastLoginAt: new Date()
      },
      token,
      refreshToken,
      expiresIn: 24 * 60 * 60 // 24시간 (초 단위)
    }
  }

  // 토큰 검증
  async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, AuthService.JWT_SECRET) as any
      const user = await this.getUserById(decoded.userId)
      
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.')
      }

      return user
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다.')
    }
  }

  // 리프레시 토큰으로 새 토큰 발급
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const decoded = jwt.verify(refreshToken, AuthService.JWT_SECRET) as any
      const user = await this.getUserById(decoded.userId)
      
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.')
      }

      // 새 토큰 생성
      const newToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        AuthService.JWT_SECRET,
        { expiresIn: AuthService.JWT_EXPIRES_IN }
      )

      // 새 리프레시 토큰 생성
      const newRefreshToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        AuthService.JWT_SECRET,
        { expiresIn: AuthService.REFRESH_TOKEN_EXPIRES_IN }
      )

      return {
        user,
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: 24 * 60 * 60
      }
    } catch (error) {
      throw new Error('유효하지 않은 리프레시 토큰입니다.')
    }
  }

  // 사용자 ID로 조회
  async getUserById(userId: string): Promise<User | null> {
    const doc = await this.getCollection(AuthService.COLLECTION_NAME).doc(userId).get()
    
    if (!doc.exists) {
      return null
    }

    const data = doc.data()!
    return {
      id: doc.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      lastLoginAt: data.lastLoginAt?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as User
  }

  // 로그아웃 (토큰 블랙리스트 처리)
  async logout(token: string): Promise<void> {
    // 실제 구현에서는 토큰을 블랙리스트에 추가
    // 여기서는 단순히 성공 응답만 반환
    return Promise.resolve()
  }

  // 회원가입
  async register(registerRequest: RegisterRequest): Promise<LoginResponse> {
    const { email, password, name, role } = registerRequest

    // 이메일 중복 확인
    const existingUser = await this.getUserByEmail(email)
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.')
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10)

    // 새 사용자 생성
    const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email,
      name,
      role,
      lastLoginAt: new Date()
    }

    const docRef = this.getCollection(AuthService.COLLECTION_NAME).doc()
    await docRef.set({
      ...newUser,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const user: User = {
      id: docRef.id,
      ...newUser,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      AuthService.JWT_SECRET,
      { expiresIn: AuthService.JWT_EXPIRES_IN }
    )

    // 리프레시 토큰 생성
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      AuthService.JWT_SECRET,
      { expiresIn: AuthService.REFRESH_TOKEN_EXPIRES_IN }
    )

    return {
      user,
      token,
      refreshToken,
      expiresIn: 24 * 60 * 60
    }
  }
} 