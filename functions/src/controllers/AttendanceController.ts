import { BaseController } from './BaseController';
import { AttendanceService } from '../services/attendance/AttendanceService';
import type { 
  AttendanceRecord,
  ApiResponse,
  CreateAttendanceRecordRequest,
  UpdateAttendanceRecordRequest
} from '@shared/types';
import { 
  AppError, 
  ERROR_CODES, 
  createErrorResponse, 
  logError 
} from '@shared/utils/error.utils';

export class AttendanceController extends BaseController {
  constructor(
    private attendanceService: AttendanceService
  ) {
    super();
  }

  async initializeAttendanceData(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      // 먼저 학생 데이터가 있는지 확인
      const { studentIds, seatIds } = request.body;
      
      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '출석 데이터 초기화를 위해서는 학생 ID 배열이 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const result = await this.attendanceService.initializeAttendanceData(studentIds, seatIds);
      
      const apiResponse: ApiResponse<{ count: number; message: string }> = {
        success: true,
        data: {
          count: result.count,
          message: result.message
        },
        message: '출석 데이터가 성공적으로 초기화되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId,
          count: result.count
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '출석 데이터 초기화 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'AttendanceController', action: 'initializeAttendanceData' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async initializeTodayAttendanceData(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const { studentIds, seatIds } = request.body;
      
      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '오늘 출석 데이터 초기화를 위해서는 학생 ID 배열이 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const result = await this.attendanceService.initializeTodayAttendanceData(studentIds, seatIds);
      
      const apiResponse: ApiResponse<{ count: number; message: string }> = {
        success: true,
        data: {
          count: result.count,
          message: result.message
        },
        message: '오늘 출석 데이터가 성공적으로 초기화되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId,
          count: result.count
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '오늘 출석 데이터 초기화 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'AttendanceController', action: 'initializeTodayAttendanceData' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async getAttendanceRecords(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const filters = request.query;
      const records = await this.attendanceService.getAttendanceRecords(filters);
      
      const apiResponse: ApiResponse<AttendanceRecord[]> = {
        success: true,
        data: records,
        message: '출석 기록을 성공적으로 조회했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId,
          count: records.length
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '출석 기록 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'AttendanceController', action: 'getAttendanceRecords' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async getAttendanceRecordById(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    const { id } = request.params;
    
    try {
      if (!id) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '출석 기록 ID가 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const record = await this.attendanceService.getAttendanceRecordById(id);
      
      if (!record) {
        const appError = AppError.notFound(ERROR_CODES.ATTENDANCE_RECORD_NOT_FOUND, `출석 기록 ID ${id}를 찾을 수 없습니다.`, null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const apiResponse: ApiResponse<AttendanceRecord> = {
        success: true,
        data: record,
        message: '출석 기록을 성공적으로 조회했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '출석 기록 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'AttendanceController', action: 'getAttendanceRecordById', recordId: id });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async createAttendanceRecord(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const data = request.body as CreateAttendanceRecordRequest;
      
      if (!data.studentId || !data.date || !data.status) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '필수 필드가 누락되었습니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const record = await this.attendanceService.createAttendanceRecord(data);
      
      const apiResponse: ApiResponse<AttendanceRecord> = {
        success: true,
        data: record,
        message: '출석 기록이 성공적으로 생성되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.status(201).json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '출석 기록 생성 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'AttendanceController', action: 'createAttendanceRecord' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async updateAttendanceRecord(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    const { id } = request.params;
    
    try {
      if (!id) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '출석 기록 ID가 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const updateData = request.body as UpdateAttendanceRecordRequest;
      
      if (Object.keys(updateData).length === 0) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '업데이트할 데이터가 없습니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const record = await this.attendanceService.updateAttendanceRecord(id, updateData);
      
      if (!record) {
        const appError = AppError.notFound(ERROR_CODES.ATTENDANCE_RECORD_NOT_FOUND, `출석 기록 ID ${id}를 찾을 수 없습니다.`, null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const apiResponse: ApiResponse<AttendanceRecord> = {
        success: true,
        data: record,
        message: '출석 기록이 성공적으로 업데이트되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '출석 기록 업데이트 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'AttendanceController', action: 'updateAttendanceRecord', recordId: id });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async deleteAttendanceRecord(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    const { id } = request.params;
    
    try {
      if (!id) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '출석 기록 ID가 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const success = await this.attendanceService.deleteAttendanceRecord(id);
      
      if (!success) {
        const appError = AppError.notFound(ERROR_CODES.ATTENDANCE_RECORD_NOT_FOUND, `출석 기록 ID ${id}를 찾을 수 없습니다.`, null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const apiResponse: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: '출석 기록이 성공적으로 삭제되었습니다.'
        },
        message: '출석 기록 삭제 완료',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '출석 기록 삭제 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'AttendanceController', action: 'deleteAttendanceRecord', recordId: id });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async getAttendanceByStudent(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    const { studentId } = request.params;
    
    try {
      if (!studentId) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '학생 ID가 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const { startDate, endDate } = request.query;
      const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
      
      const records = await this.attendanceService.getAttendanceByStudent(studentId, dateRange);
      
      const apiResponse: ApiResponse<AttendanceRecord[]> = {
        success: true,
        data: records,
        message: '학생의 출석 기록을 성공적으로 조회했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId,
          count: records.length
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '학생 출석 기록 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'AttendanceController', action: 'getAttendanceByStudent', studentId });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async getAttendanceByDate(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    const { date } = request.params;
    
    try {
      if (!date) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '날짜가 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const records = await this.attendanceService.getAttendanceByDate(date);
      
      const apiResponse: ApiResponse<AttendanceRecord[]> = {
        success: true,
        data: records,
        message: '해당 날짜의 출석 기록을 성공적으로 조회했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId,
          count: records.length
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '날짜별 출석 기록 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'AttendanceController', action: 'getAttendanceByDate', date });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async getAttendanceStatistics(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const { startDate, endDate } = request.query;
      const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
      
      const statistics = await this.attendanceService.getAttendanceStatistics(dateRange);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: statistics,
        message: '출석 통계를 성공적으로 조회했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '출석 통계 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'AttendanceController', action: 'getAttendanceStatistics' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async bulkUpdateAttendance(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const { records } = request.body;
      
      if (!records || !Array.isArray(records) || records.length === 0) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '출석 기록 배열이 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const result = await this.attendanceService.bulkUpdateAttendance(records);
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: result,
        message: '출석 기록 일괄 업데이트가 완료되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '출석 기록 일괄 업데이트 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'AttendanceController', action: 'bulkUpdateAttendance' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }
}
