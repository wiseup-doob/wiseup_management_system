// 통계 관리 서비스
import { BaseService } from '../base/BaseService';
import type { Student, AttendanceRecord } from '@shared/types';

export class StatisticsService extends BaseService {
  private static readonly STUDENTS_COLLECTION = 'students';
  private static readonly ATTENDANCE_COLLECTION = 'attendance_records';

  /**
   * 전체 출석 통계 조회
   */
  async getOverallStatistics(dateRange?: { start: string; end: string }): Promise<any> {
    try {
      console.log('전체 출석 통계 조회:', dateRange);
      
      // 학생 수 조회
      const studentsSnapshot = await this.getCollection(StatisticsService.STUDENTS_COLLECTION)
        .where('status', '==', 'active')
        .get();
      
      const totalStudents = studentsSnapshot.size;
      
      // 출석 기록 조회
      let attendanceQuery = this.getCollection(StatisticsService.ATTENDANCE_COLLECTION) as any;
      
      if (dateRange) {
        attendanceQuery = attendanceQuery.where('date', '>=', dateRange.start)
                                       .where('date', '<=', dateRange.end);
      }
      
      const attendanceSnapshot = await attendanceQuery.get();
      const attendanceRecords: any[] = [];
      
      attendanceSnapshot.forEach((doc: any) => {
        attendanceRecords.push(doc.data());
      });
      
      // 통계 계산
      const stats = this.calculateOverallStatistics(attendanceRecords, totalStudents);
      
      console.log('전체 출석 통계 계산 완료:', stats);
      return stats;
    } catch (error) {
      console.error('전체 출석 통계 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 클래스별 통계 조회
   */
  async getClassStatistics(className: string, dateRange?: { start: string; end: string }): Promise<any> {
    try {
      console.log('클래스별 통계 조회:', className, dateRange);
      
      // 해당 클래스 학생들 조회
      const studentsSnapshot = await this.getCollection(StatisticsService.STUDENTS_COLLECTION)
        .where('className', '==', className)
        .where('status', '==', 'active')
        .get();
      
      const students: Student[] = [];
      studentsSnapshot.forEach((doc: any) => {
        students.push(doc.data() as Student);
      });
      
      const studentIds = students.map(s => s.id);
      
      // 해당 학생들의 출석 기록 조회
      let attendanceQuery = this.getCollection(StatisticsService.ATTENDANCE_COLLECTION) as any;
      
      if (dateRange) {
        attendanceQuery = attendanceQuery.where('date', '>=', dateRange.start)
                                       .where('date', '<=', dateRange.end);
      }
      
      const attendanceSnapshot = await attendanceQuery.get();
      const attendanceRecords: any[] = [];
      
      attendanceSnapshot.forEach((doc: any) => {
        const record = doc.data();
        if (studentIds.includes(record.studentId)) {
          attendanceRecords.push(record);
        }
      });
      
      // 통계 계산
      const stats = this.calculateClassStatistics(attendanceRecords, students);
      
      console.log('클래스별 통계 계산 완료:', stats);
      return stats;
    } catch (error) {
      console.error('클래스별 통계 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 학생별 통계 조회
   */
  async getStudentStatistics(studentId: string, dateRange?: { start: string; end: string }): Promise<any> {
    try {
      console.log('학생별 통계 조회:', studentId, dateRange);
      
      // 학생 정보 조회
      const studentDoc = await this.getCollection(StatisticsService.STUDENTS_COLLECTION)
        .doc(studentId)
        .get();
      
      if (!studentDoc.exists) {
        throw new Error('학생을 찾을 수 없습니다.');
      }
      
      const student = studentDoc.data() as Student;
      
      // 학생의 출석 기록 조회
      let attendanceQuery = this.getCollection(StatisticsService.ATTENDANCE_COLLECTION)
        .where('studentId', '==', studentId) as any;
      
      if (dateRange) {
        attendanceQuery = attendanceQuery.where('date', '>=', dateRange.start)
                                       .where('date', '<=', dateRange.end);
      }
      
      const attendanceSnapshot = await attendanceQuery.get();
      const attendanceRecords: any[] = [];
      
      attendanceSnapshot.forEach((doc: any) => {
        attendanceRecords.push(doc.data());
      });
      
      // 통계 계산
      const stats = this.calculateStudentStatistics(attendanceRecords, student);
      
      console.log('학생별 통계 계산 완료:', stats);
      return stats;
    } catch (error) {
      console.error('학생별 통계 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 일별 통계 조회
   */
  async getDailyStatistics(date: string): Promise<any> {
    try {
      console.log('일별 통계 조회:', date);
      
      // 해당 날짜의 출석 기록 조회
      const attendanceSnapshot = await this.getCollection(StatisticsService.ATTENDANCE_COLLECTION)
        .where('date', '==', date)
        .get();
      
      const attendanceRecords: any[] = [];
      
      attendanceSnapshot.forEach((doc: any) => {
        attendanceRecords.push(doc.data());
      });
      
      // 전체 학생 수 조회
      const studentsSnapshot = await this.getCollection(StatisticsService.STUDENTS_COLLECTION)
        .where('status', '==', 'active')
        .get();
      
      const totalStudents = studentsSnapshot.size;
      
      // 통계 계산
      const stats = this.calculateDailyStatistics(attendanceRecords, totalStudents, date);
      
      console.log('일별 통계 계산 완료:', stats);
      return stats;
    } catch (error) {
      console.error('일별 통계 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 전체 통계 계산
   */
  private calculateOverallStatistics(records: AttendanceRecord[], totalStudents: number): any {
    const statusCounts = records.reduce((acc: any, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    const presentCount = statusCounts.present || 0;
    const totalRecords = records.length;
    const averageAttendanceRate = totalRecords > 0 ? presentCount / totalRecords : 0;

    return {
      totalStudents,
      totalRecords,
      averageAttendanceRate: Math.round(averageAttendanceRate * 100) / 100,
      statusCounts,
      averageCheckInTime: this.calculateAverageCheckInTime(records),
      averageCheckOutTime: this.calculateAverageCheckOutTime(records),
      lateCount: this.calculateLateCount(records),
      earlyLeaveCount: this.calculateEarlyLeaveCount(records)
    };
  }

  /**
   * 클래스별 통계 계산
   */
  private calculateClassStatistics(records: AttendanceRecord[], students: Student[]): any {
    const statusCounts = records.reduce((acc: any, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    const presentCount = statusCounts.present || 0;
    const totalRecords = records.length;
    const averageAttendanceRate = totalRecords > 0 ? presentCount / totalRecords : 0;

    return {
      className: students[0]?.className || '',
      totalStudents: students.length,
      totalRecords,
      averageAttendanceRate: Math.round(averageAttendanceRate * 100) / 100,
      statusCounts,
      students: students.map(s => ({ id: s.id, name: s.name }))
    };
  }

  /**
   * 학생별 통계 계산
   */
  private calculateStudentStatistics(records: AttendanceRecord[], student: Student): any {
    const statusCounts = records.reduce((acc: any, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    const presentCount = statusCounts.present || 0;
    const totalRecords = records.length;
    const averageAttendanceRate = totalRecords > 0 ? presentCount / totalRecords : 0;

    return {
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        className: student.className
      },
      totalRecords,
      averageAttendanceRate: Math.round(averageAttendanceRate * 100) / 100,
      statusCounts,
      averageCheckInTime: this.calculateAverageCheckInTime(records),
      averageCheckOutTime: this.calculateAverageCheckOutTime(records),
      lateCount: this.calculateLateCount(records),
      earlyLeaveCount: this.calculateEarlyLeaveCount(records)
    };
  }

  /**
   * 일별 통계 계산
   */
  private calculateDailyStatistics(records: AttendanceRecord[], totalStudents: number, date: string): any {
    const statusCounts = records.reduce((acc: any, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    const presentCount = statusCounts.present || 0;
    const attendanceRate = totalStudents > 0 ? presentCount / totalStudents : 0;

    return {
      date,
      totalStudents,
      presentCount,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      statusCounts,
      averageCheckInTime: this.calculateAverageCheckInTime(records),
      averageCheckOutTime: this.calculateAverageCheckOutTime(records),
      lateCount: this.calculateLateCount(records),
      earlyLeaveCount: this.calculateEarlyLeaveCount(records)
    };
  }

  /**
   * 평균 등원 시간 계산
   */
  private calculateAverageCheckInTime(records: AttendanceRecord[]): string {
    const validRecords = records.filter(r => r.checkInTime);
    
    if (validRecords.length === 0) return '09:00';
    
    const totalMinutes = validRecords.reduce((sum, record) => {
      const [hours, minutes] = record.checkInTime!.split(':').map(Number);
      return sum + hours * 60 + minutes;
    }, 0);
    
    const averageMinutes = Math.round(totalMinutes / validRecords.length);
    const hours = Math.floor(averageMinutes / 60);
    const minutes = averageMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * 평균 하원 시간 계산
   */
  private calculateAverageCheckOutTime(records: AttendanceRecord[]): string {
    const validRecords = records.filter(r => r.checkOutTime);
    
    if (validRecords.length === 0) return '17:00';
    
    const totalMinutes = validRecords.reduce((sum, record) => {
      const [hours, minutes] = record.checkOutTime!.split(':').map(Number);
      return sum + hours * 60 + minutes;
    }, 0);
    
    const averageMinutes = Math.round(totalMinutes / validRecords.length);
    const hours = Math.floor(averageMinutes / 60);
    const minutes = averageMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * 지각 횟수 계산
   */
  private calculateLateCount(records: AttendanceRecord[]): number {
    return records.filter(record => {
      if (!record.checkInTime) return false;
      const [hours, minutes] = record.checkInTime.split(':').map(Number);
      return hours > 9 || (hours === 9 && minutes > 15);
    }).length;
  }

  /**
   * 조퇴 횟수 계산
   */
  private calculateEarlyLeaveCount(records: AttendanceRecord[]): number {
    return records.filter(record => {
      if (!record.checkOutTime) return false;
      const [hours] = record.checkOutTime.split(':').map(Number);
      return hours < 16;
    }).length;
  }
}
