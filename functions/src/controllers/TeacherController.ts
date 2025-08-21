import { Request, Response } from 'express';
import { TeacherService } from '../services/TeacherService';
import type { CreateTeacherRequest, UpdateTeacherRequest, TeacherSearchParams } from '@shared/types';

export class TeacherController {
  private teacherService: TeacherService;

  constructor() {
    this.teacherService = new TeacherService();
  }

  // 강사 생성
  async createTeacher(req: Request, res: Response): Promise<void> {
    try {
      const teacherData: CreateTeacherRequest = req.body;
      
      // 강사 데이터 검증
      const validation = await this.teacherService.validateTeacherData(teacherData);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: '강사 데이터가 유효하지 않습니다.',
          issues: validation.issues
        });
        return;
      }

      const teacherId = await this.teacherService.createTeacher(teacherData);

      res.status(201).json({
        success: true,
        message: '강사가 성공적으로 생성되었습니다.',
        data: { id: teacherId }
      });
    } catch (error) {
      console.error('강사 생성 오류:', error);
      res.status(500).json({
        success: false,
        message: '강사 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강사 조회 (ID로)
  async getTeacherById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const teacher = await this.teacherService.getTeacherById(id);

      if (!teacher) {
        res.status(404).json({
          success: false,
          message: '강사를 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: teacher
      });
    } catch (error) {
      console.error('강사 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '강사 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강사 수정
  async updateTeacher(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateTeacherRequest = req.body;

      // 강사 데이터 검증
      const validation = await this.teacherService.validateTeacherData(updateData);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: '강사 데이터가 유효하지 않습니다.',
          issues: validation.issues
        });
        return;
      }

      await this.teacherService.updateTeacher(id, updateData);

      res.json({
        success: true,
        message: '강사 정보가 성공적으로 수정되었습니다.'
      });
    } catch (error) {
      console.error('강사 수정 오류:', error);
      res.status(500).json({
        success: false,
        message: '강사 수정 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강사 삭제
  async deleteTeacher(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.teacherService.deleteTeacher(id);

      res.json({
        success: true,
        message: '강사가 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('강사 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '강사 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 모든 강사 조회
  async getAllTeachers(req: Request, res: Response): Promise<void> {
    try {
      const teachers = await this.teacherService.getAllTeachers();

      res.json({
        success: true,
        data: teachers,
        count: teachers.length
      });
    } catch (error) {
      console.error('강사 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '강사 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강사 검색
  async searchTeachers(req: Request, res: Response): Promise<void> {
    try {
      const searchParams: TeacherSearchParams = req.query as any;
      const teachers = await this.teacherService.searchTeachers(searchParams);

      res.json({
        success: true,
        data: teachers,
        count: teachers.length
      });
    } catch (error) {
      console.error('강사 검색 오류:', error);
      res.status(500).json({
        success: false,
        message: '강사 검색 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강사 통계 조회
  async getTeacherStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.teacherService.getTeacherStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('강사 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '강사 통계 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강사 정보 검증
  async validateTeacherData(req: Request, res: Response): Promise<void> {
    try {
      const teacherData = req.body;
      const validation = await this.teacherService.validateTeacherData(teacherData);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('강사 데이터 검증 오류:', error);
      res.status(500).json({
        success: false,
        message: '강사 데이터 검증 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 교사 의존성 확인
  async getTeacherDependencies(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dependencies = await this.teacherService.getTeacherDependencies(id);

      res.json({
        success: true,
        data: dependencies
      });
    } catch (error) {
      console.error('교사 의존성 확인 오류:', error);
      res.status(500).json({
        success: false,
        message: '교사 의존성 확인 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 교사 계층적 삭제
  async deleteTeacherHierarchically(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.teacherService.deleteTeacherHierarchically(id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('교사 계층적 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '교사 계층적 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
}
