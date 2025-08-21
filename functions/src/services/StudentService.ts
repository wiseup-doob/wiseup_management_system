import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
import type { Student, CreateStudentRequest, UpdateStudentRequest, StudentSearchParams, Grade } from '@shared/types';

export class StudentService extends BaseService {
  constructor() {
    super('students');
  }

  // 학생 생성
  async createStudent(data: CreateStudentRequest): Promise<string> {
    const studentData: Omit<Student, 'id'> = {
      ...data,
      status: data.status || 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return this.create(studentData);
  }

  // 학생 조회 (ID로)
  async getStudentById(id: string): Promise<Student | null> {
    return this.getById<Student>(id);
  }

  // 학생 수정
  async updateStudent(id: string, data: UpdateStudentRequest): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await this.update(id, updateData);
  }

  // 학생 삭제
  async deleteStudent(id: string): Promise<void> {
    await this.delete(id);
  }

  // 학생 계층적 삭제 (관련 데이터 모두 삭제)
  async deleteStudentHierarchically(studentId: string): Promise<{
    success: boolean;
    deletedRecords: {
      attendanceRecords: number;
      seatAssignments: number;
      studentSummary: boolean;
      timetable: boolean;
      student: boolean;
    };
    message: string;
  }> {
    try {
      // 트랜잭션 시작
      const result = await this.runTransaction(async (transaction) => {
        let attendanceDeleted = 0;
        let seatAssignmentDeleted = 0;
        let studentSummaryDeleted = false;
        let timetableDeleted = false;
        let studentDeleted = false;

        // 1단계: 출석 기록 삭제
        const attendanceQuery = this.db.collection('attendance_records')
                                       .where('studentId', '==', studentId);
        const attendanceDocs = await transaction.get(attendanceQuery);
        attendanceDeleted = attendanceDocs.size;
        
        attendanceDocs.forEach(doc => {
          transaction.delete(doc.ref);
        });

        // 2단계: 좌석 배정 삭제
        const seatQuery = this.db.collection('seat_assignments')
                                 .where('studentId', '==', studentId);
        const seatDocs = await transaction.get(seatQuery);
        seatAssignmentDeleted = seatDocs.size;
        
        seatDocs.forEach(doc => {
          transaction.delete(doc.ref);
        });

        // 3단계: 학생 요약 정보 삭제
        const summaryRef = this.db.collection('student_summaries').doc(studentId);
        const summaryDoc = await transaction.get(summaryRef);
        if (summaryDoc.exists) {
          transaction.delete(summaryRef);
          studentSummaryDeleted = true;
        }

        // 4단계: 학생 개인 시간표 삭제
        const timetableRef = this.db.collection('student_timetables').doc(studentId);
        const timetableDoc = await transaction.get(timetableRef);
        if (timetableDoc.exists) {
          transaction.delete(timetableRef);
          timetableDeleted = true;
        }

        // 5단계: 학생 삭제
        const studentRef = this.db.collection('students').doc(studentId);
        transaction.delete(studentRef);
        studentDeleted = true;

        return {
          attendanceDeleted,
          seatAssignmentDeleted,
          studentSummaryDeleted,
          timetableDeleted,
          studentDeleted
        };
      });

      return {
        success: true,
        deletedRecords: {
          attendanceRecords: result.attendanceDeleted,
          seatAssignments: result.seatAssignmentDeleted,
          studentSummary: result.studentSummaryDeleted,
          timetable: result.timetableDeleted,
          student: result.studentDeleted
        },
        message: '학생과 관련 데이터가 모두 삭제되었습니다.'
      };

    } catch (error) {
      console.error('학생 계층적 삭제 실패:', error);
      throw new Error(`학생 계층적 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 모든 학생 조회
  async getAllStudents(): Promise<Student[]> {
    return this.getAll<Student>();
  }

  // 학생 검색
  async searchStudents(params: StudentSearchParams): Promise<Student[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName);

    // 이름으로 검색
    if (params.name) {
      query = query.where('name', '>=', params.name)
                   .where('name', '<=', params.name + '\uf8ff');
    }

    // 학년으로 검색
    if (params.grade) {
      query = query.where('grade', '==', params.grade);
    }

    // 상태로 검색
    if (params.status) {
      query = query.where('status', '==', params.status);
    }

    // 부모 ID로 검색
    if (params.parentsId) {
      query = query.where('parentsId', '==', params.parentsId);
    }

    // 첫 등원일 범위로 검색
    if (params.firstAttendanceDateRange) {
      query = query.where('firstAttendanceDate', '>=', params.firstAttendanceDateRange.start)
                   .where('firstAttendanceDate', '<=', params.firstAttendanceDateRange.end);
    }

    // 마지막 등원일 범위로 검색
    if (params.lastAttendanceDateRange) {
      query = query.where('lastAttendanceDate', '>=', params.lastAttendanceDateRange.start)
                   .where('lastAttendanceDate', '<=', params.lastAttendanceDateRange.end);
    }

    return this.search<Student>(query);
  }

  // 학년별 학생 수 조회
  async getStudentCountByGrade(): Promise<Record<Grade, number>> {
    const students = await this.getAllStudents();
    
    if (students.length === 0) {
      return {} as Record<Grade, number>;
    }

    const countByGrade: Record<Grade, number> = {} as Record<Grade, number>;
    students.forEach(student => {
      countByGrade[student.grade] = (countByGrade[student.grade] || 0) + 1;
    });

    return countByGrade;
  }

  // 활성 학생 수 조회
  async getActiveStudentCount(): Promise<number> {
    const query = this.db.collection(this.collectionName)
                         .where('status', '==', 'active');
    
    const students = await this.search<Student>(query);
    return students.length;
  }

  // 첫 등원일 범위로 학생 조회
  async getStudentsByFirstAttendanceDate(startDate: admin.firestore.Timestamp, endDate: admin.firestore.Timestamp): Promise<Student[]> {
    const query = this.db.collection(this.collectionName)
                         .where('firstAttendanceDate', '>=', startDate)
                         .where('firstAttendanceDate', '<=', endDate);
    
    return this.search<Student>(query);
  }

  // 마지막 등원일 범위로 학생 조회
  async getStudentsByLastAttendanceDate(startDate: admin.firestore.Timestamp, endDate: admin.firestore.Timestamp): Promise<Student[]> {
    const query = this.db.collection(this.collectionName)
                         .where('lastAttendanceDate', '>=', startDate)
                         .where('lastAttendanceDate', '<=', endDate);
    
    return this.search<Student>(query);
  }

  // 학생 의존성 확인
  async getStudentDependencies(studentId: string): Promise<{
    hasAttendanceRecords: boolean;
    attendanceCount: number;
    hasTimetable: boolean;
    hasClassEnrollments: boolean;
    classEnrollmentCount: number;
    hasSeatAssignments: boolean;
    seatAssignmentCount: number;
    hasStudentSummary: boolean;
    totalRelatedRecords: number;
  }> {
    try {
      // 병렬로 모든 의존성 확인
      const [
        attendanceCount,
        seatAssignmentCount,
        hasStudentSummary,
        hasTimetable,
        classEnrollmentCount
      ] = await Promise.all([
        this.getAttendanceCountByStudentId(studentId),
        this.getSeatAssignmentCountByStudentId(studentId),
        this.checkStudentSummaryExists(studentId),
        this.checkStudentTimetableExists(studentId),
        this.getClassEnrollmentCountByStudentId(studentId)
      ]);

      return {
        hasAttendanceRecords: attendanceCount > 0,
        attendanceCount,
        hasTimetable: hasTimetable,
        hasClassEnrollments: classEnrollmentCount > 0,
        classEnrollmentCount,
        hasSeatAssignments: seatAssignmentCount > 0,
        seatAssignmentCount,
        hasStudentSummary: hasStudentSummary,
        totalRelatedRecords: attendanceCount + seatAssignmentCount + (hasStudentSummary ? 1 : 0) + (hasTimetable ? 1 : 0)
      };
    } catch (error) {
      console.error('학생 의존성 확인 실패:', error);
      throw new Error(`학생 의존성 확인 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 출석 기록 수 조회
  private async getAttendanceCountByStudentId(studentId: string): Promise<number> {
    const query = this.db.collection('attendance_records')
                         .where('studentId', '==', studentId);
    const records = await this.search(query);
    return records.length;
  }

  // 좌석 배정 수 조회
  private async getSeatAssignmentCountByStudentId(studentId: string): Promise<number> {
    const query = this.db.collection('seat_assignments')
                         .where('studentId', '==', studentId);
    const assignments = await this.search(query);
    return assignments.length;
  }

  // 학생 요약 정보 존재 여부 확인
  private async checkStudentSummaryExists(studentId: string): Promise<boolean> {
    const summaryDoc = await this.db.collection('student_summaries').doc(studentId).get();
    return summaryDoc.exists;
  }

  // 학생 시간표 존재 여부 확인
  private async checkStudentTimetableExists(studentId: string): Promise<boolean> {
    const timetableDoc = await this.db.collection('student_timetables').doc(studentId).get();
    return timetableDoc.exists;
  }

  // 수업 등록 수 조회
  private async getClassEnrollmentCountByStudentId(studentId: string): Promise<number> {
    const timetableDoc = await this.db.collection('student_timetables').doc(studentId).get();
    if (!timetableDoc.exists) {
      return 0;
    }
    
    const timetableData = timetableDoc.data();
    return timetableData?.classSectionIds?.length || 0;
  }
}
