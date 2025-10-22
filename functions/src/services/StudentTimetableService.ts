import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
import { TimetableVersionService } from './TimetableVersionService';
import type {
  StudentTimetable,
  CreateStudentTimetableRequest,
  UpdateStudentTimetableRequest,
  StudentTimetableSearchParams
} from '@shared/types';

export class StudentTimetableService extends BaseService {
  constructor() {
    super('student_timetables');
  }

  // 학생 시간표 생성
  async createStudentTimetable(data: CreateStudentTimetableRequest): Promise<string> {
    // versionId 필수 검증
    if (!data.versionId) {
      throw new Error('versionId is required');
    }

    const timetableData: Omit<StudentTimetable, 'id'> = {
      ...data,
      classSectionIds: data.classSectionIds || [],
      notes: data.notes || '',
      createAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return this.create(timetableData);
  }

  // 학생 시간표 조회 (ID로)
  async getStudentTimetableById(id: string): Promise<StudentTimetable | null> {
    return this.getById<StudentTimetable>(id);
  }

  // 학생 ID와 버전 ID로 시간표 조회
  async getStudentTimetableByStudentIdAndVersion(
    studentId: string,
    versionId: string
  ): Promise<StudentTimetable | null> {
    const query = this.db.collection(this.collectionName)
      .where('studentId', '==', studentId)
      .where('versionId', '==', versionId)
      .limit(1);

    const timetables = await this.search<StudentTimetable>(query);
    return timetables.length > 0 ? timetables[0] : null;
  }

  // 학생 ID로 시간표 조회 (활성 버전)
  async getStudentTimetableByStudentId(studentId: string, versionId?: string): Promise<StudentTimetable | null> {
    // versionId가 제공되지 않으면 활성 버전 사용
    let targetVersionId = versionId;

    if (!targetVersionId) {
      const versionService = new TimetableVersionService();
      const activeVersion = await versionService.getActiveVersion();

      if (!activeVersion) {
        throw new Error('No active timetable version found');
      }

      targetVersionId = activeVersion.id;
    }

    return this.getStudentTimetableByStudentIdAndVersion(studentId, targetVersionId);
  }

  // 학생 시간표 수정
  async updateStudentTimetable(id: string, data: UpdateStudentTimetableRequest): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await this.update(id, updateData);
  }

  // 학생 시간표 삭제
  async deleteStudentTimetable(id: string): Promise<void> {
    await this.delete(id);
  }

  // 모든 학생 시간표 조회
  async getAllStudentTimetables(): Promise<StudentTimetable[]> {
    return this.getAll<StudentTimetable>();
  }

  // 학생 시간표 검색
  async searchStudentTimetables(params: StudentTimetableSearchParams): Promise<StudentTimetable[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName);

    // 학생 ID로 검색
    if (params.studentId) {
      query = query.where('studentId', '==', params.studentId);
    }

    // 버전 ID로 검색
    if (params.versionId) {
      query = query.where('versionId', '==', params.versionId);
    }

    return this.search<StudentTimetable>(query);
  }

  // 학생 시간표 통계 조회
  async getStudentTimetableStatistics(): Promise<{
    totalTimetables: number;
  }> {
    const timetables = await this.getAllStudentTimetables();
    
    return {
      totalTimetables: timetables.length
    };
  }
}
