import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
import type { 
  Seat, 
  CreateSeatRequest, 
  UpdateSeatRequest, 
  SeatSearchParams 
} from '@shared/types';

export class SeatService extends BaseService {
  constructor() {
    super('seats');
  }

  // 좌석 생성
  async createSeat(data: CreateSeatRequest): Promise<string> {
    const seatData: Omit<Seat, 'id'> = {
      ...data,
      status: data.status || 'vacant',
      isActive: data.isActive ?? true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return this.create(seatData);
  }

  // 좌석 조회 (ID로)
  async getSeatById(id: string): Promise<Seat | null> {
    return this.getById<Seat>(id);
  }

  // 좌석 수정
  async updateSeat(id: string, data: UpdateSeatRequest): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await this.update(id, updateData);
  }

  // 좌석 삭제
  async deleteSeat(id: string): Promise<void> {
    await this.delete(id);
  }

  // 모든 좌석 조회
  async getAllSeats(): Promise<Seat[]> {
    return this.getAll<Seat>();
  }

  // 활성 좌석만 조회
  async getActiveSeats(): Promise<Seat[]> {
    const query = this.db.collection(this.collectionName)
                         .where('isActive', '==', true);
    
    return this.search<Seat>(query);
  }

  // 사용 가능한 좌석만 조회 (활성 + 빈 좌석)
  async getAvailableSeats(): Promise<Seat[]> {
    const query = this.db.collection(this.collectionName)
                         .where('isActive', '==', true)
                         .where('status', '==', 'vacant');
    
    return this.search<Seat>(query);
  }

  // 좌석 번호별로 정렬된 조회
  async getSeatsByNumber(): Promise<Seat[]> {
    const query = this.db.collection(this.collectionName)
                         .orderBy('seatNumber', 'asc');
    
    return this.search<Seat>(query);
  }

  // 상태별 좌석 조회
  async getSeatsByStatus(status: 'vacant' | 'occupied' | 'unavailable'): Promise<Seat[]> {
    const query = this.db.collection(this.collectionName)
                         .where('status', '==', status);
    
    return this.search<Seat>(query);
  }

  // 좌석 검색
  async searchSeats(params: SeatSearchParams): Promise<Seat[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName);

    // 좌석 번호로 검색
    if (params.seatNumber !== undefined) {
      query = query.where('seatNumber', '==', params.seatNumber);
    }

    // 상태별 검색
    if (params.status !== undefined) {
      query = query.where('status', '==', params.status);
    }

    // 활성화 상태별 검색
    if (params.isActive !== undefined) {
      query = query.where('isActive', '==', params.isActive);
    }

    // 사용 가능한 좌석만 검색
    if (params.availableOnly) {
      query = query.where('isActive', '==', true)
                   .where('status', '==', 'vacant');
    }

    // 최소 좌석 번호로 검색
    if (params.minSeatNumber !== undefined) {
      query = query.where('seatNumber', '>=', params.minSeatNumber);
    }

    // 최대 좌석 번호로 검색
    if (params.maxSeatNumber !== undefined) {
      query = query.where('seatNumber', '<=', params.maxSeatNumber);
    }

    // 좌석 번호별 정렬
    query = query.orderBy('seatNumber', 'asc');

    return this.search<Seat>(query);
  }

  // 좌석 통계 조회
  async getSeatStatistics(): Promise<{
    totalSeats: number;
    activeSeats: number;
    inactiveSeats: number;
    seatsByStatus: Record<string, number>;
    availableSeats: number;
    occupiedSeats: number;
    unavailableSeats: number;
  }> {
    const seats = await this.getAllSeats();
    
    if (seats.length === 0) {
      return {
        totalSeats: 0,
        activeSeats: 0,
        inactiveSeats: 0,
        seatsByStatus: {},
        availableSeats: 0,
        occupiedSeats: 0,
        unavailableSeats: 0
      };
    }

    const totalSeats = seats.length;
    const activeSeats = seats.filter(s => s.isActive).length;
    const inactiveSeats = totalSeats - activeSeats;

    // 상태별 좌석 수
    const seatsByStatus: Record<string, number> = {};
    seats.forEach(seat => {
      seatsByStatus[seat.status] = (seatsByStatus[seat.status] || 0) + 1;
    });

    const availableSeats = seatsByStatus['vacant'] || 0;
    const occupiedSeats = seatsByStatus['occupied'] || 0;
    const unavailableSeats = seatsByStatus['unavailable'] || 0;

    return {
      totalSeats,
      activeSeats,
      inactiveSeats,
      seatsByStatus,
      availableSeats,
      occupiedSeats,
      unavailableSeats
    };
  }

  // 좌석 상태 변경
  async updateSeatStatus(seatId: string, status: 'vacant' | 'occupied' | 'unavailable'): Promise<void> {
    await this.update(seatId, { 
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // 좌석 활성화/비활성화
  async toggleSeatActive(seatId: string, isActive: boolean): Promise<void> {
    await this.update(seatId, { 
      isActive,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // 좌석 번호 중복 확인
  async isSeatNumberExists(seatNumber: number, excludeId?: string): Promise<boolean> {
    let query = this.db.collection(this.collectionName)
                       .where('seatNumber', '==', seatNumber);
    
    const seats = await this.search<Seat>(query);
    
    if (excludeId) {
      return seats.some(seat => seat.id !== excludeId);
    }
    
    return seats.length > 0;
  }

  // 다음 사용 가능한 좌석 번호 찾기
  async getNextAvailableSeatNumber(): Promise<number> {
    const seats = await this.getSeatsByNumber();
    
    if (seats.length === 0) {
      return 1;
    }

    const maxSeatNumber = Math.max(...seats.map(s => s.seatNumber));
    
    // 1부터 maxSeatNumber까지 중 사용되지 않는 번호 찾기
    for (let i = 1; i <= maxSeatNumber + 1; i++) {
      const exists = await this.isSeatNumberExists(i);
      if (!exists) {
        return i;
      }
    }

    return maxSeatNumber + 1;
  }

  // 좌석 일괄 생성
  async createMultipleSeats(startNumber: number, count: number): Promise<string[]> {
    const seatsToCreate: Omit<Seat, 'id'>[] = [];
    
    for (let i = 0; i < count; i++) {
      const seatNumber = startNumber + i;
      
      // 좌석 번호 중복 확인
      const exists = await this.isSeatNumberExists(seatNumber);
      if (exists) {
        throw new Error(`좌석 번호 ${seatNumber}가 이미 존재합니다.`);
      }

      seatsToCreate.push({
        seatNumber,
        status: 'vacant',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return this.batchCreate(seatsToCreate);
  }

  // 좌석 일괄 비활성화
  async deactivateMultipleSeats(seatNumbers: number[]): Promise<void> {
    const batch = this.db.batch();
    
    for (const seatNumber of seatNumbers) {
      const seats = await this.searchSeats({ seatNumber });
      if (seats.length > 0) {
        const seat = seats[0];
        const docRef = this.db.collection(this.collectionName).doc(seat.id);
        batch.update(docRef, { 
          isActive: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    await batch.commit();
  }
}
