import { Request, Response } from 'express'
import { TestDataService } from '../services/TestDataService'

export class TestDataController {
  private testDataService: TestDataService

  constructor() {
    this.testDataService = new TestDataService()
  }

  // ===== 전체 테스트 데이터 초기화 =====
  public initializeAllTestData = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.testDataService.initializeAllTestData()
      res.status(200).json({
        success: true,
        message: '전체 테스트 데이터가 성공적으로 초기화되었습니다.',
        data: result
      })
    } catch (error) {
      console.error('테스트 데이터 초기화 오류:', error)
      res.status(500).json({
        success: false,
        message: '테스트 데이터 초기화 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  // ===== 학생 테스트 데이터 초기화 =====
  public initializeStudentsData = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.testDataService.initializeStudentsData()
      res.status(200).json({
        success: true,
        message: '학생 테스트 데이터가 성공적으로 초기화되었습니다.',
        data: result
      })
    } catch (error) {
      console.error('학생 테스트 데이터 초기화 오류:', error)
      res.status(500).json({
        success: false,
        message: '학생 테스트 데이터 초기화 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  // ===== 교사 테스트 데이터 초기화 =====
  public initializeTeachersData = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.testDataService.initializeTeachersData()
      res.status(200).json({
        success: true,
        message: '교사 테스트 데이터가 성공적으로 초기화되었습니다.',
        data: result
      })
    } catch (error) {
      console.error('교사 테스트 데이터 초기화 오류:', error)
      res.status(500).json({
        success: false,
        message: '교사 테스트 데이터 초기화 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  // ===== 학생 테스트 데이터 삭제 =====
  public clearStudentsData = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.testDataService.clearStudentsData()
      res.status(200).json({
        success: true,
        message: '학생 테스트 데이터가 성공적으로 삭제되었습니다.',
        data: result
      })
    } catch (error) {
      console.error('학생 테스트 데이터 삭제 오류:', error)
      res.status(500).json({
        success: false,
        message: '학생 테스트 데이터 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  // ===== 교사 테스트 데이터 삭제 =====
  public clearTeachersData = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.testDataService.clearTeachersData()
      res.status(200).json({
        success: true,
        message: '교사 테스트 데이터가 성공적으로 삭제되었습니다.',
        data: result
      })
    } catch (error) {
      console.error('교사 테스트 데이터 삭제 오류:', error)
      res.status(500).json({
        success: false,
        message: '교사 테스트 데이터 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  // ===== 전체 테스트 데이터 삭제 =====
  public clearAllTestData = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.testDataService.clearAllTestData()
      res.status(200).json({
        success: true,
        message: '전체 테스트 데이터가 성공적으로 삭제되었습니다.',
        data: result
      })
    } catch (error) {
      console.error('전체 테스트 데이터 삭제 오류:', error)
      res.status(500).json({
        success: false,
        message: '전체 테스트 데이터 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  // ===== 테스트 데이터 상태 확인 =====
  public getTestDataStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await this.testDataService.getTestDataStatus()
      res.status(200).json({
        success: true,
        message: '테스트 데이터 상태를 성공적으로 조회했습니다.',
        data: status
      })
    } catch (error) {
      console.error('테스트 데이터 상태 조회 오류:', error)
      res.status(500).json({
        success: false,
        message: '테스트 데이터 상태 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }
}
