import { Request, Response } from 'express';
import { ClassroomService } from '../services/ClassroomService';
import type { CreateClassroomRequest, UpdateClassroomRequest, ClassroomSearchParams } from '@shared/types';

export class ClassroomController {
  private classroomService: ClassroomService;

  constructor() {
    this.classroomService = new ClassroomService();
  }

  // 교실 생성
  async createClassroom(req: Request, res: Response): Promise<void> {
    try {
      const classroomData: CreateClassroomRequest = req.body;
      
      // 교실 데이터 검증
      const validation = await this.classroomService.validateClassroomData(classroomData);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: '교실 데이터가 유효하지 않습니다.',
          issues: validation.issues
        });
        return;
      }

      const classroomId = await this.classroomService.createClassroom(classroomData);

      res.status(201).json({
        success: true,
        message: '교실이 성공적으로 생성되었습니다.',
        data: { id: classroomId }
      });
    } catch (error) {
      console.error('교실 생성 오류:', error);
      res.status(500).json({
        success: false,
        message: '교실 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 교실 조회 (ID로)
  async getClassroomById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const classroom = await this.classroomService.getClassroomById(id);

      if (!classroom) {
        res.status(404).json({
          success: false,
          message: '교실을 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: classroom
      });
    } catch (error) {
      console.error('교실 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '교실 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 교실 수정
  async updateClassroom(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateClassroomRequest = req.body;

      // 교실 데이터 검증
      const validation = await this.classroomService.validateClassroomData(updateData);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: '교실 데이터가 유효하지 않습니다.',
          issues: validation.issues
        });
        return;
      }

      await this.classroomService.updateClassroom(id, updateData);

      res.json({
        success: true,
        message: '교실 정보가 성공적으로 수정되었습니다.'
      });
    } catch (error) {
      console.error('교실 수정 오류:', error);
      res.status(500).json({
        success: false,
        message: '교실 수정 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 교실 삭제
  async deleteClassroom(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.classroomService.deleteClassroom(id);

      res.json({
        success: true,
        message: '교실이 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('교실 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '교실 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 모든 교실 조회
  async getAllClassrooms(req: Request, res: Response): Promise<void> {
    try {
      const classrooms = await this.classroomService.getAllClassrooms();

      res.json({
        success: true,
        data: classrooms,
        count: classrooms.length
      });
    } catch (error) {
      console.error('교실 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '교실 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 교실 검색
  async searchClassrooms(req: Request, res: Response): Promise<void> {
    try {
      const searchParams: ClassroomSearchParams = req.query as any;
      const classrooms = await this.classroomService.searchClassrooms(searchParams);

      res.json({
        success: true,
        data: classrooms,
        count: classrooms.length
      });
    } catch (error) {
      console.error('교실 검색 오류:', error);
      res.status(500).json({
        success: false,
        message: '교실 검색 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 교실 통계 조회
  async getClassroomStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.classroomService.getClassroomStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('교실 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '교실 통계 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 교실 정보 검증
  async validateClassroomData(req: Request, res: Response): Promise<void> {
    try {
      const classroomData = req.body;
      const validation = await this.classroomService.validateClassroomData(classroomData);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('교실 데이터 검증 오류:', error);
      res.status(500).json({
        success: false,
        message: '교실 데이터 검증 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강의실 의존성 확인
  async getClassroomDependencies(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dependencies = await this.classroomService.getClassroomDependencies(id);

      res.json({
        success: true,
        data: dependencies
      });
    } catch (error) {
      console.error('강의실 의존성 확인 오류:', error);
      res.status(500).json({
        success: false,
        message: '강의실 의존성 확인 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강의실 계층적 삭제
  async deleteClassroomHierarchically(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.classroomService.deleteClassroomHierarchically(id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('강의실 계층적 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '강의실 계층적 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
}
