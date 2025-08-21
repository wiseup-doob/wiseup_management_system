// Class 데이터 타입 어댑터 - 백엔드와 프론트엔드 간 데이터 변환
import type { 
  ClassSection, 
  CreateClassSectionRequest, 
  UpdateClassSectionRequest,
  ClassSchedule,
  DayOfWeek
} from '@shared/types';
import type { Class, ClassFormData } from '../features/class/types/class.types';

// ===== 백엔드 → 프론트엔드 변환 =====

/**
 * 백엔드 ClassSection 데이터를 프론트엔드 Class 데이터로 변환
 * @param classSection 백엔드 수업 데이터
 * @param course 강의 정보 (grade, classNumber 포함)
 * @param teacher 교사 정보 (name 포함)
 * @param classroom 강의실 정보 (name 포함)
 * @returns 프론트엔드 표시용 수업 데이터
 */
export function adaptClassSectionToClass(
  classSection: ClassSection,
  course: { grade: string; classNumber: string },
  teacher: { name: string },
  classroom: { name: string }
): Class {
  return {
    id: classSection.id,
    name: classSection.name,
    grade: course.grade,
    classNumber: course.classNumber,
    teacherName: teacher.name,
    maxStudents: classSection.maxStudents,
    currentStudents: classSection.currentStudents || 0,
    roomNumber: classroom.name,
    schedule: formatSchedule(classSection.schedule),
    status: classSection.status,
    startDate: formatDate(classSection.createdAt),
    endDate: classSection.updatedAt ? formatDate(classSection.updatedAt) : undefined,
    description: classSection.description
  };
}

/**
 * ClassSchedule 배열을 문자열 형태로 변환
 * @param schedules 수업 일정 배열
 * @returns "월,수,금 09:00-10:30" 형태의 문자열
 */
function formatSchedule(schedules: ClassSchedule[]): string {
  if (!schedules || schedules.length === 0) {
    return '일정 없음';
  }

  const dayNames: Record<DayOfWeek, string> = {
    monday: '월',
    tuesday: '화',
    wednesday: '수',
    thursday: '목',
    friday: '금',
    saturday: '토',
    sunday: '일'
  };

  const formattedSchedules = schedules.map(schedule => {
    const dayName = dayNames[schedule.dayOfWeek];
    return `${dayName} ${schedule.startTime}-${schedule.endTime}`;
  });

  return formattedSchedules.join(', ');
}

/**
 * Firestore Timestamp를 날짜 문자열로 변환
 * @param timestamp Firestore Timestamp
 * @returns "YYYY-MM-DD" 형태의 문자열
 */
function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  
  try {
    // Firestore Timestamp인 경우
    if (timestamp.toDate) {
      return timestamp.toDate().toISOString().split('T')[0];
    }
    
    // 일반 Date 객체인 경우
    if (timestamp instanceof Date) {
      return timestamp.toISOString().split('T')[0];
    }
    
    // 문자열인 경우 그대로 반환
    if (typeof timestamp === 'string') {
      return timestamp;
    }
    
    return '';
  } catch (error) {
    console.error('날짜 변환 오류:', error);
    return '';
  }
}

// ===== 프론트엔드 → 백엔드 변환 =====

/**
 * 프론트엔드 ClassFormData를 백엔드 CreateClassSectionRequest로 변환
 * @param classData 프론트엔드 수업 폼 데이터
 * @param courseId 강의 ID
 * @param teacherId 교사 ID
 * @param classroomId 강의실 ID
 * @returns 백엔드 수업 생성 요청 데이터
 */
export function adaptClassToCreateRequest(
  classData: ClassFormData,
  courseId: string,
  teacherId: string,
  classroomId: string
): CreateClassSectionRequest {
  return {
    name: classData.name,
    courseId,
    teacherId,
    classroomId,
    schedule: parseSchedule(classData.schedule),
    maxStudents: classData.maxStudents,
    description: classData.description,
    notes: classData.notes
  };
}

