import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
import type { 
  StudentSummary, 
  CreateStudentSummaryRequest, 
  UpdateStudentSummaryRequest, 
  StudentSummarySearchParams 
} from '@shared/types';

export class StudentSummaryService extends BaseService {
  constructor() {
    super('student_summaries');
  }

  // 학생 요약 정보 생성
  async createStudentSummary(data: CreateStudentSummaryRequest): Promise<string> {
    const summaryData: Omit<StudentSummary, 'id'> = {
      ...data,
      totalAttendanceDays: data.totalAttendanceDays ?? 0,
      attendanceRate: data.attendanceRate ?? 0,
      lateCount: data.lateCount ?? 0,
      earlyLeaveCount: data.earlyLeaveCount ?? 0,
      absentCount: data.absentCount ?? 0,
      dismissedCount: data.dismissedCount ?? 0,
      averageCheckInTime: data.averageCheckInTime ?? '09:00',
      averageCheckOutTime: data.averageCheckOutTime ?? '18:00',
      lastAttendanceUpdate: data.lastAttendanceUpdate ?? admin.firestore.FieldValue.serverTimestamp(),
      lastCheckInDate: data.lastCheckInDate ?? admin.firestore.FieldValue.serverTimestamp(),
      lastCheckOutDate: data.lastCheckOutDate ?? admin.firestore.FieldValue.serverTimestamp(),

      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return this.create(summaryData);
  }

  // 학생 요약 정보 조회 (ID로)
  async getStudentSummaryById(id: string): Promise<StudentSummary | null> {
    return this.getById<StudentSummary>(id);
  }

  // 학생 ID로 요약 정보 조회
  async getStudentSummaryByStudentId(studentId: string): Promise<StudentSummary | null> {
    const query = this.db.collection(this.collectionName)
                         .where('studentId', '==', studentId);
    
    const summaries = await this.search<StudentSummary>(query);
    return summaries.length > 0 ? summaries[0] : null;
  }

  // 학생 요약 정보 수정
  async updateStudentSummary(id: string, data: UpdateStudentSummaryRequest): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await this.update(id, updateData);
  }

  // 학생 요약 정보 삭제
  async deleteStudentSummary(id: string): Promise<void> {
    await this.delete(id);
  }

  // 모든 학생 요약 정보 조회
  async getAllStudentSummaries(): Promise<StudentSummary[]> {
    return this.getAll<StudentSummary>();
  }

  // 학생 요약 정보 검색
  async searchStudentSummaries(params: StudentSummarySearchParams): Promise<StudentSummary[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName);

    // 학생 ID로 검색
    if (params.studentId) {
      query = query.where('studentId', '==', params.studentId);
    }

    // 학생 이름으로 검색
    if (params.studentName) {
      query = query.where('studentName', '>=', params.studentName)
                   .where('studentName', '<=', params.studentName + '\uf8ff');
    }

    // 현재 출석 상태로 검색
    if (params.currentAttendance) {
      query = query.where('currentAttendance', '==', params.currentAttendance);
    }

    // 출석률 범위로 검색
    if (params.minAttendanceRate !== undefined) {
      query = query.where('attendanceRate', '>=', params.minAttendanceRate);
    }
    if (params.maxAttendanceRate !== undefined) {
      query = query.where('attendanceRate', '<=', params.maxAttendanceRate);
    }



    return this.search<StudentSummary>(query);
  }

  // 출석률 상위 학생 조회
  async getTopAttendanceStudents(limit: number = 10): Promise<StudentSummary[]> {
    const query = this.db.collection(this.collectionName)
                         .orderBy('attendanceRate', 'desc')
                         .limit(limit);

    return this.search<StudentSummary>(query);
  }

  // 문제가 있는 학생 조회
  async getStudentsWithIssues(): Promise<StudentSummary[]> {
    const query = this.db.collection(this.collectionName)
                         .where('attendanceRate', '<', 0.8);

    return this.search<StudentSummary>(query);
  }

  // 학생 요약 정보 통계
  async getStudentSummaryStatistics(): Promise<{
    totalStudents: number;
    averageAttendanceRate: number;
    studentsWithIssues: number;
    topAttendanceStudents: string[];
    studentsNeedingAttention: string[];
  }> {
    const summaries = await this.getAllStudentSummaries();
    
    if (summaries.length === 0) {
      return {
        totalStudents: 0,
        averageAttendanceRate: 0,
        studentsWithIssues: 0,
        topAttendanceStudents: [],
        studentsNeedingAttention: []
      };
    }

    const totalStudents = summaries.length;
    const totalAttendanceRate = summaries.reduce((sum, s) => sum + s.attendanceRate, 0);
    const averageAttendanceRate = totalAttendanceRate / totalStudents;

    const studentsWithIssues = summaries.filter(s => 
      s.attendanceRate < 0.8
    ).length;

    const topAttendanceStudents = summaries
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 5)
      .map(s => s.studentName);

    const studentsNeedingAttention = summaries
      .filter(s => s.attendanceRate < 0.8)
      .map(s => s.studentName);

    return {
      totalStudents,
      averageAttendanceRate: Math.round(averageAttendanceRate * 100) / 100,
      studentsWithIssues,
      topAttendanceStudents,
      studentsNeedingAttention
    };
  }

  // 출석 상태별 학생 수 조회
  async getStudentCountByAttendanceStatus(): Promise<Record<string, number>> {
    const summaries = await this.getAllStudentSummaries();
    const countByStatus: Record<string, number> = {};

    summaries.forEach(summary => {
      const status = summary.currentAttendance;
      countByStatus[status] = (countByStatus[status] || 0) + 1;
    });

    return countByStatus;
  }

  // 일별 출석 현황 요약
  async getDailyAttendanceSummary(): Promise<{
    totalStudents: number;
    presentCount: number;
    dismissedCount: number;
    absentCount: number;
    lateCount: number;
    earlyLeaveCount: number;
  }> {
    const summaries = await this.getAllStudentSummaries();
    
    const totalStudents = summaries.length;
    const presentCount = summaries.filter(s => s.currentAttendance === 'present').length;
    const dismissedCount = summaries.filter(s => s.currentAttendance === 'dismissed').length;
    const absentCount = summaries.filter(s => s.currentAttendance === 'unauthorized_absent' || s.currentAttendance === 'authorized_absent').length;
    const lateCount = summaries.reduce((sum, s) => sum + s.lateCount, 0);
    const earlyLeaveCount = summaries.reduce((sum, s) => sum + s.earlyLeaveCount, 0);

    return {
      totalStudents,
      presentCount,
      dismissedCount,
      absentCount,
      lateCount,
      earlyLeaveCount
    };
  }
}
