// 출석 관리 서비스
import { BaseService } from '../base/BaseService';
import type { 
  CreateAttendanceRecordRequest,
  UpdateAttendanceRecordRequest
} from '@shared/types';
import { generateAttendanceData } from './attendanceData';

export class AttendanceService extends BaseService {
  private static readonly COLLECTION_NAME = 'attendance_records';

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
   * 출석 데이터 초기화
   */
  async initializeAttendanceData(studentIds: string[], seatIds?: string[]): Promise<{ success: boolean; count: number; message: string }> {
    try {
      console.log('출석 데이터 초기화 시작:', studentIds.length, '명의 학생');
      
      // 기존 출석 기록 삭제 (선택사항)
      const existingRecords = await this.getAttendanceRecords();
      if (existingRecords.length > 0) {
        console.log('기존 출석 기록 삭제 중:', existingRecords.length, '개');
        const batch = this.db.batch();
        existingRecords.forEach((record: any) => {
          batch.delete(this.getCollection(AttendanceService.COLLECTION_NAME).doc(record.id));
        });
        await batch.commit();
        console.log('기존 출석 기록 삭제 완료');
      }
      
      // 새로운 출석 기록 생성
      const attendanceRecords = generateAttendanceData.generateAllRecords(studentIds, seatIds);
      console.log('생성할 출석 기록 수:', attendanceRecords.length);
      
      // 배치로 데이터 삽입
      const batch = this.db.batch();
      attendanceRecords.forEach((record: any) => {
        const docRef = this.getCollection(AttendanceService.COLLECTION_NAME).doc(record.id);
        // undefined 값을 제거한 후 저장
        const cleanedRecord = this.removeUndefinedValues(record);
        batch.set(docRef, cleanedRecord);
      });
      
      await batch.commit();
      console.log('출석 데이터 초기화 완료:', attendanceRecords.length, '개 기록');
      
      return {
        success: true,
        count: attendanceRecords.length,
        message: `${attendanceRecords.length}개의 출석 기록이 성공적으로 초기화되었습니다.`
      };
    } catch (error) {
      console.error('출석 데이터 초기화 오류:', error);
      throw error;
    }
  }

  /**
   * 오늘 날짜의 출석 기록만 초기화
   */
  async initializeTodayAttendanceData(studentIds: string[], seatIds?: string[]): Promise<{ success: boolean; count: number; message: string }> {
    try {
      console.log('오늘 날짜 출석 데이터 초기화 시작:', studentIds.length, '명의 학생');
      
      // 오늘 날짜의 기존 기록 삭제
      const today = new Date().toISOString().split('T')[0];
      const existingTodayRecords = await this.getAttendanceRecords({ date: today });
      if (existingTodayRecords.length > 0) {
        console.log('오늘 날짜 기존 출석 기록 삭제 중:', existingTodayRecords.length, '개');
        const batch = this.db.batch();
        existingTodayRecords.forEach((record: any) => {
          batch.delete(this.getCollection(AttendanceService.COLLECTION_NAME).doc(record.id));
        });
        await batch.commit();
        console.log('오늘 날짜 기존 출석 기록 삭제 완료');
      }
      
      // 오늘 날짜의 새로운 출석 기록 생성
      const todayRecords = generateAttendanceData.generateTodayRecords(studentIds, seatIds);
      console.log('생성할 오늘 출석 기록 수:', todayRecords.length);
      
      // 배치로 데이터 삽입
      const batch = this.db.batch();
      todayRecords.forEach((record: any) => {
        const docRef = this.getCollection(AttendanceService.COLLECTION_NAME).doc(record.id);
        batch.set(docRef, record);
      });
      
      await batch.commit();
      console.log('오늘 날짜 출석 데이터 초기화 완료:', todayRecords.length, '개 기록');
      
      return {
        success: true,
        count: todayRecords.length,
        message: `${todayRecords.length}개의 오늘 출석 기록이 성공적으로 초기화되었습니다.`
      };
    } catch (error) {
      console.error('오늘 날짜 출석 데이터 초기화 오류:', error);
      throw error;
    }
  }

