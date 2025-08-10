import { BaseController } from './BaseController';
import { SeatService } from '../services/seat/SeatService';
import type { 
  Seat,
  ApiResponse
} from '@shared/types';
import { 
  AppError, 
  ERROR_CODES, 
  createErrorResponse, 
  logError 
} from '@shared/utils/error.utils';

export class SeatController extends BaseController {
  constructor(
    private seatService: SeatService
  ) {
    super();
  }

  async initializeSeats(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      await this.seatService.initializeSeats();
      
      const apiResponse: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: '좌석 데이터가 성공적으로 초기화되었습니다.'
        },
        message: '좌석 데이터가 성공적으로 초기화되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '좌석 데이터 초기화 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'SeatController', action: 'initializeSeats' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async getAllSeats(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const seats = await this.seatService.getAllSeats();
      
      const apiResponse: ApiResponse<Seat[]> = {
        success: true,
        data: seats,
        message: '좌석 목록을 성공적으로 조회했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId,
          count: seats.length
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '좌석 목록 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'SeatController', action: 'getAllSeats' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async getSeatById(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const { seatId } = request.params;
      
      if (!seatId) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '좌석 ID가 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const seat = await this.seatService.getSeatById(seatId);
      
      if (!seat) {
        const appError = AppError.notFound(ERROR_CODES.SEAT_NOT_FOUND, `좌석 ID ${seatId}를 찾을 수 없습니다.`, null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      const apiResponse: ApiResponse<Seat> = {
        success: true,
        data: seat,
        message: '좌석 정보를 성공적으로 조회했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '좌석 정보 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'SeatController', action: 'getSeatById', seatId: request.params.seatId });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async updateSeatStatus(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const { seatId } = request.params;
      const { status } = request.body;
      
      if (!seatId || !status) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, '좌석 ID와 상태가 필요합니다.', null, requestId);
        const errorResponse = createErrorResponse(appError);
        response.status(appError.statusCode).json(errorResponse);
        return;
      }
      
      await this.seatService.updateSeatStatus(seatId, status);
      
      const apiResponse: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: '좌석 상태가 성공적으로 업데이트되었습니다.'
        },
        message: '좌석 상태 업데이트 완료',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '좌석 상태 업데이트 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'SeatController', action: 'updateSeatStatus' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async getSeatStats(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      const stats = await this.seatService.getSeatStats();
      
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: stats,
        message: '좌석 통계를 성공적으로 조회했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '좌석 통계 조회 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'SeatController', action: 'getSeatStats' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  async swapSeatPositions(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id']
    try {
      const { seatAId, seatBId } = request.body
      if (!seatAId || !seatBId) {
        const appError = AppError.validation(ERROR_CODES.MISSING_REQUIRED_FIELD, 'seatAId와 seatBId가 필요합니다.', null, requestId)
        const errorResponse = createErrorResponse(appError)
        response.status(appError.statusCode).json(errorResponse)
        return
      }
      const result = await this.seatService.swapSeatPositions(seatAId, seatBId)
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: result,
        message: '좌석 배치가 성공적으로 교환되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      }
      response.json(apiResponse)
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '좌석 배치 교환 중 오류가 발생했습니다.', error, requestId)
      logError(appError, { component: 'SeatController', action: 'swapSeatPositions' })
      const errorResponse = createErrorResponse(appError)
      response.status(appError.statusCode).json(errorResponse)
    }
  }

  /**
   * 좌석 데이터 헬스체크
   */
  async checkSeatHealth(request: any, response: any): Promise<void> {
    try {
      console.log('좌석 데이터 헬스체크 요청');
      
      const health = await this.seatService.checkSeatHealth();
      
      response.status(200).json({
        success: true,
        data: health,
        message: '좌석 데이터 헬스체크가 완료되었습니다.'
      });
    } catch (error) {
      console.error('좌석 데이터 헬스체크 오류:', error);
      response.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '좌석 데이터 헬스체크에 실패했습니다.'
      });
    }
  }

  /**
   * 좌석 데이터 자동 복구
   */
  async autoRepairSeats(request: any, response: any): Promise<void> {
    try {
      console.log('좌석 데이터 자동 복구 요청');
      
      const repairResult = await this.seatService.autoRepairSeats();
      
      response.status(200).json({
        success: true,
        data: repairResult,
        message: '좌석 데이터 자동 복구가 완료되었습니다.'
      });
    } catch (error) {
      console.error('좌석 데이터 자동 복구 오류:', error);
      response.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '좌석 데이터 자동 복구에 실패했습니다.'
      });
    }
  }
}
