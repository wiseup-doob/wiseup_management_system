import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
import type { 
  Classroom, 
  CreateClassroomRequest, 
  UpdateClassroomRequest, 
  ClassroomSearchParams 
} from '@shared/types';

export class ClassroomService extends BaseService {
  constructor() {
    super('classrooms');
  }

  // 교실 생성
  async createClassroom(data: CreateClassroomRequest): Promise<string> {
    const classroomData: Omit<Classroom, 'id'> = {
      name: data.name,
      capacity: data.capacity,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return this.create(classroomData);
  }

  // 교실 조회 (ID로)
  async getClassroomById(id: string): Promise<Classroom | null> {
    return this.getById<Classroom>(id);
  }

  // 교실 수정
  async updateClassroom(id: string, data: UpdateClassroomRequest): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await this.update(id, updateData);
  }

  // 교실 삭제
  async deleteClassroom(id: string): Promise<void> {
    await this.delete(id);
  }

  // 모든 교실 조회
  async getAllClassrooms(): Promise<Classroom[]> {
    return this.getAll<Classroom>();
  }

  // 교실 검색
  async searchClassrooms(params: ClassroomSearchParams): Promise<Classroom[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName);

    // 교실명으로 검색
    if (params.name) {
      query = query.where('name', '>=', params.name)
                   .where('name', '<=', params.name + '\uf8ff');
    }