  /**
   * 출석 기록 생성
   */
  async createAttendanceRecord(data: CreateAttendanceRecordRequest): Promise<any> {
    try {
      console.log('출석 기록 생성:', data);
      
      const attendanceRecord: any = {
        id: this.generateId(),
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
      
      await this.getCollection(AttendanceService.COLLECTION_NAME)
        .doc(attendanceRecord.id)
        .set(attendanceRecord);
      
      console.log('출석 기록 생성 완료:', attendanceRecord.id);
      return attendanceRecord;
    } catch (error) {
      console.error('출석 기록 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 출석 기록 조회
   */
  async getAttendanceRecordById(id: string): Promise<any | null> {
    try {
      console.log('출석 기록 조회:', id);
      
      const doc = await this.getCollection(AttendanceService.COLLECTION_NAME)
        .doc(id)
        .get();
      
      if (!doc.exists) {
        return null;
      }
      
      return doc.data();
    } catch (error) {
      console.error('출석 기록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 출석 기록 목록 조회
   */
  async getAttendanceRecords(filters?: any): Promise<any[]> {
    try {
      console.log('출석 기록 목록 조회:', filters);
      
      let query = this.getCollection(AttendanceService.COLLECTION_NAME) as any;
      
      // 필터 적용
      if (filters?.studentId) {
        query = query.where('studentId', '==', filters.studentId);
      }
      if (filters?.date) {
        query = query.where('date', '==', filters.date);
      }
      if (filters?.startDate) {
        query = query.where('date', '>=', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.where('date', '<=', filters.endDate);
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

  /**
   * 출석 기록 업데이트
   */
  async updateAttendanceRecord(id: string, data: UpdateAttendanceRecordRequest): Promise<any | null> {
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
      
      await this.getCollection(AttendanceService.COLLECTION_NAME)
        .doc(id)
        .update(updateData);
      
      const updatedRecord = await this.getAttendanceRecordById(id);
      console.log('출석 기록 업데이트 완료:', id);
      return updatedRecord;
    } catch (error) {
      console.error('출석 기록 업데이트 오류:', error);
      throw error;
    }
  }

  /**
   * 출석 기록 삭제
   */
  async deleteAttendanceRecord(id: string): Promise<boolean> {
    try {
      console.log('출석 기록 삭제:', id);
      
      const docRef = this.getCollection(AttendanceService.COLLECTION_NAME).doc(id);
      await docRef.delete();
      
      console.log('출석 기록 삭제 완료:', id);
      return true;
    } catch (error) {
      console.error('출석 기록 삭제 오류:', error);
      throw error;
    }
  }

  /**
   * 학생별 출석 기록 조회
   */
  async getAttendanceByStudent(studentId: string, dateRange?: { start: string; end: string }): Promise<any[]> {
    try {
      console.log('학생별 출석 기록 조회:', studentId, dateRange);
      
      let query = this.getCollection(AttendanceService.COLLECTION_NAME)
        .where('studentId', '==', studentId) as any;
      
      if (dateRange) {
        query = query.where('date', '>=', dateRange.start)
                    .where('date', '<=', dateRange.end);
      }
      
      const snapshot = await query.get();
      const records: any[] = [];
      
      snapshot.forEach((doc: any) => {
        records.push(doc.data());
      });
      
      console.log('조회된 학생별 출석 기록 수:', records.length);
      return records;
    } catch (error) {
      console.error('학생별 출석 기록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 날짜별 출석 기록 조회
   */
  async getAttendanceByDate(date: string): Promise<any[]> {
    try {
      console.log('날짜별 출석 기록 조회:', date);
      
      const snapshot = await this.getCollection(AttendanceService.COLLECTION_NAME)
        .where('date', '==', date)
        .get();
      
      const records: any[] = [];
      
      snapshot.forEach((doc: any) => {
        records.push(doc.data());
      });
      
      console.log('조회된 날짜별 출석 기록 수:', records.length);
      return records;
    } catch (error) {
      console.error('날짜별 출석 기록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 출석 통계 조회
   */
  async getAttendanceStatistics(dateRange?: { start: string; end: string }): Promise<any> {
    try {
      console.log('출석 통계 조회:', dateRange);
      
      let query = this.getCollection(AttendanceService.COLLECTION_NAME) as any;
      
      if (dateRange) {
        query = query.where('date', '>=', dateRange.start)
                    .where('date', '<=', dateRange.end);
      }
      
      const snapshot = await query.get();
      const records: any[] = [];
      
      snapshot.forEach((doc: any) => {
        records.push(doc.data());
      });
      
      // 통계 계산
      const totalRecords = records.length;
      const statusCounts = records.reduce((acc: any, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      }, {});
      
      const stats = {
        totalRecords,
        statusCounts,
        averageAttendanceRate: this.calculateAttendanceRate(statusCounts),
        dateRange
      };
      
      console.log('출석 통계 계산 완료:', stats);
      return stats;
    } catch (error) {
      console.error('출석 통계 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 출석률 계산
   */
  private calculateAttendanceRate(statusCounts: any): number {
    const presentCount = statusCounts.present || 0;
    const totalCount = Object.values(statusCounts).reduce((sum: number, count: any) => sum + count, 0);
    
    if (totalCount === 0) return 0;
    return Math.round((presentCount / totalCount) * 100) / 100;
  }

  /**
   * ID 생성
   */


  // 일괄 출석 업데이트
  async bulkUpdateAttendance(records: any[]): Promise<any> {
    try {
      console.log('일괄 출석 업데이트:', records.length, '개 기록');
      
      const batch = this.db.batch();
      const results = {
        successCount: 0,
        errorCount: 0,
        errors: [] as any[]
      };
      
      for (const record of records) {
        try {
          const docRef = this.db.collection(AttendanceService.COLLECTION_NAME).doc(record.id);
          batch.update(docRef, {
            ...record,
            updatedAt: new Date().toISOString()
          });
          results.successCount++;
        } catch (error) {
          results.errorCount++;
          results.errors.push({
            recordId: record.id,
            error: error
          });
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

  async deleteAttendanceRecords(records: any[]): Promise<void> {
    try {
      console.log('출석 기록 일괄 삭제:', records.length, '개');
      
      const batch = this.db.batch();
      records.forEach((record: any) => {
        const docRef = this.getCollection(AttendanceService.COLLECTION_NAME).doc(record.id);
        batch.delete(docRef);
      });
      
      await batch.commit();
      console.log('출석 기록 일괄 삭제 완료');
    } catch (error) {
      console.error('출석 기록 일괄 삭제 오류:', error);
      throw error;
    }
  }
}
