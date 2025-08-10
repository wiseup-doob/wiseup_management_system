import { BaseService } from '../base/BaseService';
import { Seat } from '@shared/types';
import { generateSeatData } from '@shared/utils/seat';
import { AttendanceStatus } from '@shared/types/common.types';

export class SeatService extends BaseService {
  private readonly collectionName = 'seats';

  // undefined 값을 제거하는 함수
  private removeUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.removeUndefinedValues(value);
        }
      }
      return cleaned;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedValues(item));
    }
    
    return obj;
  }

  /**
   * 모든 좌석 조회
   */
  async getAllSeats(): Promise<Seat[]> {
    try {
      const snapshot = await this.getCollection(this.collectionName).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seat));
    } catch (error) {
      console.error('좌석 조회 오류:', error);
      throw new Error('좌석 조회에 실패했습니다.');
    }
  }

  /**
   * 특정 좌석 조회
   */
  async getSeatById(seatId: string): Promise<Seat | null> {
    try {
      const snapshot = await this.getCollection(this.collectionName)
        .where('seatId', '==', seatId)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Seat;
    } catch (error) {
      console.error('좌석 조회 오류:', error);
      throw new Error('좌석 조회에 실패했습니다.');
    }
  }

  /**
   * 좌석 번호로 좌석 조회
   */
  async getSeatByNumber(seatNumber: number): Promise<Seat | null> {
    try {
      const snapshot = await this.getCollection(this.collectionName)
        .where('seatNumber', '==', seatNumber)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Seat;
    } catch (error) {
      console.error('좌석 조회 오류:', error);
      throw new Error('좌석 조회에 실패했습니다.');
    }
  }

  /**
   * 좌석 배치(번호/행/열) 교환 - seatId 기준으로 문서를 찾아 서로의 seatNumber/row/col을 스왑
   */
  async swapSeatPositions(seatAId: string, seatBId: string): Promise<{ a: Seat; b: Seat }> {
    try {
      const [snapA, snapB] = await Promise.all([
        this.getCollection(this.collectionName).where('seatId', '==', seatAId).limit(1).get(),
        this.getCollection(this.collectionName).where('seatId', '==', seatBId).limit(1).get()
      ])

      if (snapA.empty || snapB.empty) {
        throw new Error('하나 이상의 좌석을 찾을 수 없습니다.')
      }

      const docA = snapA.docs[0]
      const docB = snapB.docs[0]
      const seatA = { id: docA.id, ...docA.data() } as Seat
      const seatB = { id: docB.id, ...docB.data() } as Seat

      await this.db.runTransaction(async (tx) => {
        tx.update(docA.ref, {
          seatNumber: seatB.seatNumber,
          row: seatB.row,
          col: seatB.col,
          updatedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        })
        tx.update(docB.ref, {
          seatNumber: seatA.seatNumber,
          row: seatA.row,
          col: seatA.col,
          updatedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        })
      })

      const updatedA = { ...seatA, seatNumber: seatB.seatNumber, row: seatB.row, col: seatB.col }
      const updatedB = { ...seatB, seatNumber: seatA.seatNumber, row: seatA.row, col: seatA.col }

      return { a: updatedA, b: updatedB }
    } catch (error) {
      console.error('좌석 스왑 오류:', error)
      throw new Error('좌석 스왑에 실패했습니다.')
    }
  }

  /**
   * 좌석 상태 업데이트
   */
  async updateSeatStatus(seatId: string, status: AttendanceStatus): Promise<void> {
    try {
      const seat = await this.getSeatById(seatId);
      if (!seat) {
        throw new Error('좌석을 찾을 수 없습니다.');
      }
      
      // ❌ studentId 관련 로직 제거 - seat_assignments에서 관리
      // 좌석 상태만 업데이트
      
      await this.updateSeat(seatId, { status });
      console.log(`✅ 좌석 ${seatId} 상태 업데이트 완료: ${status}`);
    } catch (error) {
      console.error('좌석 상태 업데이트 오류:', error);
      throw new Error('좌석 상태 업데이트에 실패했습니다.');
    }
  }

  /**
   * 좌석 정보 업데이트 (트랜잭션으로 SeatAssignment와 동기화)
   */
  async updateSeat(seatId: string, updateData: Partial<Seat>): Promise<{ success: boolean; data: Seat }> {
    try {
      return await this.db.runTransaction(async (transaction) => {
        // 1. 좌석 문서 조회
        const seatSnapshot = await transaction.get(
          this.getCollection(this.collectionName).where('seatId', '==', seatId).limit(1)
        );
        
        if (seatSnapshot.empty) {
          throw new Error('좌석을 찾을 수 없습니다.');
        }
        
        const seatDoc = seatSnapshot.docs[0];
        const seat = seatDoc.data() as Seat;
        
        // 좌석 상태 변경 감지
        if (updateData.status !== undefined && updateData.status !== seat.status) {
          console.log(`좌석 ${seat.seatId} 상태 변경: ${seat.status} -> ${updateData.status}`)
        }
        
        // ❌ studentId 관련 로직 제거 - seat_assignments에서 관리
        // 좌석 정보 업데이트만 수행
        
        const updateFields: Partial<Seat> = {
          ...updateData,
          lastUpdated: new Date().toISOString()
        };
        
        transaction.update(seatDoc.ref, updateFields);
        
        console.log(`✅ 좌석 ${seat.seatId} 업데이트 완료`);
        
        return { success: true, data: { ...seat, ...updateFields } as Seat };
      });
    } catch (error) {
      console.error('좌석 업데이트 오류 (트랜잭션):', error);
      throw new Error('좌석 업데이트에 실패했습니다.');
    }
  }

  /**
   * 좌석 데이터 초기화
   */
  async initializeSeats(): Promise<void> {
    try {
      console.log('🔄 좌석 데이터 초기화 시작...');
      
      // 1. 기존 좌석 데이터 삭제
      console.log('🗑️ 기존 좌석 데이터 삭제 중...');
      const seatSnapshot = await this.db.collection(this.collectionName).get();
      const seatBatch = this.db.batch();
      
      seatSnapshot.docs.forEach(doc => {
        seatBatch.delete(doc.ref);
      });
      
      // 2. 기존 좌석 배정 데이터도 정리
      console.log('🗑️ 기존 좌석 배정 데이터 정리 중...');
      const assignmentSnapshot = await this.db.collection('seat_assignments').get();
      const assignmentBatch = this.db.batch();
      
      assignmentSnapshot.docs.forEach(doc => {
        assignmentBatch.delete(doc.ref);
      });
      
      // 3. 배치 커밋 (좌석과 배정 데이터 동시 삭제)
      console.log('💾 데이터 삭제 커밋 중...');
      await Promise.all([
        seatBatch.commit(),
        assignmentBatch.commit()
      ]);
      
      console.log('✅ 기존 데이터 정리 완료');
      
      // 4. 새로운 좌석 데이터 생성
      console.log('🆕 새로운 좌석 데이터 생성 중...');
      const seats = generateSeatData();
      const newBatch = this.db.batch();
      
      seats.forEach(seat => {
        // seat.seatId를 문서 ID로 사용하여 ID 일치시킴
        const docRef = this.db.collection(this.collectionName).doc(seat.seatId);
        // undefined 값을 제거한 후 저장
        const cleanedSeat = this.removeUndefinedValues(seat);
        newBatch.set(docRef, cleanedSeat);
      });
      
      await newBatch.commit();
      
      console.log(`✅ ${seats.length}개의 좌석이 초기화되었습니다.`);
    } catch (error) {
      console.error('❌ 좌석 초기화 오류:', error);
      throw new Error('좌석 초기화에 실패했습니다.');
    }
  }

  /**
   * 좌석 통계 조회
   */
  async getSeatStats(): Promise<{
    total: number;
    available: number;
    occupied: number;
    statusCounts: Record<string, number>;
  }> {
    try {
      const seats = await this.getAllSeats();
      
      const total = seats.length;
      const available = seats.filter(seat => seat.status === 'dismissed').length;
      const occupied = total - available;
      
      const statusCounts = seats.reduce((acc, seat) => {
        acc[seat.status] = (acc[seat.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        total,
        available,
        occupied,
        statusCounts
      };
    } catch (error) {
      console.error('좌석 통계 조회 오류:', error);
      throw new Error('좌석 통계 조회에 실패했습니다.');
    }
  }

  /**
   * 좌석 데이터 헬스체크 (간단한 일관성 검증)
   */
  async checkSeatHealth(): Promise<{
    status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
    totalSeats: number;
    assignedSeats: number;
    mismatchedSeats: number;
    issues: Array<{
      seatId: string;
      type: 'MISMATCH' | 'ORPHANED' | 'DUPLICATE';
      description: string;
    }>;
    lastChecked: string;
  }> {
    try {
      console.log('좌석 데이터 헬스체크 시작...');
      
      // 1. 모든 좌석과 배정 데이터 조회
      const [seats, assignments] = await Promise.all([
        this.getAllSeats(),
        this.db.collection('seat_assignments').get()
      ]);
      
      const activeAssignments = assignments.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(assignment => assignment.status === 'present');
      
      const issues: Array<{
        seatId: string;
        type: 'MISMATCH' | 'ORPHANED' | 'DUPLICATE';
        description: string;
      }> = [];
      
      let assignedSeats = 0;
      let mismatchedSeats = 0;
      
      // 2. 각 좌석 검증
      // 좌석별 상태 확인
      for (const seat of seats) {
        // 해당 좌석의 활성 배정 찾기
        const activeAssignment = activeAssignments.find(a => a.seatId === seat.seatId && a.status === 'present');
        
        if (!activeAssignment) {
          // 좌석에 활성 배정이 없는 경우 (정상)
          continue;
        }
        
        // ❌ studentId 비교 로직 제거 - seat_assignments만으로 관리
        // 좌석 상태와 배정 상태의 일관성만 확인
        
        if (seat.status !== 'present' && activeAssignment.status === 'present') {
          issues.push({
            seatId: seat.seatId,
            type: 'MISMATCH',
            description: `좌석 ${seat.seatNumber}: 좌석 상태(${seat.status})와 배정 상태(${activeAssignment.status})가 일치하지 않습니다.`
          });
          mismatchedSeats++;
        }
      }
      
      // 3. 고아 배정 확인 (좌석이 없는데 배정이 있는 경우)
      for (const assignment of activeAssignments) {
        const seatExists = seats.some(seat => seat.seatId === assignment.seatId);
        if (!seatExists) {
          issues.push({
            seatId: assignment.seatId,
            type: 'ORPHANED',
            description: `존재하지 않는 좌석 ${assignment.seatId}에 대한 배정 기록이 있습니다.`
          });
          mismatchedSeats++;
        }
      }
      
      // 4. 상태 결정
      let status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
      if (mismatchedSeats === 0) {
        status = 'HEALTHY';
      } else if (mismatchedSeats <= Math.ceil(seats.length * 0.1)) { // 10% 이하
        status = 'DEGRADED';
      } else {
        status = 'UNHEALTHY';
      }
      
      const result = {
        status,
        totalSeats: seats.length,
        assignedSeats,
        mismatchedSeats,
        issues,
        lastChecked: new Date().toISOString()
      };
      
      console.log('좌석 데이터 헬스체크 완료:', result);
      return result;
      
    } catch (error) {
      console.error('좌석 데이터 헬스체크 오류:', error);
      throw new Error('좌석 데이터 헬스체크에 실패했습니다.');
    }
  }

  /**
   * 좌석 데이터 자동 복구 (간단한 문제들만)
   */
  async autoRepairSeats(): Promise<{
    repaired: number;
    failed: number;
    details: Array<{ seatId: string; action: string; success: boolean; error?: string }>;
  }> {
    try {
      console.log('좌석 데이터 자동 복구 시작...');
      
      const health = await this.checkSeatHealth();
      if (health.status === 'HEALTHY') {
        console.log('복구가 필요하지 않습니다.');
        return { repaired: 0, failed: 0, details: [] };
      }
      
      const details: Array<{ seatId: string; action: string; success: boolean; error?: string }> = [];
      let repaired = 0;
      let failed = 0;
      
      // 1. 고아 배정 제거 (존재하지 않는 좌석에 대한 배정)
      for (const issue of health.issues.filter(i => i.type === 'ORPHANED')) {
        try {
          // 좌석이 존재하지 않는 경우 배정만 제거
          if (issue.description.includes('존재하지 않는 좌석')) {
            const assignments = await this.db.collection('seat_assignments')
              .where('seatId', '==', issue.seatId)
              .get();
            
            for (const assignment of assignments.docs) {
              await assignment.ref.update({ status: 'dismissed' });
            }
            
            details.push({
              seatId: issue.seatId,
              action: '고아 배정 제거',
              success: true
            });
            repaired++;
          }
        } catch (error) {
          details.push({
            seatId: issue.seatId,
            action: '고아 배정 제거',
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류'
          });
          failed++;
        }
      }
      
      // 2. 불일치 좌석 동기화 (좌석 상태를 배정 상태와 맞춤)
      for (const issue of health.issues.filter(i => i.type === 'MISMATCH')) {
        try {
          if (issue.description.includes('일치하지 않습니다')) {
            const seat = await this.getSeatById(issue.seatId);
            if (seat) {
              // ❌ studentId 업데이트 제거 - seat_assignments만으로 관리
              // 좌석 상태만 'occupied'로 변경
              await this.updateSeat(issue.seatId, { status: 'present' });
              
              details.push({
                seatId: issue.seatId,
                action: '좌석 상태 동기화',
                success: true
              });
              repaired++;
            }
          }
        } catch (error) {
          details.push({
            seatId: issue.seatId,
            action: '좌석 상태 동기화',
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류'
          });
          failed++;
        }
      }
      
      console.log(`자동 복구 완료: ${repaired}개 성공, ${failed}개 실패`);
      return { repaired, failed, details };
      
    } catch (error) {
      console.error('좌석 데이터 자동 복구 오류:', error);
      throw new Error('좌석 데이터 자동 복구에 실패했습니다.');
    }
  }
}
