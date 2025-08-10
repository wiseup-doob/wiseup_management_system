import { BaseService } from '../base/BaseService'
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../../types/auth'
import * as bcrypt from 'bcryptjs'

import { AUTH_CONFIG } from '../../config/constants';

export class AuthService extends BaseService {
  private static readonly COLLECTION_NAME = 'users'

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
    const hashedPassword = await bcrypt.hash(adminPassword, AUTH_CONFIG.BCRYPT_ROUNDS)
    
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
    
    if (!data) {
      return null
    }
    
    return {
      id: doc.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      lastLoginAt: data.lastLoginAt?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
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

    // 임시 토큰 생성 (JWT 문제 해결 후 수정 예정)
    const tempToken = 'temp_token_' + Date.now()
    const tempRefreshToken = 'temp_refresh_token_' + Date.now()

    // 마지막 로그인 시간 업데이트
    await this.getCollection(AuthService.COLLECTION_NAME)
      .doc(user.id)
      .update({
        lastLoginAt: new Date()
      })

    return {
      user,
      token: tempToken,
      refreshToken: tempRefreshToken,
      expiresIn: 24 * 60 * 60 // 24시간 (초 단위)
    }
  }

  // 토큰 검증 (임시 구현)
  async verifyToken(_token: string): Promise<User> {
    // 임시 구현 - 실제로는 JWT 검증 필요
    throw new Error('토큰 검증 기능이 아직 구현되지 않았습니다.')
  }

  // 토큰 갱신 (임시 구현)
  async refreshToken(_refreshToken: string): Promise<LoginResponse> {
    // 임시 구현 - 실제로는 JWT 갱신 필요
    throw new Error('토큰 갱신 기능이 아직 구현되지 않았습니다.')
  }

  // 사용자 ID로 조회
  async getUserById(userId: string): Promise<User | null> {
    const doc = await this.getCollection(AuthService.COLLECTION_NAME)
      .doc(userId)
      .get()

    if (!doc.exists) {
      return null
    }

    const data = doc.data()
    if (!data) {
      return null
    }
    
    return {
      id: doc.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      lastLoginAt: data.lastLoginAt?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as User
  }

  // 로그아웃 (임시 구현)
  async logout(_token: string): Promise<void> {
    // 임시 구현 - 실제로는 토큰 무효화 필요
    console.log('로그아웃 처리됨')
  }

  // 회원가입
  async register(registerRequest: RegisterRequest): Promise<LoginResponse> {
    const { email, password, name } = registerRequest

    // 이메일 중복 확인
    const existingUser = await this.getUserByEmail(email)
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.')
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, AUTH_CONFIG.BCRYPT_ROUNDS)

    // 새 사용자 생성
    const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email,
      name,
      role: 'student', // 기본값을 student로 변경
      lastLoginAt: new Date()
    }

    const docRef = this.getCollection(AuthService.COLLECTION_NAME).doc()
    await docRef.set({
      ...newUser,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const createdUser = await this.getUserById(docRef.id)
    if (!createdUser) {
      throw new Error('사용자 생성 중 오류가 발생했습니다.')
    }

    // 임시 토큰 생성
    const tempToken = 'temp_token_' + Date.now()
    const tempRefreshToken = 'temp_refresh_token_' + Date.now()

    return {
      user: createdUser,
      token: tempToken,
      refreshToken: tempRefreshToken,
      expiresIn: 24 * 60 * 60 // 24시간 (초 단위)
    }
  }
} 