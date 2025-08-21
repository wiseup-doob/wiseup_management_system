import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
import type { 
  SeatAssignment, 
  CreateSeatAssignmentRequest, 
  UpdateSeatAssignmentRequest, 
  SeatAssignmentSearchParams 
} from '@shared/types';

export class SeatAssignmentService extends BaseService {
  constructor() {
    super('seat_assignments');
  }

  // 좌석 배정 생성
  async createSeatAssignment(data: CreateSeatAssignmentRequest): Promise<string> {
    const assignmentData: Omit<SeatAssignment, 'id'> = {
      ...data,
      status: data.status || 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return this.create(assignmentData);
  }

  // 좌석 배정 조회 (ID로)
  async getSeatAssignmentById(id: string): Promise<SeatAssignment | null> {
    return this.getById<SeatAssignment>(id);
  }

  // 좌석 배정 수정
  async updateSeatAssignment(id: string, data: UpdateSeatAssignmentRequest): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await this.update(id, updateData);
  }

  // 좌석 배정 삭제
  async deleteSeatAssignment(id: string): Promise<void> {
    await this.delete(id);
  }

  // 모든 좌석 배정 조회
  async getAllSeatAssignments(): Promise<SeatAssignment[]> {
    return this.getAll<SeatAssignment>();
  }

  // 활성 좌석 배정만 조회
  async getActiveSeatAssignments(): Promise<SeatAssignment[]> {
    const query = this.db.collection(this.collectionName)
                         .where('status', '==', 'active');
    
    return this.search<SeatAssignment>(query);
  }

  // 특정 좌석의 배정 조회
  async getSeatAssignmentsBySeatId(seatId: string): Promise<SeatAssignment[]> {
    const query = this.db.collection(this.collectionName)
                         .where('seatId', '==', seatId);
    
    return this.search<SeatAssignment>(query);
  }

  // 특정 학생의 좌석 배정 조회
  async getSeatAssignmentsByStudentId(studentId: string): Promise<SeatAssignment[]> {
    const query = this.db.collection(this.collectionName)
                         .where('studentId', '==', studentId);
    
    return this.search<SeatAssignment>(query);
  }

  // 특정 날짜의 좌석 배정 조회
  async getSeatAssignmentsByDate(date: admin.firestore.Timestamp): Promise<SeatAssignment[]> {
    const startOfDay = new Date(date.toDate());
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date.toDate());
    endOfDay.setHours(23, 59, 59, 999);
    