/**
 * 프론트엔드 Class 데이터를 백엔드 UpdateClassSectionRequest로 변환
 * @param classData 프론트엔드 수업 데이터
 * @param courseId 강의 ID
 * @param teacherId 교사 ID
 * @param classroomId 강의실 ID
 * @returns 백엔드 수업 수정 요청 데이터
 */
export function adaptClassToUpdateRequest(
  classData: Class,
  courseId: string,
  teacherId: string,
  classroomId: string
): UpdateClassSectionRequest {
  return {
    name: classData.name,
    courseId,
    teacherId,
    classroomId,
    schedule: parseSchedule(classData.schedule),
    maxStudents: classData.maxStudents,
    currentStudents: classData.currentStudents,
    status: classData.status,
    description: classData.description
  };
}

/**
 * 문자열 형태의 일정을 ClassSchedule 배열로 변환
 * @param scheduleString "월,수,금 09:00-10:30" 형태의 문자열
 * @returns ClassSchedule 배열
 */
function parseSchedule(scheduleString: string): ClassSchedule[] {
  if (!scheduleString || scheduleString === '일정 없음') {
    return [];
  }

  const dayNames: Record<string, DayOfWeek> = {
    '월': 'monday',
    '화': 'tuesday',
    '수': 'wednesday',
    '목': 'thursday',
    '금': 'friday',
    '토': 'saturday',
    '일': 'sunday'
  };

  const schedules: ClassSchedule[] = [];
  const scheduleItems = scheduleString.split(',').map(s => s.trim());

  scheduleItems.forEach((item, index) => {
    // "월 09:00-10:30" 형태에서 요일과 시간 추출
    const match = item.match(/^([월화수목금토일])\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    
    if (match) {
      const [, day, startTime, endTime] = match;
      const dayOfWeek = dayNames[day];
      
      if (dayOfWeek) {
        schedules.push({
          dayOfWeek,
          timeSlotId: `temp_${index}`, // 임시 ID, 실제로는 time_slots 컬렉션에서 조회 필요
          startTime,
          endTime
        });
      }
    }
  });

  return schedules;
}

// ===== 유틸리티 함수 =====

/**
 * 프론트엔드 Class 데이터가 유효한지 검증
 * @param classData 검증할 수업 데이터
 * @returns 유효성 검증 결과
 */
export function validateClassData(classData: Class): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!classData.name || classData.name.trim().length === 0) {
    errors.push('수업명은 필수입니다.');
  }

  if (!classData.grade || classData.grade.trim().length === 0) {
    errors.push('학년은 필수입니다.');
  }

  if (!classData.teacherName || classData.teacherName.trim().length === 0) {
    errors.push('담당 교사는 필수입니다.');
  }

  if (!classData.maxStudents || classData.maxStudents <= 0) {
    errors.push('최대 수강 인원은 1명 이상이어야 합니다.');
  }

  if (classData.currentStudents > classData.maxStudents) {
    errors.push('현재 수강 인원은 최대 수강 인원을 초과할 수 없습니다.');
  }

  if (!classData.roomNumber || classData.roomNumber.trim().length === 0) {
    errors.push('강의실은 필수입니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 프론트엔드 ClassFormData가 유효한지 검증
 * @param formData 검증할 폼 데이터
 * @returns 유효성 검증 결과
 */
export function validateClassFormData(formData: ClassFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!formData.name || formData.name.trim().length === 0) {
    errors.push('수업명은 필수입니다.');
  }

  if (!formData.grade || formData.grade.trim().length === 0) {
    errors.push('학년은 필수입니다.');
  }

  if (!formData.teacherName || formData.teacherName.trim().length === 0) {
    errors.push('담당 교사는 필수입니다.');
  }

  if (!formData.maxStudents || formData.maxStudents <= 0) {
    errors.push('최대 수강 인원은 1명 이상이어야 합니다.');
  }

  if (!formData.roomNumber || formData.roomNumber.trim().length === 0) {
    errors.push('강의실은 필수입니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
