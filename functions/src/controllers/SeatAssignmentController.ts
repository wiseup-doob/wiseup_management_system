import { BaseController } from './BaseController';
import { SeatAssignmentService, AssignStudentRequest, UnassignStudentRequest } from '../services/assignment/SeatAssignmentService';
import type { 
  ApiResponse
} from '@shared/types';
import { 
  AppError, 
  ERROR_CODES, 
  createErrorResponse, 
  logError 
} from '@shared/utils/error.utils';

export class SeatAssignmentController extends BaseController {
  constructor(
    private seatAssignmentService: SeatAssignmentService
  ) {
    super();
  }

  /**
   * 학생을 좌석에 배정
   */
  async assignStudentToSeat(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const { seatId, studentId, assignedBy, notes } = request.body;
      
      if (!seatId || !studentId) {
        const appError = AppError.badRequest(ERROR_CODES.INVALID_INPUT, '좌석 ID와 학생 ID는 필수입니다.');
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }

      const assignRequest: AssignStudentRequest = {
        seatId,
        studentId,
        assignedBy,
        notes
      };

      const assignment = await this.seatAssignmentService.assignStudentToSeat(assignRequest);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: assignment,
        message: '학생이 좌석에 성공적으로 배정되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '학생 좌석 배정 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'SeatAssignmentController', action: 'assignStudentToSeat' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  /**
   * 좌석에서 학생 배정 해제
   */
  async unassignStudentFromSeat(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      console.log('🔍 unassignStudentFromSeat 시작:', { requestId, body: request.body });
      
      const { seatId, studentId, unassignedBy, notes } = request.body;
      
      // studentId도 필수로 검증
      if (!seatId || !studentId) {
        const appError = AppError.badRequest(ERROR_CODES.INVALID_INPUT, '좌석 ID와 학생 ID는 필수입니다.');
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }

      console.log('📋 요청 데이터 검증 완료:', { seatId, studentId, unassignedBy, notes });

      const unassignRequest: UnassignStudentRequest = {
        seatId,
        studentId,  // studentId 추가
        unassignedBy,
        notes
      };

      console.log('🚀 SeatAssignmentService 호출 시작');
      const result = await this.seatAssignmentService.unassignStudentFromSeat(unassignRequest);
      console.log('✅ SeatAssignmentService 호출 완료:', result);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: { 
          success: result,
          seatId: request.seatId,
          studentId: request.studentId,
          action: 'unassigned'
        },
        message: `학생 ${request.studentId}의 좌석 ${request.seatId} 배정이 성공적으로 해제되었습니다.`,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      console.log('📤 응답 전송:', apiResponse);
      response.json(apiResponse);
    } catch (error) {
      console.error('❌ unassignStudentFromSeat 오류 발생:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        requestId,
        body: request.body,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      
      // 구체적인 에러 메시지 추출
      let errorMessage = '학생 좌석 배정 해제 중 오류가 발생했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, errorMessage, error, requestId);
      logError(appError, { component: 'SeatAssignmentController', action: 'unassignStudentFromSeat' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  /**
   * 학생들을 좌석에 일괄 배정
   */
  async bulkAssignStudents(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const { studentIds } = request.body;
      
      if (!studentIds || !Array.isArray(studentIds)) {
        const appError = AppError.badRequest(ERROR_CODES.INVALID_INPUT, '학생 ID 배열은 필수입니다.');
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }

      const assignments = await this.seatAssignmentService.bulkAssignStudents(studentIds);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: {
          assignments,
          count: assignments.length
        },
        message: `${assignments.length}명의 학생이 좌석에 성공적으로 배정되었습니다.`,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '학생 일괄 좌석 배정 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'SeatAssignmentController', action: 'bulkAssignStudents' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  /**
   * 좌석 ID로 배정 정보 조회
   */
  async getAssignmentBySeatId(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const { seatId } = request.params;
      
      if (!seatId) {
        const appError = AppError.badRequest(ERROR_CODES.INVALID_INPUT, '좌석 ID는 필수입니다.');
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }

      const assignment = await this.seatAssignmentService.getAssignmentBySeatId(seatId);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: assignment,
        message: assignment ? '배정 정보를 성공적으로 조회했습니다.' : '배정된 학생이 없습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '배정 정보 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'SeatAssignmentController', action: 'getAssignmentBySeatId' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  /**
   * 학생 ID로 배정 정보 조회
   */
  async getAssignmentByStudentId(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const { studentId } = request.params;
      
      if (!studentId) {
        const appError = AppError.badRequest(ERROR_CODES.INVALID_INPUT, '학생 ID는 필수입니다.');
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }

      const assignment = await this.seatAssignmentService.getAssignmentByStudentId(studentId);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: assignment,
        message: assignment ? '배정 정보를 성공적으로 조회했습니다.' : '배정된 좌석이 없습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '배정 정보 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'SeatAssignmentController', action: 'getAssignmentByStudentId' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  /**
   * 모든 배정 정보 조회
   */
  async getAllAssignments(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const assignments = await this.seatAssignmentService.getAllAssignments();
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: assignments,
        message: `${assignments.length}개의 배정 정보를 성공적으로 조회했습니다.`,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId,
          count: assignments.length
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '배정 정보 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'SeatAssignmentController', action: 'getAllAssignments' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  /**
   * 배정 통계 조회
   */
  async getAssignmentStats(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const stats = await this.seatAssignmentService.getAssignmentStats();
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: stats,
        message: '배정 통계를 성공적으로 조회했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '배정 통계 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'SeatAssignmentController', action: 'getAssignmentStats' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }
}