    const startTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);
    const endTimestamp = admin.firestore.Timestamp.fromDate(endOfDay);
    
    const query = this.db.collection(this.collectionName)
                         .where('assignedDate', '>=', startTimestamp)
                         .where('assignedDate', '<=', endTimestamp);
    
    return this.search<SeatAssignment>(query);
  }

  // 좌석 배정 검색
  async searchSeatAssignments(params: SeatAssignmentSearchParams): Promise<SeatAssignment[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName);

    // 좌석 ID로 검색
    if (params.seatId) {
      query = query.where('seatId', '==', params.seatId);
    }

    // 학생 ID로 검색
    if (params.studentId) {
      query = query.where('studentId', '==', params.studentId);
    }

    // 상태별 검색
    if (params.status) {
      query = query.where('status', '==', params.status);
    }

    // 배정 날짜 범위로 검색
    if (params.assignedDateRange) {
      if (params.assignedDateRange.start) {
        query = query.where('assignedDate', '>=', params.assignedDateRange.start);
      }
      if (params.assignedDateRange.end) {
        query = query.where('assignedDate', '<=', params.assignedDateRange.end);
      }
    }

    // 배정 날짜순 정렬
    query = query.orderBy('assignedDate', 'desc');

    return this.search<SeatAssignment>(query);
  }

  // 좌석 배정 통계 조회
  async getSeatAssignmentStatistics(): Promise<{
    totalAssignments: number;
    activeAssignments: number;
    assignmentsByStatus: Record<string, number>;
    assignmentsBySeat: Record<string, number>;
    assignmentsByStudent: Record<string, number>;
  }> {
    const assignments = await this.getAllSeatAssignments();
    
    if (assignments.length === 0) {
      return {
        totalAssignments: 0,
        activeAssignments: 0,
        assignmentsByStatus: {},
        assignmentsBySeat: {},
        assignmentsByStudent: {}
      };
    }

    const totalAssignments = assignments.length;
    const activeAssignments = assignments.filter(a => a.status === 'active').length;

    // 상태별 배정 수
    const assignmentsByStatus: Record<string, number> = {};
    assignments.forEach(assignment => {
      assignmentsByStatus[assignment.status] = (assignmentsByStatus[assignment.status] || 0) + 1;
    });

    // 좌석별 배정 수
    const assignmentsBySeat: Record<string, number> = {};
    assignments.forEach(assignment => {
      assignmentsBySeat[assignment.seatId] = (assignmentsBySeat[assignment.seatId] || 0) + 1;
    });

    // 학생별 배정 수
    const assignmentsByStudent: Record<string, number> = {};
    assignments.forEach(assignment => {
      assignmentsByStudent[assignment.studentId] = (assignmentsByStudent[assignment.studentId] || 0) + 1;
    });

    return {
      totalAssignments,
      activeAssignments,
      assignmentsByStatus,
      assignmentsBySeat,
      assignmentsByStudent
    };
  }

  // 좌석 배정 상태 변경
  async updateSeatAssignmentStatus(id: string, status: 'active' | 'released'): Promise<void> {
    await this.update(id, { 
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // 좌석 배정 해제 (released로 상태 변경)
  async releaseSeatAssignment(id: string): Promise<void> {
    await this.updateSeatAssignmentStatus(id, 'released');
  }

  // 트랜잭션을 사용한 좌석 배정 해제 (데이터 무결성 보장)
  async releaseSeatAssignmentWithTransaction(id: string): Promise<void> {
    return this.runTransaction(async (transaction) => {
      // 1. 기존 배정 확인
      const assignmentRef = this.db.collection(this.collectionName).doc(id);
      const assignmentDoc = await transaction.get(assignmentRef);
      
      if (!assignmentDoc.exists) {
        throw new Error('좌석 배정을 찾을 수 없습니다.');
      }
      
      const assignmentData = assignmentDoc.data()!;
      if (assignmentData.status !== 'active') {
        throw new Error('이미 해제된 좌석 배정입니다.');
      }

      // 2. 좌석 배정 상태 변경
      transaction.update(assignmentRef, {
        status: 'released',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 3. 좌석 상태 업데이트
      const seatRef = this.db.collection('seats').doc(assignmentData.seatId);
      transaction.update(seatRef, {
        status: 'vacant',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 4. 학생 요약 정보 업데이트
      const studentSummaryRef = this.db.collection('student_summaries').doc(assignmentData.studentId);
      const studentSummaryDoc = await transaction.get(studentSummaryRef);
      
      if (studentSummaryDoc.exists) {
        transaction.update(studentSummaryRef, {
          hasSeatAssignment: false,
          currentSeatId: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });
  }

  // 학생의 현재 활성 좌석 배정 조회
  async getCurrentSeatAssignment(studentId: string): Promise<SeatAssignment | null> {
    const query = this.db.collection(this.collectionName)
                         .where('studentId', '==', studentId)
                         .where('status', '==', 'active')
                         .orderBy('assignedDate', 'desc')
                         .limit(1);
    
    const assignments = await this.search<SeatAssignment>(query);
    return assignments.length > 0 ? assignments[0] : null;
  }

  // 좌석의 현재 활성 배정 조회
  async getCurrentSeatAssignmentBySeat(seatId: string): Promise<SeatAssignment | null> {
    const query = this.db.collection(this.collectionName)
                         .where('seatId', '==', seatId)
                         .where('status', '==', 'active')
                         .orderBy('assignedDate', 'desc')
                         .limit(1);
    
    const assignments = await this.search<SeatAssignment>(query);
    return assignments.length > 0 ? assignments[0] : null;
  }

  // 좌석 배정 중복 확인 (같은 좌석에 활성 배정이 있는지)
  async isSeatAlreadyAssigned(seatId: string, excludeId?: string): Promise<boolean> {
    let query = this.db.collection(this.collectionName)
                       .where('seatId', '==', seatId)
                       .where('status', '==', 'active');
    
    const assignments = await this.search<SeatAssignment>(query);
    
    if (excludeId) {
      return assignments.some(assignment => assignment.id !== excludeId);
    }
    
    return assignments.length > 0;
  }

  // 학생의 좌석 배정 중복 확인 (같은 학생에게 활성 배정이 있는지)
  async isStudentAlreadyAssigned(studentId: string, excludeId?: string): Promise<boolean> {
    let query = this.db.collection(this.collectionName)
                       .where('studentId', '==', studentId)
                       .where('status', '==', 'active');
    
    const assignments = await this.search<SeatAssignment>(query);
    
    if (excludeId) {
      return assignments.some(assignment => assignment.id !== excludeId);
    }
    
    return assignments.length > 0;
  }

  // 좌석 배정 생성 (중복 검증 포함)
  async createSeatAssignmentWithValidation(data: CreateSeatAssignmentRequest): Promise<string> {
    // 좌석이 이미 배정되어 있는지 확인
    const seatAlreadyAssigned = await this.isSeatAlreadyAssigned(data.seatId);
    if (seatAlreadyAssigned) {
      throw new Error(`좌석 ${data.seatId}는 이미 배정되어 있습니다.`);
    }

    // 학생이 이미 다른 좌석에 배정되어 있는지 확인
    const studentAlreadyAssigned = await this.isStudentAlreadyAssigned(data.studentId);
    if (studentAlreadyAssigned) {
      throw new Error(`학생 ${data.studentId}는 이미 다른 좌석에 배정되어 있습니다.`);
    }

    return this.createSeatAssignment(data);
  }

  // 트랜잭션을 사용한 좌석 배정 생성 (데이터 무결성 보장)
  async createSeatAssignmentWithTransaction(data: CreateSeatAssignmentRequest): Promise<string> {
    return this.runTransaction(async (transaction) => {
      // 1. 좌석 상태 확인
      const seatRef = this.db.collection('seats').doc(data.seatId);
      const seatDoc = await transaction.get(seatRef);
      
      if (!seatDoc.exists) {
        throw new Error('좌석을 찾을 수 없습니다.');
      }
      
      const seatData = seatDoc.data()!;
      if (!seatData.isActive || seatData.status !== 'vacant') {
        throw new Error('해당 좌석은 사용할 수 없습니다.');
      }

      // 2. 학생 정보 확인
      const studentRef = this.db.collection('students').doc(data.studentId);
      const studentDoc = await transaction.get(studentRef);
      
      if (!studentDoc.exists) {
        throw new Error('학생을 찾을 수 없습니다.');
      }

      // 3. 기존 활성 배정 확인 (트랜잭션 내에서)
      const existingAssignmentQuery = this.db.collection(this.collectionName)
        .where('seatId', '==', data.seatId)
        .where('status', '==', 'active');
      
      const existingAssignments = await transaction.get(existingAssignmentQuery);
      if (!existingAssignments.empty) {
        throw new Error('해당 좌석은 이미 배정되어 있습니다.');
      }

      // 4. 학생의 기존 활성 배정 확인 (트랜잭션 내에서)
      const studentAssignmentQuery = this.db.collection(this.collectionName)
        .where('studentId', '==', data.studentId)
        .where('status', '==', 'active');
      
      const studentAssignments = await transaction.get(studentAssignmentQuery);
      if (!studentAssignments.empty) {
        throw new Error('해당 학생은 이미 다른 좌석에 배정되어 있습니다.');
      }

      // 5. 좌석 배정 생성
      const assignmentRef = this.db.collection(this.collectionName).doc();
      const assignmentData: Omit<SeatAssignment, 'id'> = {
        ...data,
        status: data.status || 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      transaction.set(assignmentRef, assignmentData);

      // 6. 좌석 상태 업데이트
      transaction.update(seatRef, {
        status: 'occupied',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 7. 학생 요약 정보 업데이트 (선택사항)
      const studentSummaryRef = this.db.collection('student_summaries').doc(data.studentId);
      const studentSummaryDoc = await transaction.get(studentSummaryRef);
      
      if (studentSummaryDoc.exists) {
        transaction.update(studentSummaryRef, {
          hasSeatAssignment: true,
          currentSeatId: data.seatId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return assignmentRef.id;
    });
  }

  // 좌석 배정 수정 (중복 검증 포함)
  async updateSeatAssignmentWithValidation(id: string, data: UpdateSeatAssignmentRequest): Promise<void> {
    const existingAssignment = await this.getSeatAssignmentById(id);
    if (!existingAssignment) {
      throw new Error('해당 좌석 배정을 찾을 수 없습니다.');
    }

    // 좌석 변경 시 중복 확인
    if (data.seatId && data.seatId !== existingAssignment.seatId) {
      const seatAlreadyAssigned = await this.isSeatAlreadyAssigned(data.seatId, id);
      if (seatAlreadyAssigned) {
        throw new Error(`좌석 ${data.seatId}는 이미 배정되어 있습니다.`);
      }
    }

    // 학생 변경 시 중복 확인
    if (data.studentId && data.studentId !== existingAssignment.studentId) {
      const studentAlreadyAssigned = await this.isStudentAlreadyAssigned(data.studentId, id);
      if (studentAlreadyAssigned) {
        throw new Error(`학생 ${data.studentId}는 이미 다른 좌석에 배정되어 있습니다.`);
      }
    }

    await this.updateSeatAssignment(id, data);
  }

  // 학생의 모든 좌석 배정 기록 조회
  async getStudentSeatAssignmentHistory(studentId: string): Promise<SeatAssignment[]> {
    const query = this.db.collection(this.collectionName)
                         .where('studentId', '==', studentId)
                         .orderBy('assignedDate', 'desc');
    
    return this.search<SeatAssignment>(query);
  }

  // 좌석의 모든 배정 기록 조회
  async getSeatAssignmentHistory(seatId: string): Promise<SeatAssignment[]> {
    const query = this.db.collection(this.collectionName)
                         .where('seatId', '==', seatId)
                         .orderBy('assignedDate', 'desc');
    
    return this.search<SeatAssignment>(query);
  }
}
