import { BaseService } from '../base/BaseService';
import type { 
  Student, 
  CreateStudentRequest, 
  UpdateStudentRequest
} from '@shared/types';
import { 
  INITIAL_STUDENTS_DATA 
} from './studentData';
import type { AttendanceStatus } from '@shared/types/common.types';

export class StudentService extends BaseService {
  static readonly COLLECTION_NAME = 'students';

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

  async initializeStudents(): Promise<void> {
    try {
      console.log('🔄 학생 데이터 초기화 시작...');
      
      // 기존 학생 데이터 삭제
      const snapshot = await this.getCollection(StudentService.COLLECTION_NAME).get();
      const batch = this.db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log('🗑️ 기존 학생 데이터 삭제 완료');

      // 새로운 학생 데이터 생성
      const studentsData = INITIAL_STUDENTS_DATA;
      const newBatch = this.db.batch();
      
      studentsData.forEach(student => {
        // student.id를 Firestore 문서 ID로 사용하여 ID 일치 문제 해결
        const docRef = this.getCollection(StudentService.COLLECTION_NAME).doc(student.id);
        newBatch.set(docRef, student);
      });
      
      await newBatch.commit();
      
      console.log(`✅ ${studentsData.length}명의 학생이 초기화되었습니다.`);
    } catch (error) {
      console.error('❌ 학생 초기화 오류:', error);
      throw new Error('학생 초기화에 실패했습니다.');
    }
  }

