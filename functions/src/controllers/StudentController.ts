import { Request, Response } from 'express';
import { StudentService } from '../services/StudentService';
import type { CreateStudentRequest, UpdateStudentRequest, StudentSearchParams, StudentStatus, Student } from '@shared/types';

export class StudentController {
  private studentService: StudentService;

  constructor() {
    this.studentService = new StudentService();
  }

  // 학생 생성
  async createStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentData: CreateStudentRequest = req.body;
      const studentId = await this.studentService.createStudent(studentData);

      res.status(201).json({
        success: true,
        message: '학생이 성공적으로 생성되었습니다.',
        data: { id: studentId }
      });
    } catch (error) {
      console.error('학생 생성 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생 조회 (ID로)
  async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const student = await this.studentService.getStudentById(id);

      if (!student) {
        res.status(404).json({
          success: false,
          message: '학생을 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: student
      });
    } catch (error) {
      console.error('학생 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생 수정
  async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateStudentRequest = req.body;

      await this.studentService.updateStudent(id, updateData);

      // ✅ 추가: 업데이트된 학생 데이터 조회
      const updatedStudent = await this.studentService.getStudentById(id);

      res.json({
        success: true,
        message: '학생 정보가 성공적으로 수정되었습니다.',
        data: updatedStudent  // ✅ 추가: Frontend가 기대하는 data 필드
      });
    } catch (error) {
      console.error('학생 수정 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 수정 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생 삭제
  async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.studentService.deleteStudent(id);

      res.json({
        success: true,
        message: '학생이 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('학생 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 모든 학생 조회
  async getAllStudents(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as StudentStatus | undefined;

      let students: Student[];

      // query parameter에 status가 있으면 필터링, 없으면 전체 조회
      if (status) {
        students = await this.studentService.searchStudents({ status });
      } else {
        students = await this.studentService.getAllStudents();
      }

      res.json({
        success: true,
        data: students,
        count: students.length
      });
    } catch (error) {
      console.error('학생 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생 검색
  async searchStudents(req: Request, res: Response): Promise<void> {
    try {
      const searchParams: StudentSearchParams = req.query as any;
      const students = await this.studentService.searchStudents(searchParams);

      res.json({
        success: true,
        data: students,
        count: students.length
      });
    } catch (error) {
      console.error('학생 검색 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 검색 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학년별 학생 수 조회
  async getStudentCountByGrade(req: Request, res: Response): Promise<void> {
    try {
      const countByGrade = await this.studentService.getStudentCountByGrade();

      res.json({
        success: true,
        data: countByGrade
      });
    } catch (error) {
      console.error('학년별 학생 수 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '학년별 학생 수 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 활성 학생 수 조회
  async getActiveStudentCount(req: Request, res: Response): Promise<void> {
    try {
      const count = await this.studentService.getActiveStudentCount();

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('활성 학생 수 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '활성 학생 수 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생 의존성 확인
  async getStudentDependencies(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dependencies = await this.studentService.getStudentDependencies(id);

      res.json({
        success: true,
        data: dependencies
      });
    } catch (error) {
      console.error('학생 의존성 확인 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 의존성 확인 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 학생 계층적 삭제
  async deleteStudentHierarchically(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.studentService.deleteStudentHierarchically(id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('학생 계층적 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 계층적 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
}
