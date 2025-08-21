import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
import type { 
  AttendanceRecord, 
  CreateAttendanceRecordRequest, 
  UpdateAttendanceRecordRequest, 
  AttendanceSearchParams 
} from '@shared/types';

export class AttendanceService extends BaseService {
  constructor() {
    super('attendance_records');
  }

  // 출석 기록 생성
  async createAttendanceRecord(data: CreateAttendanceRecordRequest): Promise<string> {
    const attendanceData: Omit<AttendanceRecord, 'id'> = {
      ...data,
      isLate: data.isLate ?? false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return this.create(attendanceData);
  }

  // 트랜잭션을 사용한 출석 기록 생성 (학생 요약 정보 자동 업데이트)
  async createAttendanceRecordWithTransaction(data: CreateAttendanceRecordRequest): Promise<string> {
    return this.runTransaction(async (transaction) => {
      // 1. 출석 기록 생성
      const attendanceRef = this.db.collection('attendance_records').doc();
      const recordData: Omit<AttendanceRecord, 'id'> = {
        ...data,
        isLate: data.isLate ?? false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      transaction.set(attendanceRef, recordData);

      // 2. 학생 요약 정보 업데이트
      const summaryRef = this.db.collection('student_summaries').doc(data.studentId);
      const summaryDoc = await transaction.get(summaryRef);
      
      if (summaryDoc.exists) {
        const summaryData = summaryDoc.data()!;
        const newStats = this.calculateNewStats(summaryData, data);
        
        transaction.update(summaryRef, {
          ...newStats,
          lastAttendanceUpdate: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // 새로운 학생 요약 정보 생성
        const newSummary = this.createInitialSummary(data);
        transaction.set(summaryRef, newSummary);
      }

      return attendanceRef.id;
    });
  }

  // 통계 계산 헬퍼 메서드
  private calculateNewStats(
    currentSummary: any, 
    newAttendance: CreateAttendanceRecordRequest
  ): any {
    const stats = { ...currentSummary };
    
    // 출석 상태별 카운트 업데이트
    switch (newAttendance.status) {
      case 'present':
        stats.totalAttendanceDays = (stats.totalAttendanceDays || 0) + 1;
        break;
      case 'unauthorized_absent':
        stats.absentCount = (stats.absentCount || 0) + 1;
        break;
      case 'dismissed':
        stats.dismissedCount = (stats.dismissedCount || 0) + 1;
        break;
    }
    
    // 출석률 재계산
    const totalDays = (stats.totalAttendanceDays || 0) + (stats.absentCount || 0) + (stats.dismissedCount || 0);
    stats.attendanceRate = totalDays > 0 ? (stats.totalAttendanceDays || 0) / totalDays : 0;
    
    return stats;
  }

  // 초기 학생 요약 정보 생성
  private createInitialSummary(data: CreateAttendanceRecordRequest): any {
    const stats: any = {
      studentId: data.studentId,
      totalAttendanceDays: 0,
      absentCount: 0,
      dismissedCount: 0,
      attendanceRate: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // 출석 상태별 초기값 설정
    switch (data.status) {
      case 'present':
        stats.totalAttendanceDays = 1;
        stats.attendanceRate = 1;
        break;
      case 'unauthorized_absent':
        stats.absentCount = 1;
        stats.attendanceRate = 0;
        break;
      case 'dismissed':
        stats.dismissedCount = 1;
        stats.attendanceRate = 0;
        break;
    }
    
    return stats;
  }

  // 출석 기록 조회 (ID로)
  async getAttendanceRecordById(id: string): Promise<AttendanceRecord | null> {
    return this.getById<AttendanceRecord>(id);
  }

  // 출석 기록 수정
  async updateAttendanceRecord(id: string, data: UpdateAttendanceRecordRequest): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await this.update(id, updateData);
  }

  // 출석 기록 삭제
  async deleteAttendanceRecord(id: string): Promise<void> {
    await this.delete(id);
  }

  // 모든 출석 기록 조회
  async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    return this.getAll<AttendanceRecord>();
  }

  // 학생별 출석 기록 조회
  async getAttendanceRecordsByStudentId(studentId: string): Promise<AttendanceRecord[]> {
    const query = this.db.collection(this.collectionName)
                         .where('studentId', '==', studentId)
                         .orderBy('date', 'desc');

    return this.search<AttendanceRecord>(query);
  }

  // 특정 날짜의 출석 기록 조회
  async getAttendanceRecordsByDate(date: admin.firestore.Timestamp): Promise<AttendanceRecord[]> {
    const startOfDay = new Date(date.toDate());
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date.toDate());
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);
    const endTimestamp = admin.firestore.Timestamp.fromDate(endOfDay);

    const query = this.db.collection(this.collectionName)
                         .where('date', '>=', startTimestamp)
                         .where('date', '<=', endTimestamp);

    return this.search<AttendanceRecord>(query);
  }

  // 날짜 범위의 출석 기록 조회
  async getAttendanceRecordsByDateRange(
    startDate: admin.firestore.Timestamp, 
    endDate: admin.firestore.Timestamp
  ): Promise<AttendanceRecord[]> {
    const query = this.db.collection(this.collectionName)
                         .where('date', '>=', startDate)
                         .where('date', '<=', endDate)
                         .orderBy('date', 'desc');

    return this.search<AttendanceRecord>(query);
  }

  // 출석 기록 검색
  async searchAttendanceRecords(params: AttendanceSearchParams): Promise<AttendanceRecord[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName);

    // 학생 ID로 검색
    if (params.studentId) {
      query = query.where('studentId', '==', params.studentId);
    }

    // 출석 상태로 검색
    if (params.status) {
      query = query.where('status', '==', params.status);
    }

    // 특정 날짜로 검색
    if (params.date) {
      const startOfDay = new Date(params.date.toDate());
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(params.date.toDate());
      endOfDay.setHours(23, 59, 59, 999);

      const startTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);
      const endTimestamp = admin.firestore.Timestamp.fromDate(endOfDay);

      query = query.where('date', '>=', startTimestamp)
                   .where('date', '<=', endTimestamp);
    }