  async getAllStudents(): Promise<Student[]> {
    try {
      console.log('전체 학생 데이터 조회 시작...');
      
      const snapshot = await this.getCollection(StudentService.COLLECTION_NAME).get();
      const students: Student[] = [];
      
      snapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() } as Student);
      });
      
      console.log('조회된 학생 수:', students.length);
      return students;
    } catch (error) {
      console.error('학생 데이터 조회 오류:', error);
      throw error;
    }
  }

  async getStudentById(id: string): Promise<Student | null> {
    try {
      console.log('학생 데이터 조회:', id);
      
      // 학생의 id 필드로 조회
      const snapshot = await this.getCollection(StudentService.COLLECTION_NAME)
        .where('id', '==', id)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        console.log('학생을 찾을 수 없음:', id);
        return null;
      }
      
      const doc = snapshot.docs[0];
      return { id: doc.data().id, ...doc.data() } as Student;
    } catch (error) {
      console.error('학생 데이터 조회 오류:', error);
      throw error;
    }
  }

  async updateAttendance(studentId: string, attendanceStatus: AttendanceStatus, updatedBy: string): Promise<void> {
    try {
      console.log('=== 출석 상태 업데이트 시작 ===');
      console.log('학생 ID:', studentId);
      console.log('출석 상태:', attendanceStatus);
      console.log('업데이트자:', updatedBy);
      
      // 먼저 모든 학생 목록을 확인
      const allStudents = await this.getAllStudents();
      console.log('전체 학생 수:', allStudents.length);
      console.log('전체 학생 ID 목록:', allStudents.map(s => s.id));
      
      // 학생 ID로 학생 찾기 (getStudentById 대신 getAllStudents에서 찾기)
      console.log('찾으려는 학생 ID:', studentId);
      console.log('전체 학생 ID들:', allStudents.map(s => s.id));
      console.log('정확히 일치하는지 확인:');
      allStudents.forEach((s, index) => {
        console.log(`학생 ${index}: ID="${s.id}", 일치=${s.id === studentId}`);
      });
      
      const student = allStudents.find(s => s.id === studentId);
      if (!student) {
        console.log('❌ 학생을 찾을 수 없음:', studentId);
        console.log('가장 가까운 학생 ID들:');
        const similarIds = allStudents
          .map(s => s.id)
          .filter(id => id.includes(studentId.split('_')[1] || ''))
          .slice(0, 5);
        console.log(similarIds);
        throw new Error('학생을 찾을 수 없습니다.');
      }

      console.log('✅ 학생 찾음:', student.name, student.id);
      console.log('학생 데이터 구조:', JSON.stringify(student, null, 2));

      // Firestore 문서 ID 찾기 (실제 Firestore 문서 ID)
      const snapshot = await this.getCollection(StudentService.COLLECTION_NAME)
        .where('id', '==', studentId)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        console.log('❌ Firestore에서 학생 문서를 찾을 수 없음:', studentId);
        throw new Error('학생 문서를 찾을 수 없습니다.');
      }

      const doc = snapshot.docs[0];
      const firestoreDocId = doc.id;
      console.log('Firestore 문서 ID:', firestoreDocId);

      // Firestore 업데이트 전 로그
      console.log('Firestore 업데이트 시작...');
      console.log('컬렉션:', StudentService.COLLECTION_NAME);
      console.log('문서 ID:', firestoreDocId);
      console.log('업데이트 데이터:', {
        'currentStatus.currentAttendance': attendanceStatus,
        'currentStatus.lastAttendanceUpdate': new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 새로운 구조로 업데이트
      await this.getCollection(StudentService.COLLECTION_NAME).doc(firestoreDocId).update({
        'currentStatus.currentAttendance': attendanceStatus,
        'currentStatus.lastAttendanceUpdate': new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ 출석 상태 업데이트 완료');
    } catch (error) {
      console.error('❌ 출석 상태 업데이트 오류:', error);
      console.error('오류 타입:', typeof error);
      console.error('오류 메시지:', (error as any).message);
      console.error('오류 스택:', (error as any).stack);
      throw error;
    }
  }

  async getAttendanceHistory(studentId: string, days: number = 7): Promise<any[]> {
    try {
      console.log('출석 기록 조회:', studentId, days);
      
      const student = await this.getStudentById(studentId);
      if (!student) {
        throw new Error('학생을 찾을 수 없습니다.');
      }

      // 기존 구조에서 attendanceHistory 가져오기
      const attendanceHistory = (student as any).attendanceHistory || [];
      
      const recentHistory = attendanceHistory.filter((record: any) => {
        const recordDate = new Date(record.date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return recordDate >= cutoffDate;
      });

      console.log('조회된 출석 기록 수:', recentHistory.length);
      return recentHistory;
    } catch (error) {
      console.error('출석 기록 조회 오류:', error);
      throw error;
    }
  }

  async createStudent(data: CreateStudentRequest): Promise<Student> {
    try {
      console.log('학생 생성:', data);
      
      // 필수 필드 검증
      if (!data.name || !data.grade || !data.className) {
        throw new Error('필수 필드가 누락되었습니다.');
      }
      
      const student: Student = {
        id: this.generateId(),
        name: data.name,
        grade: data.grade,
        className: data.className,
        status: data.status || 'active',
        enrollmentDate: data.enrollmentDate || new Date().toISOString().split('T')[0],
        graduationDate: data.graduationDate,
        contactInfo: data.contactInfo,
        parentInfo: data.parentInfo,
        currentStatus: {
          currentAttendance: (data.currentAttendance as AttendanceStatus) || 'unauthorized_absent',
          lastAttendanceUpdate: new Date().toISOString(),
          firstAttendanceDate: data.firstAttendanceDate || new Date().toISOString().split('T')[0],
          totalAttendanceDays: 0,
          averageCheckInTime: '09:00',
          averageCheckOutTime: '18:00'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await this.getCollection(StudentService.COLLECTION_NAME).doc(student.id).set(student);
      console.log('학생 생성 완료:', student.id);
      
      return student;
    } catch (error) {
      console.error('학생 생성 오류:', error);
      throw error;
    }
  }

  async updateStudent(id: string, data: UpdateStudentRequest): Promise<Student | null> {
    try {
      console.log('학생 정보 업데이트:', id, data);
      
      const student = await this.getStudentById(id);
      if (!student) {
        return null;
      }
      
      const updateData: Partial<Student> = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      await this.getCollection(StudentService.COLLECTION_NAME).doc(id).update(updateData);
      
      // 업데이트된 학생 정보 반환
      const updatedStudent = await this.getStudentById(id);
      console.log('학생 정보 업데이트 완료:', id);
      return updatedStudent;
    } catch (error) {
      console.error('학생 정보 업데이트 오류:', error);
      throw error;
    }
  }

  async deleteStudent(id: string): Promise<boolean> {
    try {
      console.log('학생 삭제:', id);
      
      const student = await this.getStudentById(id);
      if (!student) {
        return false;
      }
      
      await this.getCollection(StudentService.COLLECTION_NAME).doc(id).delete();
      
      console.log('학생 삭제 완료:', id);
      return true;
    } catch (error) {
      console.error('학생 삭제 오류:', error);
      throw error;
    }
  }

  // 출석 기록 관련 메서드들
  async createAttendanceRecord(data: any): Promise<any> {
    try {
      console.log('출석 기록 생성:', data);
      
      const attendanceRecord: any = {
        id: this.generateAttendanceId(),
        studentId: data.studentId,
        date: data.date,
        status: data.status,
        timestamp: new Date().toISOString(),
        updatedBy: data.updatedBy || 'system',
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        location: data.location,
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await this.getCollection('attendance_records').doc(attendanceRecord.id).set(attendanceRecord);
      
      console.log('출석 기록 생성 완료:', attendanceRecord.id);
      return attendanceRecord;
    } catch (error) {
      console.error('출석 기록 생성 오류:', error);
      throw error;
    }
  }

  async updateAttendanceRecord(id: string, data: any): Promise<any | null> {
    try {
      console.log('출석 기록 업데이트:', id, data);
      
      const record = await this.getAttendanceRecordById(id);
      if (!record) {
        return null;
      }
      
      const updateData: Partial<any> = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      await this.getCollection('attendance_records').doc(id).update(updateData);
      
      const updatedRecord = await this.getAttendanceRecordById(id);
      console.log('출석 기록 업데이트 완료:', id);
      return updatedRecord;
    } catch (error) {
      console.error('출석 기록 업데이트 오류:', error);
      throw error;
    }
  }

  async deleteAttendanceRecord(id: string): Promise<boolean> {
    try {
      console.log('출석 기록 삭제:', id);
      
      const record = await this.getAttendanceRecordById(id);
      if (!record) {
        return false;
      }
      
      await this.getCollection('attendance_records').doc(id).delete();
      
      console.log('출석 기록 삭제 완료:', id);
      return true;
    } catch (error) {
      console.error('출석 기록 삭제 오류:', error);
      throw error;
    }
  }

  async getAttendanceRecordById(id: string): Promise<any | null> {
    try {
      console.log('출석 기록 조회:', id);
      
      const doc = await this.getCollection('attendance_records').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return doc.data();
    } catch (error) {
      console.error('출석 기록 조회 오류:', error);
      throw error;
    }
  }

  async getAttendanceRecords(filters?: any): Promise<any[]> {
    try {
      console.log('출석 기록 목록 조회:', filters);
      
      let query = this.getCollection('attendance_records') as any;
      
      // 필터 적용
      if (filters?.studentId) {
        query = query.where('studentId', '==', filters.studentId);
      }
      if (filters?.date) {
        query = query.where('date', '==', filters.date);
      }
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      
      const snapshot = await query.get();
      const records: any[] = [];
      
      snapshot.forEach((doc: any) => {
        records.push(doc.data());
      });
      
      console.log('조회된 출석 기록 수:', records.length);
      return records;
    } catch (error) {
      console.error('출석 기록 목록 조회 오류:', error);
      throw error;
    }
  }

  private generateAttendanceId(): string {
    return `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }



  async getAttendanceStatistics(dateRange?: { start: string; end: string }): Promise<any> {
    try {
      console.log('출석 통계 조회 시작...');
      
      const students = await this.getAllStudents();
      const totalStudents = students.length;
      
      // 간단한 통계 구현 (향후 확장 예정)
      const stats = {
        totalStudents,
        averageAttendanceRate: 0.85, // 임시 값
        statusStats: {
          present: 0,
          dismissed: 0,
          unauthorized_absent: 0,
          authorized_absent: 0,
          not_enrolled: 0
        },
        dateRange
      };
      
      console.log('출석 통계 조회 완료');
      return stats;
    } catch (error) {
      console.error('출석 통계 조회 오류:', error);
      throw error;
    }
  }

  async searchStudents(query: string, limit: number = 10): Promise<Student[]> {
    try {
      console.log('학생 검색 시작:', query, 'limit:', limit);
      
      const students = await this.getAllStudents();
      
      // 간단한 검색 구현 (향후 Firestore 쿼리로 개선 예정)
      const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
      
      console.log('검색 결과:', filteredStudents.length);
      return filteredStudents;
    } catch (error) {
      console.error('학생 검색 오류:', error);
      throw error;
    }
  }

  async bulkUpdateAttendance(records: any[]): Promise<{ successCount: number; errorCount: number; errors: any[] }> {
    try {
      console.log('일괄 출석 업데이트 시작:', records.length, '개 레코드');
      
      const batch = this.db.batch();
      const results = {
        successCount: 0,
        errorCount: 0,
        errors: [] as any[]
      };
      
      for (const record of records) {
        try {
          const { studentId, attendanceStatus, updatedBy } = record;
          
          if (!studentId || !attendanceStatus) {
            results.errorCount++;
            results.errors.push({ record, error: '필수 필드 누락' });
            continue;
          }
          
          const student = await this.getStudentById(studentId);
          if (!student) {
            results.errorCount++;
            results.errors.push({ record, error: '학생을 찾을 수 없음' });
            continue;
          }
          
          const attendanceRecord = {
            date: new Date().toISOString().split('T')[0],
            status: attendanceStatus,
            timestamp: new Date().toISOString(),
            updatedBy
          };
          
          const docRef = this.getCollection(StudentService.COLLECTION_NAME).doc(studentId);
          batch.update(docRef, {
            currentAttendance: attendanceStatus,
            lastAttendanceUpdate: new Date().toISOString(),
            attendanceHistory: [
              ...(student as any).attendanceHistory || [],
              attendanceRecord
            ]
          });
          
          results.successCount++;
        } catch (error: any) {
          results.errorCount++;
          results.errors.push({ record, error: error.message || '알 수 없는 오류' });
        }
      }
      
      await batch.commit();
      console.log('일괄 출석 업데이트 완료:', results);
      return results;
    } catch (error) {
      console.error('일괄 출석 업데이트 오류:', error);
      throw error;
    }
  }
} 