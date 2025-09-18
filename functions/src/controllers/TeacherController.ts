import { Request, Response } from 'express';
import { TeacherService } from '../services/TeacherService';
import { ClassSectionService } from '../services/ClassSectionService';
import type { CreateTeacherRequest, UpdateTeacherRequest, TeacherSearchParams } from '@shared/types';

export class TeacherController {
  private teacherService: TeacherService;
  private classSectionService: ClassSectionService;

  constructor() {
    this.teacherService = new TeacherService();
    this.classSectionService = new ClassSectionService();
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

  // 선생님의 수업 목록과 수강생 정보 조회
  async getTeacherClassesWithStudents(req: Request, res: Response): Promise<void> {
    try {
      const { id: teacherId } = req.params;

      // 1. 선생님의 수업 목록 조회 (teacherId로 필터링)
      const allClassSections = await this.classSectionService.getAllClassSections();
      const teacherClasses = allClassSections.filter(classSection => classSection.teacherId === teacherId);

      if (teacherClasses.length === 0) {
        res.json({
          success: true,
          data: [],
          message: '해당 선생님의 수업이 없습니다.'
        });
        return;
      }

      // 2. 각 수업의 상세 정보와 수강생 목록 조회
      const classesWithStudents = await Promise.all(
        teacherClasses.map(async (classSection) => {
          try {
            // 수업 상세 정보 조회 (Course, Teacher, Classroom 포함)
            const classWithDetails = await this.classSectionService.getClassSectionWithDetailsById(classSection.id);
            
            // 수강생 목록 조회
            const enrolledStudents = await this.classSectionService.getEnrolledStudents(classSection.id);
            
            return {
              ...classWithDetails,
              enrolledStudents
            };
          } catch (error) {
            console.error(`수업 ${classSection.id} 정보 조회 실패:`, error);
            // 에러가 발생해도 기본 정보는 반환
            return {
              ...classSection,
              course: null,
              teacher: null,
              classroom: null,
              enrolledStudents: []
            };
          }
        })
      );

      // 3. 수강생 통계 계산
      const studentStatistics = this.calculateStudentStatistics(classesWithStudents);

      res.json({
        success: true,
        data: classesWithStudents,
        count: classesWithStudents.length,
        statistics: studentStatistics
      });
    } catch (error) {
      console.error('선생님 수업 및 수강생 정보 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '선생님 수업 및 수강생 정보 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 수강생 통계 계산 메서드 (간소화)
  private calculateStudentStatistics(classesWithStudents: any[]): any {
    try {
      // 전체 수강생 수 (중복 포함)만 계산
      const totalStudents = classesWithStudents.reduce((total, classItem) => {
        return total + (classItem.enrolledStudents?.length || 0);
      }, 0);

      return {
        totalStudents  // 전체 수강생 수만 반환
      };
    } catch (error) {
      console.error('수강생 통계 계산 오류:', error);
      // 에러 발생 시 기본값 반환
      return {
        totalStudents: 0
      };
    }
  }
}