    // 날짜 범위로 검색
    if (params.dateRange) {
      if (params.dateRange.start) {
        query = query.where('date', '>=', params.dateRange.start);
      }
      if (params.dateRange.end) {
        query = query.where('date', '<=', params.dateRange.end);
      }
    }

    // 지각 여부로 검색
    if (params.isLate !== undefined) {
      query = query.where('isLate', '==', params.isLate);
    }



    // 업데이트한 사용자로 검색
    if (params.updatedBy) {
      query = query.where('updatedBy', '==', params.updatedBy);
    }



    // 날짜순 정렬
    query = query.orderBy('date', 'desc');

    return this.search<AttendanceRecord>(query);
  }

  // 학생별 출석 통계 조회
  async getStudentAttendanceStatistics(studentId: string): Promise<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    dismissedDays: number;
    attendanceRate: number;
    lastAttendanceDate: admin.firestore.Timestamp | null;
  }> {
    const records = await this.getAttendanceRecordsByStudentId(studentId);
    
    if (records.length === 0) {
      return {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        dismissedDays: 0,
        attendanceRate: 0,
        lastAttendanceDate: null
      };
    }

    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const absentDays = records.filter(r => 
      r.status === 'unauthorized_absent' || r.status === 'authorized_absent'
    ).length;
    const lateDays = records.filter(r => r.isLate).length;
    const dismissedDays = records.filter(r => r.status === 'dismissed').length;
    const attendanceRate = presentDays / totalDays;

    const lastAttendanceDate = records.length > 0 ? records[0].date : null;

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      dismissedDays,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      lastAttendanceDate
    };
  }

  // 일별 출석 현황 요약
  async getDailyAttendanceSummary(date: admin.firestore.Timestamp): Promise<{
    date: admin.firestore.Timestamp;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    dismissedCount: number;
    notEnrolledCount: number;
  }> {
    const records = await this.getAttendanceRecordsByDate(date);
    
    const totalStudents = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => 
      r.status === 'unauthorized_absent' || r.status === 'authorized_absent'
    ).length;
    const lateCount = records.filter(r => r.isLate).length;
    const dismissedCount = records.filter(r => r.status === 'dismissed').length;
    const notEnrolledCount = records.filter(r => r.status === 'not_enrolled').length;

    return {
      date,
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      dismissedCount,
      notEnrolledCount
    };
  }

  // 월별 출석 통계
  async getMonthlyAttendanceStatistics(
    year: number, 
    month: number
  ): Promise<{
    year: number;
    month: number;
    totalDays: number;
    averageAttendanceRate: number;
    totalStudents: number;
    dailySummaries: Array<{
      date: admin.firestore.Timestamp;
      presentCount: number;
      absentCount: number;
      attendanceRate: number;
    }>;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
    const endTimestamp = admin.firestore.Timestamp.fromDate(endDate);

    const records = await this.getAttendanceRecordsByDateRange(startTimestamp, endTimestamp);
    
    // 날짜별로 그룹화
    const dailyGroups: Record<string, AttendanceRecord[]> = {};
    records.forEach(record => {
      const dateKey = record.date.toDate().toISOString().split('T')[0];
      if (!dailyGroups[dateKey]) {
        dailyGroups[dateKey] = [];
      }
      dailyGroups[dateKey].push(record);
    });

    const dailySummaries = Object.entries(dailyGroups).map(([dateKey, dayRecords]) => {
      const presentCount = dayRecords.filter(r => r.status === 'present').length;
      const absentCount = dayRecords.filter(r => 
        r.status === 'unauthorized_absent' || r.status === 'authorized_absent'
      ).length;
      const totalCount = dayRecords.length;
      const attendanceRate = totalCount > 0 ? presentCount / totalCount : 0;

      return {
        date: admin.firestore.Timestamp.fromDate(new Date(dateKey)),
        presentCount,
        absentCount,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      };
    });

    const totalDays = dailySummaries.length;
    const averageAttendanceRate = dailySummaries.length > 0 
      ? dailySummaries.reduce((sum, day) => sum + day.attendanceRate, 0) / totalDays 
      : 0;

    // 고유한 학생 수 계산
    const uniqueStudentIds = new Set(records.map(r => r.studentId));
    const totalStudents = uniqueStudentIds.size;

    return {
      year,
      month,
      totalDays,
      averageAttendanceRate: Math.round(averageAttendanceRate * 100) / 100,
      totalStudents,
      dailySummaries
    };
  }

  // 출석 상태별 통계
  async getAttendanceStatusStatistics(): Promise<Record<string, number>> {
    const records = await this.getAllAttendanceRecords();
    const statusCount: Record<string, number> = {};

    records.forEach(record => {
      const status = record.status;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return statusCount;
  }

  // 지각/결석 학생 목록
  async getStudentsWithAttendanceIssues(
    startDate: admin.firestore.Timestamp,
    endDate: admin.firestore.Timestamp
  ): Promise<{
    lateStudents: Array<{ studentId: string; count: number }>;
    absentStudents: Array<{ studentId: string; count: number }>;
  }> {
    const records = await this.getAttendanceRecordsByDateRange(startDate, endDate);
    
    // 지각 학생 통계
    const lateCounts: Record<string, number> = {};
    const absentCounts: Record<string, number> = {};

    records.forEach(record => {
      if (record.isLate) {
        lateCounts[record.studentId] = (lateCounts[record.studentId] || 0) + 1;
      }
      if (record.status === 'unauthorized_absent' || record.status === 'authorized_absent') {
        absentCounts[record.studentId] = (absentCounts[record.studentId] || 0) + 1;
      }
    });

    const lateStudents = Object.entries(lateCounts)
      .map(([studentId, count]) => ({ studentId, count }))
      .sort((a, b) => b.count - a.count);

    const absentStudents = Object.entries(absentCounts)
      .map(([studentId, count]) => ({ studentId, count }))
      .sort((a, b) => b.count - a.count);

    return {
      lateStudents,
      absentStudents
    };
  }

  // 일괄 출석 기록 생성 (여러 학생의 동일 날짜)
  async createBulkAttendanceRecords(
    records: CreateAttendanceRecordRequest[]
  ): Promise<string[]> {
    const attendanceDataList = records.map(data => ({
      ...data,
      isLate: data.isLate ?? false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }));

    return this.batchCreate(attendanceDataList);
  }

  // 출석 기록 복사 (특정 날짜의 출석을 다른 날짜로 복사)
  async copyAttendanceRecords(
    sourceDate: admin.firestore.Timestamp,
    targetDate: admin.firestore.Timestamp
  ): Promise<string[]> {
    const sourceRecords = await this.getAttendanceRecordsByDate(sourceDate);
    
    if (sourceRecords.length === 0) {
      return [];
    }

    const newRecords = sourceRecords.map(record => ({
      studentId: record.studentId,
      date: targetDate,
      status: record.status,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: record.updatedBy,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      notes: record.notes,
      isLate: record.isLate
    }));

    return this.batchCreate(newRecords);
  }
}
