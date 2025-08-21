import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { AttendanceService } from '../services/AttendanceService';
import type { CreateAttendanceRecordRequest, UpdateAttendanceRecordRequest, AttendanceSearchParams } from '@shared/types';

export class AttendanceController {
  private attendanceService: AttendanceService;

  constructor() {
    this.attendanceService = new AttendanceService();
  }

  // 출석 기록 생성
  async createAttendanceRecord(req: Request, res: Response): Promise<void> {
    try {
      const attendanceData: CreateAttendanceRecordRequest = req.body;
      const attendanceId = await this.attendanceService.createAttendanceRecord(attendanceData);

      res.status(201).json({
        success: true,
        message: '출석 기록이 성공적으로 생성되었습니다.',
        data: { id: attendanceId }
      });
    } catch (error) {
      console.error('출석 기록 생성 오류:', error);
      res.status(500).json({
        success: false,
        message: '출석 기록 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 출석 기록 조회 (ID로)
  async getAttendanceRecordById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attendance = await this.attendanceService.getAttendanceRecordById(id);

      if (!attendance) {
        res.status(404).json({
          success: false,
          message: '출석 기록을 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: attendance
      });
    } catch (error) {
      console.error('출석 기록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '출석 기록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 출석 기록 수정
  async updateAttendanceRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateAttendanceRecordRequest = req.body;

      await this.attendanceService.updateAttendanceRecord(id, updateData);

      res.json({
        success: true,
        message: '출석 기록이 성공적으로 수정되었습니다.'
      });
    } catch (error) {
      console.error('출석 기록 수정 오류:', error);
      res.status(500).json({
        success: false,
        message: '출석 기록 수정 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 출석 기록 삭제
  async deleteAttendanceRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.attendanceService.deleteAttendanceRecord(id);

      res.json({
        success: true,
        message: '출석 기록이 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('출석 기록 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '출석 기록 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 모든 출석 기록 조회
  async getAllAttendanceRecords(req: Request, res: Response): Promise<void> {
    try {
      const records = await this.attendanceService.getAllAttendanceRecords();

      res.json({
        success: true,
        data: records,
        count: records.length
      });
    } catch (error) {
      console.error('출석 기록 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '출석 기록 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생별 출석 기록 조회
  async getAttendanceRecordsByStudentId(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const records = await this.attendanceService.getAttendanceRecordsByStudentId(studentId);

      res.json({
        success: true,
        data: records,
        count: records.length
      });
    } catch (error) {
      console.error('학생별 출석 기록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생별 출석 기록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 특정 날짜의 출석 기록 조회
  async getAttendanceRecordsByDate(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;
      const timestamp = admin.firestore.Timestamp.fromDate(new Date(date));
      const records = await this.attendanceService.getAttendanceRecordsByDate(timestamp);

      res.json({
        success: true,
        data: records,
        count: records.length
      });
    } catch (error) {
      console.error('날짜별 출석 기록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '날짜별 출석 기록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 날짜 범위의 출석 기록 조회
  async getAttendanceRecordsByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: '시작 날짜와 종료 날짜를 모두 제공해야 합니다.'
        });
        return;
      }

      const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(startDate as string));
      const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(endDate as string));
      
      const records = await this.attendanceService.getAttendanceRecordsByDateRange(startTimestamp, endTimestamp);

      res.json({
        success: true,
        data: records,
        count: records.length
      });
    } catch (error) {
      console.error('날짜 범위별 출석 기록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '날짜 범위별 출석 기록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 출석 기록 검색
  async searchAttendanceRecords(req: Request, res: Response): Promise<void> {
    try {
      const searchParams: AttendanceSearchParams = req.query as any;
      
      // 날짜 범위 문자열을 Timestamp로 변환
      if (searchParams.dateRange) {
        if (typeof searchParams.dateRange.start === 'string') {
          searchParams.dateRange.start = admin.firestore.Timestamp.fromDate(new Date(searchParams.dateRange.start));
        }
        if (typeof searchParams.dateRange.end === 'string') {
          searchParams.dateRange.end = admin.firestore.Timestamp.fromDate(new Date(searchParams.dateRange.end));
        }
      }

      // 특정 날짜 문자열을 Timestamp로 변환
      if (searchParams.date && typeof searchParams.date === 'string') {
        searchParams.date = admin.firestore.Timestamp.fromDate(new Date(searchParams.date));
      }

      const records = await this.attendanceService.searchAttendanceRecords(searchParams);

      res.json({
        success: true,
        data: records,
        count: records.length
      });
    } catch (error) {
      console.error('출석 기록 검색 오류:', error);
      res.status(500).json({
        success: false,
        message: '출석 기록 검색 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생별 출석 통계 조회
  async getStudentAttendanceStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const statistics = await this.attendanceService.getStudentAttendanceStatistics(studentId);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('학생별 출석 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생별 출석 통계 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 일별 출석 현황 요약
  async getDailyAttendanceSummary(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;
      const timestamp = admin.firestore.Timestamp.fromDate(new Date(date));
      const summary = await this.attendanceService.getDailyAttendanceSummary(timestamp);

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

  // 월별 출석 통계
  async getMonthlyAttendanceStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { year, month } = req.params;
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);

      if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        res.status(400).json({
          success: false,
          message: '유효한 년도와 월을 제공해야 합니다.'
        });
        return;
      }

      const statistics = await this.attendanceService.getMonthlyAttendanceStatistics(yearNum, monthNum);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('월별 출석 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '월별 출석 통계 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 출석 상태별 통계
  async getAttendanceStatusStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.attendanceService.getAttendanceStatusStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('출석 상태별 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '출석 상태별 통계 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 지각/조퇴 학생 목록
  async getStudentsWithAttendanceIssues(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: '시작 날짜와 종료 날짜를 모두 제공해야 합니다.'
        });
        return;
      }

      const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(startDate as string));
      const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(endDate as string));
      
      const issues = await this.attendanceService.getStudentsWithAttendanceIssues(startTimestamp, endTimestamp);

      res.json({
        success: true,
        data: issues
      });
    } catch (error) {
      console.error('지각/조퇴 학생 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '지각/조퇴 학생 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 일괄 출석 기록 생성
  async createBulkAttendanceRecords(req: Request, res: Response): Promise<void> {
    try {
      const { records } = req.body;
      
      if (!Array.isArray(records) || records.length === 0) {
        res.status(400).json({
          success: false,
          message: '출석 기록 배열을 제공해야 합니다.'
        });
        return;
      }

      const attendanceIds = await this.attendanceService.createBulkAttendanceRecords(records);

      res.status(201).json({
        success: true,
        message: `${attendanceIds.length}개의 출석 기록이 성공적으로 생성되었습니다.`,
        data: { ids: attendanceIds }
      });
    } catch (error) {
      console.error('일괄 출석 기록 생성 오류:', error);
      res.status(500).json({
        success: false,
        message: '일괄 출석 기록 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 출석 기록 복사
  async copyAttendanceRecords(req: Request, res: Response): Promise<void> {
    try {
      const { sourceDate, targetDate } = req.body;
      
      if (!sourceDate || !targetDate) {
        res.status(400).json({
          success: false,
          message: '원본 날짜와 대상 날짜를 모두 제공해야 합니다.'
        });
        return;
      }

      const sourceTimestamp = admin.firestore.Timestamp.fromDate(new Date(sourceDate));
      const targetTimestamp = admin.firestore.Timestamp.fromDate(new Date(targetDate));
      
      const copiedIds = await this.attendanceService.copyAttendanceRecords(sourceTimestamp, targetTimestamp);

      res.json({
        success: true,
        message: `${copiedIds.length}개의 출석 기록이 성공적으로 복사되었습니다.`,
        data: { ids: copiedIds }
      });
    } catch (error) {
      console.error('출석 기록 복사 오류:', error);
      res.status(500).json({
        success: false,
        message: '출석 기록 복사 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
}
