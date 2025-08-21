import { Request, Response } from 'express';
import { SeatService } from '../services/SeatService';
import type { 
  CreateSeatRequest, 
  UpdateSeatRequest, 
  SeatSearchParams 
} from '@shared/types';

export class SeatController {
  private seatService: SeatService;

  constructor() {
    this.seatService = new SeatService();
  }

  // 좌석 생성
  async createSeat(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateSeatRequest = req.body;

      // 필수 필드 검증
      if (data.seatNumber === undefined) {
        res.status(400).json({ 
          error: '좌석 번호는 필수입니다.' 
        });
        return;
      }

      // 좌석 번호 중복 확인
      const exists = await this.seatService.isSeatNumberExists(data.seatNumber);
      if (exists) {
        res.status(400).json({ 
          error: `좌석 번호 ${data.seatNumber}가 이미 존재합니다.` 
        });
        return;
      }

      const seatId = await this.seatService.createSeat(data);
      
      res.status(201).json({ 
        message: '좌석이 성공적으로 생성되었습니다.',
        seatId 
      });
    } catch (error) {
      console.error('좌석 생성 오류:', error);
      res.status(500).json({ 
        error: '좌석 생성 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 조회 (ID로)
  async getSeatById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: '좌석 ID가 필요합니다.' });
        return;
      }

      const seat = await this.seatService.getSeatById(id);
      
      if (!seat) {
        res.status(404).json({ error: '해당 좌석을 찾을 수 없습니다.' });
        return;
      }

