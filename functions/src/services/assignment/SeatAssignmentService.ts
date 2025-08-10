import { BaseService } from '../base/BaseService';
import type { UUID } from '@shared/types';
import type { AttendanceStatus } from '@shared/types/common.types';

// 좌석 배정 상태
export interface SeatAssignment {
  id: string;
  seatId: string;
  studentId: UUID;
  assignedDate: string;
  assignedBy?: string;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 배정 요청 데이터
export interface AssignStudentRequest {
  seatId: string;
  studentId: UUID;
  assignedBy?: string;
  notes?: string;
}

// 배정 해제 요청 데이터
export interface UnassignStudentRequest {
  seatId: string;
  studentId: string;  // studentId 필드 추가 - 정확한 배정 해제를 위해
  unassignedBy?: string;
  notes?: string;
}

export class SeatAssignmentService extends BaseService {
  private readonly collectionName = 'seat_assignments';

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
   * 학생을 좌석에 배정 (트랜잭션으로 Seat과 SeatAssignment 동기화)
   */
  async assignStudentToSeat(request: AssignStudentRequest): Promise<SeatAssignment> {
    try {
      console.log('🔍 학생 좌석 배정 (트랜잭션) 시작:', request);

      return await this.db.runTransaction(async (transaction) => {
        console.log('🔄 트랜잭션 시작');
        
        // ===== 1단계: 모든 읽기 작업을 먼저 실행 =====
        console.log('📋 1단계: 모든 읽기 작업 실행 중...');
        
        // 1-1. 기존 배정 확인 (현재 배정된 상태만 체크)
        const existingAssignmentSnapshot = await transaction.get(
          this.getCollection(this.collectionName)
            .where('seatId', '==', request.seatId)
            .where('status', '==', 'present')
            .limit(1)
        );
        
        // 1-2. Seat 문서 조회 (나중에 사용할 예정)
        const seatRef = this.db.collection('seats').doc(request.seatId);
        const seatDoc = await transaction.get(seatRef);
        
        console.log('✅ 모든 읽기 작업 완료');
        console.log('📊 기존 배정 조회 결과:', { 
          empty: existingAssignmentSnapshot.empty, 
          count: existingAssignmentSnapshot.docs.length 
        });
        
        // ===== 2단계: 데이터 검증 =====
        if (!existingAssignmentSnapshot.empty) {
          console.log('ℹ️ 이미 학생이 배정된 좌석입니다.');
          throw new Error('이미 학생이 배정된 좌석입니다.');
        }

        // ===== 3단계: 모든 쓰기 작업 실행 =====
        console.log('✍️ 3단계: 모든 쓰기 작업 실행 중...');
        
        // 3-1. 새로운 배정 생성 및 저장
        const assignment: SeatAssignment = {
          id: this.generateId(),
          seatId: request.seatId,
          studentId: request.studentId,
          assignedDate: new Date().toISOString().split('T')[0],
          assignedBy: request.assignedBy || 'system',
          status: 'present' as AttendanceStatus,
          notes: request.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const cleanedAssignment = this.removeUndefinedValues(assignment);
        const assignmentRef = this.getCollection(this.collectionName).doc(assignment.id);
        transaction.set(assignmentRef, cleanedAssignment);
        console.log('✅ SeatAssignment 생성 완료');

        // 3-2. Seat 컬렉션도 동기화 (읽기 결과를 활용)
        if (!seatDoc.exists) {
          console.log('⚠️ 좌석이 존재하지 않습니다:', request.seatId);
          console.log('ℹ️ SeatAssignment만 생성하고 좌석 동기화는 건너뜁니다.');
        } else {
          transaction.update(seatRef, {
            status: 'occupied' as AttendanceStatus, // 좌석 상태만 'occupied'로 변경
            lastUpdated: new Date().toISOString()
          });
          console.log('✅ Seat 컬렉션 상태 업데이트 완료 (occupied)');
        }

        console.log('✅ 모든 쓰기 작업 완료');
        console.log('✅ 학생 좌석 배정 완료 (트랜잭션):', assignment.id);
        return assignment;
      });

    } catch (error) {
      console.error('❌ 학생 좌석 배정 오류 (트랜잭션):', error);
      throw error;
    }
  }

  /**
   * 좌석에서 학생 배정 해제 (트랜잭션으로 Seat과 SeatAssignment 동기화)
   */
  async unassignStudentFromSeat(request: UnassignStudentRequest): Promise<boolean> {
    try {
      console.log('🔍 학생 좌석 배정 해제 (트랜잭션) 시작:', request);

      return await this.db.runTransaction(async (transaction) => {
        console.log('🔄 트랜잭션 시작');
        
        // ===== 1단계: 모든 읽기 작업을 먼저 실행 =====
        console.log('📋 1단계: 모든 읽기 작업 실행 중...');
        
        // 1-1. SeatAssignment 조회
        const assignmentSnapshot = await transaction.get(
          this.getCollection(this.collectionName)
            .where('seatId', '==', request.seatId)
            .where('studentId', '==', request.studentId)
            .where('status', '==', 'present')
            .limit(1)
        );
        
        // 1-2. Seat 문서 조회 (나중에 사용할 예정)
        const seatRef = this.db.collection('seats').doc(request.seatId);
        const seatDoc = await transaction.get(seatRef);
        
        console.log('✅ 모든 읽기 작업 완료');
        console.log('📊 배정 조회 결과:', { 
          empty: assignmentSnapshot.empty, 
          count: assignmentSnapshot.docs.length 
        });
        
        // ===== 2단계: 데이터 검증 =====
        if (assignmentSnapshot.empty) {
          console.log('ℹ️ 해당 학생이 해당 좌석에 활성 배정되어 있지 않습니다.');
          throw new Error(`학생 ${request.studentId}이 좌석 ${request.seatId}에 배정되어 있지 않습니다.`);
        }

        const currentAssignment = { id: assignmentSnapshot.docs[0].id, ...assignmentSnapshot.docs[0].data() } as SeatAssignment;
        console.log('📋 현재 배정 정보:', {
          id: currentAssignment.id,
          seatId: currentAssignment.seatId,
          studentId: currentAssignment.studentId,
          status: currentAssignment.status,
          assignedDate: currentAssignment.assignedDate
        });

        // ===== 3단계: 모든 쓰기 작업 실행 =====
        console.log('✍️ 3단계: 모든 쓰기 작업 실행 중...');
        
        // 3-1. SeatAssignment 상태를 'dismissed'로 변경
        console.log('🔄 SeatAssignment 상태 업데이트 중...');
        const assignmentRef = this.getCollection(this.collectionName).doc(currentAssignment.id);
        transaction.update(assignmentRef, {
          status: 'dismissed' as AttendanceStatus,
          notes: request.notes || '배정 해제',
          updatedAt: new Date().toISOString()
        });

        // 3-2. Seat 컬렉션도 동기화 (읽기 결과를 활용)
        console.log('🔄 Seat 컬렉션 상태 업데이트 중...');
        if (!seatDoc.exists) {
          console.log('⚠️ 좌석이 존재하지 않습니다:', request.seatId);
          console.log('ℹ️ SeatAssignment만 업데이트하고 좌석 동기화는 건너뜁니다.');
        } else {
          transaction.update(seatRef, {
            status: 'available' as AttendanceStatus, // 좌석을 사용 가능한 상태로 변경
            lastUpdated: new Date().toISOString()
          });
          console.log('✅ Seat 컬렉션 상태 업데이트 완료 (available)');
        }

        console.log('✅ 모든 쓰기 작업 완료');
        console.log('✅ 학생 좌석 배정 해제 완료 (트랜잭션):', currentAssignment.id);
        return true;
      });

    } catch (error) {
      console.error('❌ 학생 좌석 배정 해제 오류 (트랜잭션):', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        request: {
          seatId: request.seatId,
          studentId: request.studentId,
          unassignedBy: request.unassignedBy,
          notes: request.notes
        }
      });
      
      // 구체적인 에러 메시지로 재포장
      if (error instanceof Error) {
        throw new Error(`좌석 배정 해제 실패: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 학생들을 좌석에 일괄 배정
   */
  async bulkAssignStudents(studentIds: UUID[]): Promise<SeatAssignment[]> {
    try {
      console.log('학생 일괄 좌석 배정 시작:', studentIds.length, '명');

      // 좌석 정보 가져오기
      const seatSnapshot = await this.db.collection('seats')
        .orderBy('seatNumber', 'asc')
        .get();

      const seats = seatSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as any[]; // 타입 단언으로 seatId 접근 허용

      const assignments: SeatAssignment[] = [];
      const batch = this.db.batch();

      for (let i = 0; i < Math.min(seats.length, studentIds.length); i++) {
        const seat = seats[i];
        const studentId = studentIds[i];

        if (seat && studentId) {
          const assignment: SeatAssignment = {
            id: this.generateId(),
            seatId: seat.seatId, // seat.seatId 사용 (문서 ID와 일치)
            studentId: studentId,
            assignedDate: new Date().toISOString().split('T')[0],
            assignedBy: 'system',
            status: 'present' as AttendanceStatus,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const cleanedAssignment = this.removeUndefinedValues(assignment);
          const docRef = this.getCollection(this.collectionName).doc(assignment.id);
          batch.set(docRef, cleanedAssignment);
          assignments.push(assignment);
        }
      }

      await batch.commit();
      console.log('학생 일괄 좌석 배정 완료:', assignments.length, '개');
      return assignments;
    } catch (error) {
      console.error('학생 일괄 좌석 배정 오류:', error);
      throw error;
    }
  }

  /**
   * 좌석 ID로 배정 정보 조회
   */
  async getAssignmentBySeatId(seatId: string): Promise<SeatAssignment | null> {
    try {
      const snapshot = await this.getCollection(this.collectionName)
        .where('seatId', '==', seatId)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as SeatAssignment;
    } catch (error) {
      console.error('좌석 배정 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 현재 배정(활성)된 좌석 배정 조회: status === 'present'
   */
  async getActiveAssignmentBySeatId(seatId: string): Promise<SeatAssignment | null> {
    try {
      const snapshot = await this.getCollection(this.collectionName)
        .where('seatId', '==', seatId)
        .where('status', '==', 'present')
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as SeatAssignment;
    } catch (error) {
      console.error('활성 좌석 배정 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 학생 ID로 배정 정보 조회
   */
  async getAssignmentByStudentId(studentId: UUID): Promise<SeatAssignment | null> {
    try {
      const snapshot = await this.getCollection(this.collectionName)
        .where('studentId', '==', studentId)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as SeatAssignment;
    } catch (error) {
      console.error('학생 배정 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 모든 배정 정보 조회
   */
  async getAllAssignments(): Promise<SeatAssignment[]> {
    try {
      const snapshot = await this.getCollection(this.collectionName).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SeatAssignment));
    } catch (error) {
      console.error('모든 배정 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 배정 통계 조회
   */
  async getAssignmentStats(): Promise<{
    total: number;
    assigned: number;
    unassigned: number;
    statusCounts: Record<string, number>;
  }> {
    try {
      const assignments = await this.getAllAssignments();
      
      const total = assignments.length;
      const assigned = assignments.filter(a => a.status === 'present').length;
      const unassigned = total - assigned;
      
      const statusCounts = assignments.reduce((acc, assignment) => {
        acc[assignment.status] = (acc[assignment.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        total,
        assigned,
        unassigned,
        statusCounts
      };
    } catch (error) {
      console.error('배정 통계 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 배정 데이터 초기화
   */
  async initializeAssignments(studentIds: UUID[]): Promise<void> {
    try {
      console.log('배정 데이터 초기화 시작');

      // 기존 배정 데이터 삭제
      const snapshot = await this.getCollection(this.collectionName).get();
      const batch = this.db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();

      // 새로운 배정 데이터 생성
      await this.bulkAssignStudents(studentIds);
      
      console.log('배정 데이터 초기화 완료');
    } catch (error) {
      console.error('배정 데이터 초기화 오류:', error);
      throw error;
    }
  }

  /**
   * ID 생성
   */

}
