import type { UUID } from '@shared/types';
import type { AttendanceStatus } from '@shared/types/common.types';

// 배정 데이터 생성 유틸리티
export const generateAssignmentData = {
  /**
   * 학생들을 좌석에 배정하는 데이터 생성
   */
  generateBulkAssignments(studentIds: UUID[], seatIds: string[]): any[] {
    const assignments = [];
    
    for (let i = 0; i < Math.min(studentIds.length, seatIds.length); i++) {
      const assignment = {
        id: `assignment_${Date.now()}_${i}`,
        seatId: seatIds[i],
        studentId: studentIds[i],
        assignedDate: new Date().toISOString().split('T')[0],
        assignedBy: 'system',
        status: 'present' as AttendanceStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      assignments.push(assignment);
    }
    
    return assignments;
  },

  /**
   * 특정 날짜의 배정 데이터 생성
   */
  generateDateAssignments(studentIds: UUID[], seatIds: string[], date: string): any[] {
    const assignments = [];
    
    for (let i = 0; i < Math.min(studentIds.length, seatIds.length); i++) {
      const assignment = {
        id: `assignment_${date}_${i}`,
        seatId: seatIds[i],
        studentId: studentIds[i],
        assignedDate: date,
        assignedBy: 'system',
        status: 'present' as AttendanceStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      assignments.push(assignment);
    }
    
    return assignments;
  },

  /**
   * 랜덤 배정 상태 생성
   */
  generateRandomStatus(): AttendanceStatus {
    const statuses: AttendanceStatus[] = ['present', 'dismissed', 'unauthorized_absent', 'authorized_absent'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  },

  /**
   * 배정 이력 데이터 생성
   */
  generateAssignmentHistory(studentIds: UUID[], seatIds: string[], days: number = 30): any[] {
    const history = [];
    const today = new Date();
    
    for (let day = 0; day < days; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - day);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAssignments = this.generateDateAssignments(studentIds, seatIds, dateStr);
      history.push(...dayAssignments);
    }
    
    return history;
  }
};
