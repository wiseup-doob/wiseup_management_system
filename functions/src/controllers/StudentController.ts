import { BaseController } from './BaseController';
import { StudentService } from '../services/student/StudentService';
import type { 
  Student, 
  ApiResponse,
  CreateStudentRequest,
  UpdateStudentRequest
} from '@shared/types';
import { 
  AppError, 
  ERROR_CODES, 
  createErrorResponse, 
  logError 
} from '@shared/utils/error.utils';

export class StudentController extends BaseController {
  constructor(
    private studentService: StudentService
  ) {
    super();
  }

  async initializeStudents(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      await this.studentService.initializeStudents();
      
      // 초기화 후 전체 학생 데이터 조회
      const studentsData = await this.studentService.getAllStudents();
      
      const apiResponse: ApiResponse<Student[]> = {
        success: true,
        data: studentsData,
        message: '학생 데이터가 성공적으로 초기화되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId,
          count: studentsData.length
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '학생 데이터 초기화 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'StudentController', action: 'initializeStudents' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async getStudents(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const students = await this.studentService.getAllStudents();
      
      const apiResponse: ApiResponse<Student[]> = {
        success: true,
        data: students,
        message: '학생 목록을 성공적으로 조회했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId,
          count: students.length
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '학생 목록 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'StudentController', action: 'getStudents' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async getStudentById(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    const { id } = request.params;
    
    try {
      if (!id) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '학생 ID가 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const student = await this.studentService.getStudentById(id);
      
      if (!student) {
        const appError = AppError.notFound(ERROR_CODES.STUDENT_NOT_FOUND, `학생 ID ${id}를 찾을 수 없습니다.`, null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const apiResponse: ApiResponse<Student> = {
        success: true,
        data: student,
        message: '학생 정보를 성공적으로 조회했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '학생 정보 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'StudentController', action: 'getStudentById', studentId: id });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async updateAttendance(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    const { studentId } = request.params;
    const { status, updatedBy = 'admin', checkInTime, checkOutTime, location, notes } = request.body;
    
    try {
      if (!studentId || !status) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '학생 ID와 출석 상태가 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      console.log('=== 학생 출석 상태 업데이트 ===');
      console.log('학생 ID:', studentId);
      console.log('상태:', status);
      console.log('업데이트자:', updatedBy);
      console.log('등원 시간:', checkInTime);
      console.log('하원 시간:', checkOutTime);
      console.log('위치:', location);
      console.log('메모:', notes);
      
      // 먼저 모든 학생 목록을 확인
      const allStudents = await this.studentService.getAllStudents();
      console.log('전체 학생 수:', allStudents.length);
      console.log('전체 학생 ID 목록:', allStudents.map(s => s.id));
      
      // 요청된 학생 ID와 유사한 학생들 찾기
      const similarStudents = allStudents.filter(s => 
        s.id.includes(studentId.split('_')[1] || '') || 
        s.id.includes(studentId.split('_')[2] || '')
      );
      console.log('유사한 학생 ID들:', similarStudents.map(s => ({ id: s.id, name: s.name })));
      
      // 실제 Firestore에서 해당 문서가 존재하는지 직접 확인
      const { getFirestore } = await import('../config/firebase.js');
      const db = getFirestore();
      const studentDoc = await db.collection('students').doc(studentId).get();
      console.log('Firestore에서 직접 조회한 문서 존재 여부:', studentDoc.exists);
      if (studentDoc.exists) {
        console.log('Firestore 문서 데이터:', studentDoc.data());
      }
      
      await this.studentService.updateAttendance(studentId, status, updatedBy);
      
      const apiResponse: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: '출석 상태가 성공적으로 업데이트되었습니다.'
        },
        message: '출석 상태 업데이트 완료',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      console.error('❌ 출석 상태 업데이트 실패:', error);
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '출석 상태 업데이트 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'StudentController', action: 'updateAttendance', studentId });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async createStudent(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const { name, grade, className, status = 'active' } = request.body as CreateStudentRequest;
      
      if (!name || !grade || !className) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '필수 필드가 누락되었습니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const student = await this.studentService.createStudent({
        name,
        grade,
        className,
        status
      });
      
      const apiResponse: ApiResponse<Student> = {
        success: true,
        data: student,
        message: '학생이 성공적으로 생성되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.status(201).json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '학생 생성 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'StudentController', action: 'createStudent' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async updateStudent(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    const { id } = request.params;
    
    try {
      if (!id) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '학생 ID가 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const updateData = request.body as UpdateStudentRequest;
      
      if (Object.keys(updateData).length === 0) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '업데이트할 데이터가 없습니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const student = await this.studentService.updateStudent(id, updateData);
      
      if (!student) {
        const appError = AppError.notFound(ERROR_CODES.STUDENT_NOT_FOUND, `학생 ID ${id}를 찾을 수 없습니다.`, null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const apiResponse: ApiResponse<Student> = {
        success: true,
        data: student,
        message: '학생 정보가 성공적으로 업데이트되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '학생 정보 업데이트 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'StudentController', action: 'updateStudent', userId: id });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async deleteStudent(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    const { id } = request.params;
    
    try {
      if (!id) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '학생 ID가 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const success = await this.studentService.deleteStudent(id);
      
      if (!success) {
        const appError = AppError.notFound(ERROR_CODES.STUDENT_NOT_FOUND, `학생 ID ${id}를 찾을 수 없습니다.`, null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const apiResponse: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: '학생이 성공적으로 삭제되었습니다.'
        },
        message: '학생 삭제 완료',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '학생 삭제 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'StudentController', action: 'deleteStudent', studentId: id });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async searchStudents(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    const { query, limit = 10 } = request.query;
    
    try {
      if (!query) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '검색어가 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const students = await this.studentService.searchStudents(query as string, parseInt(limit as string));
      
      const apiResponse: ApiResponse<Student[]> = {
        success: true,
        data: students,
        message: '학생 검색이 완료되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId,
          count: students.length
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '학생 검색 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'StudentController', action: 'searchStudents' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }
} 