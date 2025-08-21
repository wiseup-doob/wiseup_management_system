import { Request, Response } from 'express';
import { StudentSummaryService } from '../services/StudentSummaryService';
import type { CreateStudentSummaryRequest, UpdateStudentSummaryRequest, StudentSummarySearchParams } from '@shared/types';

export class StudentSummaryController {
  private studentSummaryService: StudentSummaryService;

  constructor() {
    this.studentSummaryService = new StudentSummaryService();
  }

  // 학생 요약 정보 생성
  async createStudentSummary(req: Request, res: Response): Promise<void> {
    try {
      const summaryData: CreateStudentSummaryRequest = req.body;
      const summaryId = await this.studentSummaryService.createStudentSummary(summaryData);

      res.status(201).json({
        success: true,
        message: '학생 요약 정보가 성공적으로 생성되었습니다.',
        data: { id: summaryId }
      });
    } catch (error) {
      console.error('학생 요약 정보 생성 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 요약 정보 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생 요약 정보 조회 (ID로)
  async getStudentSummaryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const summary = await this.studentSummaryService.getStudentSummaryById(id);

      if (!summary) {
        res.status(404).json({
          success: false,
          message: '학생 요약 정보를 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('학생 요약 정보 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 요약 정보 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생 ID로 요약 정보 조회
  async getStudentSummaryByStudentId(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const summary = await this.studentSummaryService.getStudentSummaryByStudentId(studentId);

      if (!summary) {
        res.status(404).json({
          success: false,
          message: '해당 학생의 요약 정보를 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('학생 ID로 요약 정보 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 ID로 요약 정보 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생 요약 정보 수정
  async updateStudentSummary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateStudentSummaryRequest = req.body;

      await this.studentSummaryService.updateStudentSummary(id, updateData);

      res.json({
        success: true,
        message: '학생 요약 정보가 성공적으로 수정되었습니다.'
      });
    } catch (error) {
      console.error('학생 요약 정보 수정 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 요약 정보 수정 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생 요약 정보 삭제
  async deleteStudentSummary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.studentSummaryService.deleteStudentSummary(id);

      res.json({
        success: true,
        message: '학생 요약 정보가 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('학생 요약 정보 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 요약 정보 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 모든 학생 요약 정보 조회
  async getAllStudentSummaries(req: Request, res: Response): Promise<void> {
    try {
      const summaries = await this.studentSummaryService.getAllStudentSummaries();

      res.json({
        success: true,
        data: summaries,
        count: summaries.length
      });
    } catch (error) {
      console.error('학생 요약 정보 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 요약 정보 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생 요약 정보 검색
  async searchStudentSummaries(req: Request, res: Response): Promise<void> {
    try {
      const searchParams: StudentSummarySearchParams = req.query as any;
      const summaries = await this.studentSummaryService.searchStudentSummaries(searchParams);

      res.json({
        success: true,
        data: summaries,
        count: summaries.length
      });
    } catch (error) {
      console.error('학생 요약 정보 검색 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 요약 정보 검색 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 출석률 상위 학생 조회
  async getTopAttendanceStudents(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const students = await this.studentSummaryService.getTopAttendanceStudents(limit);

      res.json({
        success: true,
        data: students,
        count: students.length
      });
    } catch (error) {
      console.error('출석률 상위 학생 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '출석률 상위 학생 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 문제가 있는 학생 조회
  async getStudentsWithIssues(req: Request, res: Response): Promise<void> {
    try {
      const students = await this.studentSummaryService.getStudentsWithIssues();

      res.json({
        success: true,
        data: students,
        count: students.length
      });
    } catch (error) {
      console.error('문제가 있는 학생 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '문제가 있는 학생 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생 요약 정보 통계
  async getStudentSummaryStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.studentSummaryService.getStudentSummaryStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('학생 요약 정보 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 요약 정보 통계 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 출석 상태별 학생 수 조회
  async getStudentCountByAttendanceStatus(req: Request, res: Response): Promise<void> {
    try {
      const countByStatus = await this.studentSummaryService.getStudentCountByAttendanceStatus();

      res.json({
        success: true,
        data: countByStatus
      });
    } catch (error) {
      console.error('출석 상태별 학생 수 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '출석 상태별 학생 수 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 일별 출석 현황 요약
  async getDailyAttendanceSummary(req: Request, res: Response): Promise<void> {
    try {
      const summary = await this.studentSummaryService.getDailyAttendanceSummary();

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('일별 출석 현황 요약 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '일별 출석 현황 요약 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
}
