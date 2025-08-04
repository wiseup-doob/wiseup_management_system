import { BaseController } from './BaseController';
import { StudentService } from '../services/student/StudentService';

export class StudentController extends BaseController {
  constructor(private studentService: StudentService) {
    super();
  }

  async initializeStudents(request: any, response: any): Promise<void> {
    try {
      const studentsData = await this.studentService.initializeStudents();
      
      response.json(this.createSuccessResponse(
        studentsData,
        `${studentsData.length}명의 학생 데이터가 저장되었습니다.`
      ));
    } catch (error) {
      response.status(500).json(this.createErrorResponse(
        '학생 데이터 초기화 중 오류가 발생했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async getStudents(request: any, response: any): Promise<void> {
    try {
      const students = await this.studentService.getAllStudents();
      
      response.json(this.createSuccessResponse(students));
    } catch (error) {
      response.status(500).json(this.createErrorResponse(
        '학생 데이터 조회 중 오류가 발생했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async getStudentById(request: any, response: any): Promise<void> {
    try {
      const { id } = request.params;
      const student = await this.studentService.getStudentById(id);
      
      if (!student) {
        response.status(404).json(this.createErrorResponse('학생을 찾을 수 없습니다.'));
        return;
      }
      
      response.json(this.createSuccessResponse(student));
    } catch (error) {
      response.status(500).json(this.createErrorResponse(
        '학생 데이터 조회 중 오류가 발생했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }
} 