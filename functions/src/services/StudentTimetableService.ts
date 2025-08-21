import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
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
    const timetableData: Omit<StudentTimetable, 'id'> = {
      ...data,
      classSectionIds: data.classSectionIds || [],
      createAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return this.create(timetableData);
  }

  // 학생 시간표 조회 (ID로)
  async getStudentTimetableById(id: string): Promise<StudentTimetable | null> {
    return this.getById<StudentTimetable>(id);
  }

  // 학생 ID로 시간표 조회
  async getStudentTimetableByStudentId(studentId: string): Promise<StudentTimetable | null> {
    const query = this.db.collection(this.collectionName)
                         .where('studentId', '==', studentId);
    
    const timetables = await this.search<StudentTimetable>(query);
    return timetables.length > 0 ? timetables[0] : null;
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