      res.status(200).json(seat);
    } catch (error) {
      console.error('좌석 조회 오류:', error);
      res.status(500).json({ 
        error: '좌석 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 수정
  async updateSeat(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateSeatRequest = req.body;
      
      if (!id) {
        res.status(400).json({ error: '좌석 ID가 필요합니다.' });
        return;
      }

      // 기존 좌석 확인
      const existingSeat = await this.seatService.getSeatById(id);
      if (!existingSeat) {
        res.status(404).json({ error: '해당 좌석을 찾을 수 없습니다.' });
        return;
      }

      // 좌석 번호 변경 시 중복 확인
      if (data.seatNumber !== undefined && data.seatNumber !== existingSeat.seatNumber) {
        const exists = await this.seatService.isSeatNumberExists(data.seatNumber, id);
        if (exists) {
          res.status(400).json({ 
            error: `좌석 번호 ${data.seatNumber}가 이미 존재합니다.` 
          });
          return;
        }
      }

      await this.seatService.updateSeat(id, data);
      
      res.status(200).json({ 
        message: '좌석이 성공적으로 수정되었습니다.' 
      });
    } catch (error) {
      console.error('좌석 수정 오류:', error);
      res.status(500).json({ 
        error: '좌석 수정 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 삭제
  async deleteSeat(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: '좌석 ID가 필요합니다.' });
        return;
      }

      // 기존 좌석 확인
      const existingSeat = await this.seatService.getSeatById(id);
      if (!existingSeat) {
        res.status(404).json({ error: '해당 좌석을 찾을 수 없습니다.' });
        return;
      }

      await this.seatService.deleteSeat(id);
      
      res.status(200).json({ 
        message: '좌석이 성공적으로 삭제되었습니다.' 
      });
    } catch (error) {
      console.error('좌석 삭제 오류:', error);
      res.status(500).json({ 
        error: '좌석 삭제 중 오류가 발생했습니다.' 
      });
    }
  }

  // 모든 좌석 조회
  async getAllSeats(req: Request, res: Response): Promise<void> {
    try {
      const seats = await this.seatService.getAllSeats();
      res.status(200).json(seats);
    } catch (error) {
      console.error('좌석 조회 오류:', error);
      res.status(500).json({ 
        error: '좌석 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 활성 좌석만 조회
  async getActiveSeats(req: Request, res: Response): Promise<void> {
    try {
      const seats = await this.seatService.getActiveSeats();
      res.status(200).json(seats);
    } catch (error) {
      console.error('활성 좌석 조회 오류:', error);
      res.status(500).json({ 
        error: '활성 좌석 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 사용 가능한 좌석만 조회
  async getAvailableSeats(req: Request, res: Response): Promise<void> {
    try {
      const seats = await this.seatService.getAvailableSeats();
      res.status(200).json(seats);
    } catch (error) {
      console.error('사용 가능한 좌석 조회 오류:', error);
      res.status(500).json({ 
        error: '사용 가능한 좌석 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 번호별로 정렬된 조회
  async getSeatsByNumber(req: Request, res: Response): Promise<void> {
    try {
      const seats = await this.seatService.getSeatsByNumber();
      res.status(200).json(seats);
    } catch (error) {
      console.error('좌석 번호별 조회 오류:', error);
      res.status(500).json({ 
        error: '좌석 번호별 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 상태별 좌석 조회
  async getSeatsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      
      if (!status || !['vacant', 'occupied', 'unavailable'].includes(status)) {
        res.status(400).json({ 
          error: '유효한 상태값이 필요합니다. (vacant, occupied, unavailable)' 
        });
        return;
      }

      const seats = await this.seatService.getSeatsByStatus(status as any);
      res.status(200).json(seats);
    } catch (error) {
      console.error('상태별 좌석 조회 오류:', error);
      res.status(500).json({ 
        error: '상태별 좌석 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 검색
  async searchSeats(req: Request, res: Response): Promise<void> {
    try {
      const params: SeatSearchParams = req.query as any;
      const seats = await this.seatService.searchSeats(params);
      res.status(200).json(seats);
    } catch (error) {
      console.error('좌석 검색 오류:', error);
      res.status(500).json({ 
        error: '좌석 검색 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 통계 조회
  async getSeatStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.seatService.getSeatStatistics();
      res.status(200).json(statistics);
    } catch (error) {
      console.error('좌석 통계 조회 오류:', error);
      res.status(500).json({ 
        error: '좌석 통계 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 상태 변경
  async updateSeatStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id) {
        res.status(400).json({ error: '좌석 ID가 필요합니다.' });
        return;
      }

      if (!status || !['vacant', 'occupied', 'unavailable'].includes(status)) {
        res.status(400).json({ 
          error: '유효한 상태값이 필요합니다. (vacant, occupied, unavailable)' 
        });
        return;
      }

      // 기존 좌석 확인
      const existingSeat = await this.seatService.getSeatById(id);
      if (!existingSeat) {
        res.status(404).json({ error: '해당 좌석을 찾을 수 없습니다.' });
        return;
      }

      await this.seatService.updateSeatStatus(id, status);
      
      res.status(200).json({ 
        message: '좌석 상태가 성공적으로 변경되었습니다.' 
      });
    } catch (error) {
      console.error('좌석 상태 변경 오류:', error);
      res.status(500).json({ 
        error: '좌석 상태 변경 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 활성화/비활성화
  async toggleSeatActive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      if (!id) {
        res.status(400).json({ error: '좌석 ID가 필요합니다.' });
        return;
      }

      if (typeof isActive !== 'boolean') {
        res.status(400).json({ error: 'isActive는 boolean 값이어야 합니다.' });
        return;
      }

      // 기존 좌석 확인
      const existingSeat = await this.seatService.getSeatById(id);
      if (!existingSeat) {
        res.status(404).json({ error: '해당 좌석을 찾을 수 없습니다.' });
        return;
      }

      await this.seatService.toggleSeatActive(id, isActive);
      
      res.status(200).json({ 
        message: `좌석이 성공적으로 ${isActive ? '활성화' : '비활성화'}되었습니다.` 
      });
    } catch (error) {
      console.error('좌석 활성화/비활성화 오류:', error);
      res.status(500).json({ 
        error: '좌석 활성화/비활성화 중 오류가 발생했습니다.' 
      });
    }
  }

  // 다음 사용 가능한 좌석 번호 찾기
  async getNextAvailableSeatNumber(req: Request, res: Response): Promise<void> {
    try {
      const nextNumber = await this.seatService.getNextAvailableSeatNumber();
      res.status(200).json({ nextSeatNumber: nextNumber });
    } catch (error) {
      console.error('다음 좌석 번호 조회 오류:', error);
      res.status(500).json({ 
        error: '다음 좌석 번호 조회 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 일괄 생성
  async createMultipleSeats(req: Request, res: Response): Promise<void> {
    try {
      const { startNumber, count } = req.body;
      
      if (startNumber === undefined || count === undefined) {
        res.status(400).json({ 
          error: 'startNumber와 count는 필수입니다.' 
        });
        return;
      }

      if (typeof startNumber !== 'number' || typeof count !== 'number') {
        res.status(400).json({ 
          error: 'startNumber와 count는 숫자여야 합니다.' 
        });
        return;
      }

      if (count <= 0 || count > 100) {
        res.status(400).json({ 
          error: 'count는 1에서 100 사이의 값이어야 합니다.' 
        });
        return;
      }

      const seatIds = await this.seatService.createMultipleSeats(startNumber, count);
      
      res.status(201).json({ 
        message: `${count}개의 좌석이 성공적으로 생성되었습니다.`,
        seatIds,
        startNumber,
        count
      });
    } catch (error) {
      console.error('좌석 일괄 생성 오류:', error);
      res.status(500).json({ 
        error: '좌석 일괄 생성 중 오류가 발생했습니다.' 
      });
    }
  }

  // 좌석 일괄 비활성화
  async deactivateMultipleSeats(req: Request, res: Response): Promise<void> {
    try {
      const { seatNumbers } = req.body;
      
      if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        res.status(400).json({ 
          error: 'seatNumbers는 비어있지 않은 배열이어야 합니다.' 
        });
        return;
      }

      if (seatNumbers.length > 100) {
        res.status(400).json({ 
          error: '한 번에 최대 100개까지만 비활성화할 수 있습니다.' 
        });
        return;
      }

      await this.seatService.deactivateMultipleSeats(seatNumbers);
      
      res.status(200).json({ 
        message: `${seatNumbers.length}개의 좌석이 성공적으로 비활성화되었습니다.` 
      });
    } catch (error) {
      console.error('좌석 일괄 비활성화 오류:', error);
      res.status(500).json({ 
        error: '좌석 일괄 비활성화 중 오류가 발생했습니다.' 
      });
    }
  }
}
