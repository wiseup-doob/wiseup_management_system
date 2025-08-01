import {Request, Response} from "express";
import {AttendanceService} from "./attendance.service";
import {
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  AttendanceFilter,
  CheckInOutRequest,
} from "./attendance.types";

export class AttendanceController {
  private attendanceService = new AttendanceService();

  // 출석 생성
  async createAttendance(req: Request, res: Response): Promise<void> {
    try {
      const attendanceData: CreateAttendanceRequest = req.body;
      const attendance = await this.attendanceService.createAttendance(attendanceData);
      res.status(201).json({success: true, data: attendance});
    } catch (error) {
      res.status(500).json({success: false, error: "출석 생성에 실패했습니다."});
    }
  }

  // 출석 조회
  async getAttendance(req: Request, res: Response): Promise<void> {
    try {
      const {attendanceId} = req.params;
      const attendance = await this.attendanceService.getAttendance(attendanceId);

      if (!attendance) {
        res.status(404).json({success: false, error: "출석 기록을 찾을 수 없습니다."});
        return;
      }

      res.json({success: true, data: attendance});
    } catch (error) {
      res.status(500).json({success: false, error: "출석 조회에 실패했습니다."});
    }
  }

  // 학생의 특정 날짜 출석 조회
  async getAttendanceByStudentAndDate(req: Request, res: Response): Promise<void> {
    try {
      const {studentId, date} = req.params;
      const attendance = await this.attendanceService.getAttendanceByStudentAndDate(studentId, date);

      if (!attendance) {
        res.status(404).json({success: false, error: "출석 기록을 찾을 수 없습니다."});
        return;
      }

      res.json({success: true, data: attendance});
    } catch (error) {
      res.status(500).json({success: false, error: "출석 조회에 실패했습니다."});
    }
  }

  // 출석 목록 조회
  async getAttendanceList(req: Request, res: Response): Promise<void> {
    try {
      const filter: AttendanceFilter = req.query;
      const attendanceList = await this.attendanceService.getAttendanceList(filter);
      res.json({success: true, data: attendanceList});
    } catch (error) {
      res.status(500).json({success: false, error: "출석 목록 조회에 실패했습니다."});
    }
  }

  // 출석 업데이트
  async updateAttendance(req: Request, res: Response): Promise<void> {
    try {
      const {attendanceId} = req.params;
      const updateData: UpdateAttendanceRequest = req.body;
      const attendance = await this.attendanceService.updateAttendance(attendanceId, updateData);

      if (!attendance) {
        res.status(404).json({success: false, error: "출석 기록을 찾을 수 없습니다."});
        return;
      }

      res.json({success: true, data: attendance});
    } catch (error) {
      res.status(500).json({success: false, error: "출석 업데이트에 실패했습니다."});
    }
  }

  // 출석 삭제
  async deleteAttendance(req: Request, res: Response): Promise<void> {
    try {
      const {attendanceId} = req.params;
      const success = await this.attendanceService.deleteAttendance(attendanceId);

      if (!success) {
        res.status(404).json({success: false, error: "출석 기록을 찾을 수 없습니다."});
        return;
      }

      res.json({success: true, message: "출석 기록이 삭제되었습니다."});
    } catch (error) {
      res.status(500).json({success: false, error: "출석 삭제에 실패했습니다."});
    }
  }

  // 체크인/체크아웃
  async checkInOut(req: Request, res: Response): Promise<void> {
    try {
      const request: CheckInOutRequest = req.body;
      const attendance = await this.attendanceService.checkInOut(request);

      if (!attendance) {
        res.status(400).json({success: false, error: "체크인/체크아웃에 실패했습니다."});
        return;
      }

      res.json({success: true, data: attendance});
    } catch (error) {
      res.status(500).json({success: false, error: "체크인/체크아웃에 실패했습니다."});
    }
  }

  // 학생별 출석 통계
  async getStudentAttendanceStats(req: Request, res: Response): Promise<void> {
    try {
      const {studentId} = req.params;
      const {from, to} = req.query;

      const dateRange = from && to ? {from: from as string, to: to as string} : undefined;
      const stats = await this.attendanceService.getStudentAttendanceStats(studentId, dateRange);

      res.json({success: true, data: stats});
    } catch (error) {
      res.status(500).json({success: false, error: "출석 통계 조회에 실패했습니다."});
    }
  }

  // 일별 출석 요약
  async getDailyAttendanceSummary(req: Request, res: Response): Promise<void> {
    try {
      const {date} = req.params;
      const summary = await this.attendanceService.getDailyAttendanceSummary(date);
      res.json({success: true, data: summary});
    } catch (error) {
      res.status(500).json({success: false, error: "일별 출석 요약 조회에 실패했습니다."});
    }
  }

  // 학생별 출석 요약 목록
  async getStudentAttendanceSummaries(req: Request, res: Response): Promise<void> {
    try {
      const {from, to} = req.query;

      const dateRange = from && to ? {from: from as string, to: to as string} : undefined;
      const summaries = await this.attendanceService.getStudentAttendanceSummaries(dateRange);

      res.json({success: true, data: summaries});
    } catch (error) {
      res.status(500).json({success: false, error: "학생별 출석 요약 조회에 실패했습니다."});
    }
  }
}
