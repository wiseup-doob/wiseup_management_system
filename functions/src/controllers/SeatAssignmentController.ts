import { Request, Response } from 'express';
import { SeatAssignmentService } from '../services/SeatAssignmentService';
import type { 
  CreateSeatAssignmentRequest, 
  UpdateSeatAssignmentRequest, 
  SeatAssignmentSearchParams 
} from '@shared/types';

export class SeatAssignmentController {
  private seatAssignmentService: SeatAssignmentService;

  constructor() {
    this.seatAssignmentService = new SeatAssignmentService();
  }

  // 좌석 배정 생성
  async createSeatAssignment(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateSeatAssignmentRequest = req.body;

      // 필수 필드 검증
      if (!data.seatId || !data.studentId || !data.assignedDate) {
        res.status(400).json({ 
          error: '필수 필드가 누락되었습니다. seatId, studentId, assignedDate는 필수입니다.' 
        });
        return;
      }

      const assignmentId = await this.seatAssignmentService.createSeatAssignmentWithValidation(data);
      
      res.status(201).json({ 
        message: '좌석 배정이 성공적으로 생성되었습니다.',
        assignmentId 
      });
    } catch (error) {
      console.error('좌석 배정 생성 오류:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('이미 배정되어 있습니다')) {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      
      res.status(500).json({ 
        error: '좌석 배정 생성 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 배정 조회 (ID로)
  async getSeatAssignmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: '좌석 배정 ID가 필요합니다.' });
        return;
      }

      const assignment = await this.seatAssignmentService.getSeatAssignmentById(id);
      
      if (!assignment) {
        res.status(404).json({ error: '해당 좌석 배정을 찾을 수 없습니다.' });
        return;
      }

      res.status(200).json(assignment);
    } catch (error) {
      console.error('좌석 배정 조회 오류:', error);
      res.status(500).json({ 
        error: '좌석 배정 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 배정 수정
  async updateSeatAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateSeatAssignmentRequest = req.body;
      
      if (!id) {
        res.status(400).json({ error: '좌석 배정 ID가 필요합니다.' });
        return;
      }

      // 기존 좌석 배정 확인
      const existingAssignment = await this.seatAssignmentService.getSeatAssignmentById(id);
      if (!existingAssignment) {
        res.status(404).json({ error: '해당 좌석 배정을 찾을 수 없습니다.' });
        return;
      }

      await this.seatAssignmentService.updateSeatAssignmentWithValidation(id, data);
      
      res.status(200).json({ 
        message: '좌석 배정이 성공적으로 수정되었습니다.' 
      });
    } catch (error) {
      console.error('좌석 배정 수정 오류:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('이미 배정되어 있습니다')) {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      
      res.status(500).json({ 
        error: '좌석 배정 수정 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 배정 삭제
  async deleteSeatAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: '좌석 배정 ID가 필요합니다.' });
        return;
      }

      // 기존 좌석 배정 확인
      const existingAssignment = await this.seatAssignmentService.getSeatAssignmentById(id);
      if (!existingAssignment) {
        res.status(404).json({ error: '해당 좌석 배정을 찾을 수 없습니다.' });
        return;
      }

      await this.seatAssignmentService.deleteSeatAssignment(id);
      
      res.status(200).json({ 
        message: '좌석 배정이 성공적으로 삭제되었습니다.' 
      });
    } catch (error) {
      console.error('좌석 배정 삭제 오류:', error);
      res.status(500).json({ 
        error: '좌석 배정 삭제 중 오류가 발생했습니다.' 
      });
    }
  }

  // 모든 좌석 배정 조회
  async getAllSeatAssignments(req: Request, res: Response): Promise<void> {
    try {
      const assignments = await this.seatAssignmentService.getAllSeatAssignments();
      res.status(200).json(assignments);
    } catch (error) {
      console.error('좌석 배정 조회 오류:', error);
      res.status(500).json({ 
        error: '좌석 배정 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 활성 좌석 배정만 조회
  async getActiveSeatAssignments(req: Request, res: Response): Promise<void> {
    try {
      const assignments = await this.seatAssignmentService.getActiveSeatAssignments();
      res.status(200).json(assignments);
    } catch (error) {
      console.error('활성 좌석 배정 조회 오류:', error);
      res.status(500).json({ 
        error: '활성 좌석 배정 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 특정 좌석의 배정 조회
  async getSeatAssignmentsBySeatId(req: Request, res: Response): Promise<void> {
    try {
      const { seatId } = req.params;
      
      if (!seatId) {
        res.status(400).json({ error: '좌석 ID가 필요합니다.' });
        return;
      }

      const assignments = await this.seatAssignmentService.getSeatAssignmentsBySeatId(seatId);
      res.status(200).json(assignments);
    } catch (error) {
      console.error('좌석별 배정 조회 오류:', error);
      res.status(500).json({ 
        error: '좌석별 배정 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 특정 학생의 좌석 배정 조회
  async getSeatAssignmentsByStudentId(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      
      if (!studentId) {
        res.status(400).json({ error: '학생 ID가 필요합니다.' });
        return;
      }

      const assignments = await this.seatAssignmentService.getSeatAssignmentsByStudentId(studentId);
      res.status(200).json(assignments);
    } catch (error) {
      console.error('학생별 배정 조회 오류:', error);
      res.status(500).json({ 
        error: '학생별 배정 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 특정 날짜의 좌석 배정 조회
  async getSeatAssignmentsByDate(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;
      
      if (!date) {
        res.status(400).json({ error: '날짜가 필요합니다.' });
        return;
      }

      // ISO 문자열을 Timestamp로 변환
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        res.status(400).json({ error: '유효한 날짜 형식이 아닙니다.' });
        return;
      }

      const timestamp = require('firebase-admin/firestore').Timestamp.fromDate(dateObj);
      const assignments = await this.seatAssignmentService.getSeatAssignmentsByDate(timestamp);
      res.status(200).json(assignments);
    } catch (error) {
      console.error('날짜별 배정 조회 오류:', error);
      res.status(500).json({ 
        error: '날짜별 배정 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 배정 검색
  async searchSeatAssignments(req: Request, res: Response): Promise<void> {
    try {
      const params: SeatAssignmentSearchParams = req.query as any;
      const assignments = await this.seatAssignmentService.searchSeatAssignments(params);
      res.status(200).json(assignments);
    } catch (error) {
      console.error('좌석 배정 검색 오류:', error);
      res.status(500).json({ 
        error: '좌석 배정 검색 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 배정 통계 조회
  async getSeatAssignmentStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.seatAssignmentService.getSeatAssignmentStatistics();
      res.status(200).json(statistics);
    } catch (error) {
      console.error('좌석 배정 통계 조회 오류:', error);
      res.status(500).json({ 
        error: '좌석 배정 통계 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 배정 상태 변경
  async updateSeatAssignmentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id) {
        res.status(400).json({ error: '좌석 배정 ID가 필요합니다.' });
        return;
      }

      if (!status || !['active', 'released'].includes(status)) {
        res.status(400).json({ 
          error: '유효한 상태값이 필요합니다. (active, released)' 
        });
        return;
      }

      // 기존 좌석 배정 확인
      const existingAssignment = await this.seatAssignmentService.getSeatAssignmentById(id);
      if (!existingAssignment) {
        res.status(404).json({ error: '해당 좌석 배정을 찾을 수 없습니다.' });
        return;
      }

      await this.seatAssignmentService.updateSeatAssignmentStatus(id, status);
      
      res.status(200).json({ 
        message: '좌석 배정 상태가 성공적으로 변경되었습니다.' 
      });
    } catch (error) {
      console.error('좌석 배정 상태 변경 오류:', error);
      res.status(500).json({ 
        error: '좌석 배정 상태 변경 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 배정 해제
  async releaseSeatAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: '좌석 배정 ID가 필요합니다.' });
        return;
      }

      // 기존 좌석 배정 확인
      const existingAssignment = await this.seatAssignmentService.getSeatAssignmentById(id);
      if (!existingAssignment) {
        res.status(404).json({ error: '해당 좌석 배정을 찾을 수 없습니다.' });
        return;
      }

      await this.seatAssignmentService.releaseSeatAssignment(id);
      
      res.status(200).json({ 
        message: '좌석 배정이 성공적으로 해제되었습니다.' 
      });
    } catch (error) {
      console.error('좌석 배정 해제 오류:', error);
      res.status(500).json({ 
        error: '좌석 배정 해제 중 오류가 발생했습니다.' 
      });
    }
  }

  // 학생의 현재 활성 좌석 배정 조회
  async getCurrentSeatAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      
      if (!studentId) {
        res.status(400).json({ error: '학생 ID가 필요합니다.' });
        return;
      }

      const assignment = await this.seatAssignmentService.getCurrentSeatAssignment(studentId);
      
      if (!assignment) {
        res.status(404).json({ error: '해당 학생의 활성 좌석 배정을 찾을 수 없습니다.' });
        return;
      }

      res.status(200).json(assignment);
    } catch (error) {
      console.error('현재 좌석 배정 조회 오류:', error);
      res.status(500).json({ 
        error: '현재 좌석 배정 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석의 현재 활성 배정 조회
  async getCurrentSeatAssignmentBySeat(req: Request, res: Response): Promise<void> {
    try {
      const { seatId } = req.params;
      
      if (!seatId) {
        res.status(400).json({ error: '좌석 ID가 필요합니다.' });
        return;
      }

      const assignment = await this.seatAssignmentService.getCurrentSeatAssignmentBySeat(seatId);
      
      if (!assignment) {
        res.status(404).json({ error: '해당 좌석의 활성 배정을 찾을 수 없습니다.' });
        return;
      }

      res.status(200).json(assignment);
    } catch (error) {
      console.error('좌석별 현재 배정 조회 오류:', error);
      res.status(500).json({ 
        error: '좌석별 현재 배정 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 학생의 좌석 배정 기록 조회
  async getStudentSeatAssignmentHistory(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      
      if (!studentId) {
        res.status(400).json({ error: '학생 ID가 필요합니다.' });
        return;
      }

      const assignments = await this.seatAssignmentService.getStudentSeatAssignmentHistory(studentId);
      res.status(200).json(assignments);
    } catch (error) {
      console.error('학생 좌석 배정 기록 조회 오류:', error);
      res.status(500).json({ 
        error: '학생 좌석 배정 기록 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석의 배정 기록 조회
  async getSeatAssignmentHistory(req: Request, res: Response): Promise<void> {
    try {
      const { seatId } = req.params;
      
      if (!seatId) {
        res.status(400).json({ error: '좌석 ID가 필요합니다.' });
        return;
      }

      const assignments = await this.seatAssignmentService.getSeatAssignmentHistory(seatId);
      res.status(200).json(assignments);
    } catch (error) {
      console.error('좌석 배정 기록 조회 오류:', error);
      res.status(500).json({ 
        error: '좌석 배정 기록 조회 중 오류가 발생했습니다.' 
      });
    }
  }
}
