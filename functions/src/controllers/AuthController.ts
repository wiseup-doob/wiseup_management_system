import { BaseController } from './BaseController'
import { AuthService } from '../services/auth/AuthService'
import { LoginRequest, RegisterRequest } from '../types/auth'

export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super()
  }

  // 관리자 계정 초기화
  async initializeAdmin(request: any, response: any): Promise<void> {
    try {
      await this.authService.initializeAdmin()
      
      response.json(this.createSuccessResponse(
        null,
        '관리자 계정이 초기화되었습니다.'
      ))
    } catch (error) {
      response.status(500).json(this.createErrorResponse(
        '관리자 계정 초기화 중 오류가 발생했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      ))
    }
  }

  // 로그인
  async login(request: any, response: any): Promise<void> {
    try {
      const loginRequest: LoginRequest = request.body
      
      if (!loginRequest.email || !loginRequest.password) {
        response.status(400).json(this.createErrorResponse(
          '이메일과 비밀번호를 입력해주세요.'
        ))
        return
      }

      const loginResponse = await this.authService.login(loginRequest)
      
      response.json(this.createSuccessResponse(
        loginResponse,
        '로그인에 성공했습니다.'
      ))
    } catch (error) {
      response.status(401).json(this.createErrorResponse(
        '로그인에 실패했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      ))
    }
  }

  // 회원가입
  async register(request: any, response: any): Promise<void> {
    try {
      const registerRequest: RegisterRequest = request.body
      
      if (!registerRequest.email || !registerRequest.password || !registerRequest.name) {
        response.status(400).json(this.createErrorResponse(
          '모든 필수 정보를 입력해주세요.'
        ))
        return
      }

      const loginResponse = await this.authService.register(registerRequest)
      
      response.json(this.createSuccessResponse(
        loginResponse,
        '회원가입에 성공했습니다.'
      ))
    } catch (error) {
      response.status(400).json(this.createErrorResponse(
        '회원가입에 실패했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      ))
    }
  }

  // 로그아웃
  async logout(request: any, response: any): Promise<void> {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '')
      
      if (token) {
        await this.authService.logout(token)
      }
      
      response.json(this.createSuccessResponse(
        null,
        '로그아웃에 성공했습니다.'
      ))
    } catch (error) {
      response.status(500).json(this.createErrorResponse(
        '로그아웃 중 오류가 발생했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      ))
    }
  }

  // 토큰 갱신
  async refreshToken(request: any, response: any): Promise<void> {
    try {
      const { refreshToken } = request.body
      
      if (!refreshToken) {
        response.status(400).json(this.createErrorResponse(
          '리프레시 토큰이 필요합니다.'
        ))
        return
      }

      const loginResponse = await this.authService.refreshToken(refreshToken)
      
      response.json(this.createSuccessResponse(
        loginResponse,
        '토큰이 갱신되었습니다.'
      ))
    } catch (error) {
      response.status(401).json(this.createErrorResponse(
        '토큰 갱신에 실패했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      ))
    }
  }

  // 현재 사용자 정보 조회
  async getCurrentUser(request: any, response: any): Promise<void> {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        response.status(401).json(this.createErrorResponse(
          '인증 토큰이 필요합니다.'
        ))
        return
      }

      const user = await this.authService.verifyToken(token)
      
      response.json(this.createSuccessResponse(user))
    } catch (error) {
      response.status(401).json(this.createErrorResponse(
        '사용자 정보 조회에 실패했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      ))
    }
  }

  // 토큰 검증
  async verifyToken(request: any, response: any): Promise<void> {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        response.status(401).json(this.createErrorResponse(
          '인증 토큰이 필요합니다.'
        ))
        return
      }

      const user = await this.authService.verifyToken(token)
      
      response.json(this.createSuccessResponse(
        { valid: true, user },
        '토큰이 유효합니다.'
      ))
    } catch (error) {
      response.status(401).json(this.createErrorResponse(
        '토큰이 유효하지 않습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      ))
    }
  }
} 