    return this.search<Classroom>(query);
  }

  // 교실 통계 조회
  async getClassroomStatistics(): Promise<{
    totalClassrooms: number;
    totalCapacity: number;
    averageCapacity: number;
  }> {
    const classrooms = await this.getAllClassrooms();
    
    if (classrooms.length === 0) {
      return {
        totalClassrooms: 0,
        totalCapacity: 0,
        averageCapacity: 0
      };
    }

    const totalCapacity = classrooms.reduce((sum, c) => sum + (c.capacity || 0), 0);
    const averageCapacity = totalCapacity / classrooms.length;

    return {
      totalClassrooms: classrooms.length,
      totalCapacity,
      averageCapacity: Math.round(averageCapacity)
    };
  }

  // 교실 정보 검증
  async validateClassroomData(classroomData: Partial<Classroom>): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // 필수 필드 검증
    if (!classroomData.name || classroomData.name.trim().length === 0) {
      issues.push('교실명은 필수입니다.');
    }

    // 수용 인원 검증 (선택사항이지만 값이 있으면 0보다 커야 함)
    if (classroomData.capacity !== undefined && classroomData.capacity <= 0) {
      issues.push('수용 인원은 0보다 커야 합니다.');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // 강의실 의존성 확인
  async getClassroomDependencies(classroomId: string): Promise<{
    hasClassSections: boolean;
    classSectionCount: number;
    hasStudentTimetables: boolean;
    affectedStudentCount: number;
    hasAttendanceRecords: boolean;
    attendanceCount: number;
    totalRelatedRecords: number;
  }> {
    try {
      // 병렬로 모든 의존성 확인
      const [
        classSectionCount,
        affectedStudentCount,
        attendanceCount
      ] = await Promise.all([
        this.getClassSectionCountByClassroomId(classroomId),
        this.getAffectedStudentCountByClassroomId(classroomId),
        this.getAttendanceCountByClassroomId(classroomId)
      ]);

      return {
        hasClassSections: classSectionCount > 0,
        classSectionCount,
        hasStudentTimetables: affectedStudentCount > 0,
        affectedStudentCount,
        hasAttendanceRecords: attendanceCount > 0,
        attendanceCount,
        totalRelatedRecords: classSectionCount + affectedStudentCount + attendanceCount
      };
    } catch (error) {
      console.error('강의실 의존성 확인 실패:', error);
      throw new Error(`강의실 의존성 확인 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 강의실 계층적 삭제 (관련 데이터 모두 삭제)
  async deleteClassroomHierarchically(classroomId: string): Promise<{
    success: boolean;
    deletedRecords: {
      classSections: number;
      studentTimetables: number;
      attendanceRecords: number;
      classroom: boolean;
    };
    message: string;
  }> {
    try {
      // 트랜잭션 시작
      const result = await this.runTransaction(async (transaction) => {
        // === 1단계: 모든 읽기 작업을 먼저 수행 ===
        
        // 강의실에서 진행되는 수업들 조회
        const classSectionQuery = this.db.collection('class_sections')
                                          .where('classroomId', '==', classroomId);
        const classSectionDocs = await transaction.get(classSectionQuery);
        const classSectionIds = classSectionDocs.docs.map(doc => doc.id);
        
        // 해당 수업들을 듣는 학생들의 시간표 조회
        const studentTimetableQuery = this.db.collection('student_timetables');
        const studentTimetableDocs = await transaction.get(studentTimetableQuery);
        
        // 해당 수업들의 출석 기록 조회
        let attendanceDocs: admin.firestore.QueryDocumentSnapshot[] = [];
        if (classSectionIds.length > 0) {
          // Firestore의 'in' 쿼리는 최대 10개까지만 지원하므로 청크로 나누어 처리
          const chunks = this.chunkArray(classSectionIds, 10);
          for (const chunk of chunks) {
            const attendanceQuery = this.db.collection('attendance_records')
                                           .where('classSectionId', 'in', chunk);
            const chunkDocs = await transaction.get(attendanceQuery);
            attendanceDocs.push(...chunkDocs.docs);
          }
        }
        
        // === 2단계: 모든 쓰기 작업을 수행 ===
        
        let classSectionsDeleted = classSectionDocs.size;
        let studentTimetablesDeleted = 0;
        let attendanceRecordsDeleted = attendanceDocs.length;
        let classroomDeleted = false;
        
        // 수업들 삭제
        classSectionDocs.docs.forEach(doc => {
          transaction.delete(doc.ref);
        });
        
        // 학생 시간표 업데이트
        for (const doc of studentTimetableDocs.docs) {
          const timetableData = doc.data();
          if (timetableData.classSectionIds && Array.isArray(timetableData.classSectionIds)) {
            // 삭제될 수업 ID들을 제거
            const updatedClassSectionIds = timetableData.classSectionIds.filter(
              (id: string) => !classSectionIds.includes(id)
            );
            
            if (updatedClassSectionIds.length !== timetableData.classSectionIds.length) {
              transaction.update(doc.ref, {
                classSectionIds: updatedClassSectionIds,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });
              studentTimetablesDeleted++;
            }
          }
        }
        
        // 출석 기록 삭제
        attendanceDocs.forEach(doc => {
          transaction.delete(doc.ref);
        });
        
        // 강의실 삭제
        const classroomRef = this.db.collection('classrooms').doc(classroomId);
        transaction.delete(classroomRef);
        classroomDeleted = true;

        return {
          classSectionsDeleted,
          studentTimetablesDeleted,
          attendanceRecordsDeleted,
          classroomDeleted
        };
      });

      return {
        success: true,
        deletedRecords: {
          classSections: result.classSectionsDeleted,
          studentTimetables: result.studentTimetablesDeleted,
          attendanceRecords: result.attendanceRecordsDeleted,
          classroom: result.classroomDeleted
        },
        message: '강의실과 관련 데이터가 모두 삭제되었습니다.'
      };

    } catch (error) {
      console.error('강의실 계층적 삭제 실패:', error);
      throw new Error(`강의실 계층적 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 강의실에서 진행되는 수업 수 조회
  private async getClassSectionCountByClassroomId(classroomId: string): Promise<number> {
    const query = this.db.collection('class_sections')
                         .where('classroomId', '==', classroomId);
    const sections = await this.search<{ id: string }>(query);
    return sections.length;
  }

  // 강의실에서 진행되는 수업을 듣는 학생 수 조회
  private async getAffectedStudentCountByClassroomId(classroomId: string): Promise<number> {
    // 강의실에서 진행되는 수업들 조회
    const classSectionQuery = this.db.collection('class_sections')
                                     .where('classroomId', '==', classroomId);
    const classSections = await this.search<{ id: string }>(classSectionQuery);
    
    if (classSections.length === 0) {
      return 0;
    }

    // 해당 수업들을 듣는 학생들 조회
    const classSectionIds = classSections.map(section => section.id);
    const studentTimetableQuery = this.db.collection('student_timetables');
    const studentTimetables = await this.search<{ studentId: string; classSectionIds?: string[] }>(studentTimetableQuery);
    
    // 중복 제거하여 고유한 학생 수 계산
    const affectedStudentIds = new Set<string>();
    studentTimetables.forEach(timetable => {
      if (timetable.classSectionIds && Array.isArray(timetable.classSectionIds)) {
        timetable.classSectionIds.forEach((id: string) => {
          if (classSectionIds.includes(id)) {
            affectedStudentIds.add(timetable.studentId);
          }
        });
      }
    });

    return affectedStudentIds.size;
  }

  // 강의실에서 진행되는 수업의 출석 기록 수 조회
  private async getAttendanceCountByClassroomId(classroomId: string): Promise<number> {
    // 강의실에서 진행되는 수업들 조회
    const classSectionQuery = this.db.collection('class_sections')
                                     .where('classroomId', '==', classroomId);
    const classSections = await this.search<{ id: string }>(classSectionQuery);
    
    if (classSections.length === 0) {
      return 0;
    }

    // 해당 수업들의 출석 기록 조회
    const classSectionIds = classSections.map(section => section.id);
    const attendanceQuery = this.db.collection('attendance_records')
                                   .where('classSectionId', 'in', classSectionIds);
    const records = await this.search(attendanceQuery);
    return records.length;
  }

  // 배열을 지정된 크기의 청크로 나누는 헬퍼 메서드
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
