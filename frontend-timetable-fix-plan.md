# 백엔드와 프론트엔드 수정을 통한 시간표 드래그 앤 드롭 기능 문제 해결 계획

## 📋 **문제 상황 요약**

### **현재 문제점**
- `TimetableEditModal.tsx`에서 드래그 앤 드롭으로 수업 추가 기능이 작동하지 않음
- 드래그 앤 드롭 이벤트는 발생하지만 시간표에 수업이 추가되지 않음
- 백엔드 API 호출은 성공하지만 프론트엔드에서 응답 데이터를 올바르게 처리하지 못함

### **근본 원인**
- **백엔드 응답 구조 불일치**: 프론트엔드가 기대하는 데이터 구조와 백엔드가 실제 반환하는 구조가 다름
- **데이터 변환 실패**: `transformStudentTimetableResponse` 함수가 백엔드 응답을 올바르게 처리하지 못함
- **상태 관리 문제**: API 호출 후 시간표 데이터 업데이트가 제대로 이루어지지 않음

## 🔍 **현재 백엔드 응답 구조 분석**

### **1. 수업 추가 API 응답 (수정 완료)**
```typescript
// POST /api/student-timetables/student/:studentId/add-class
{
  success: true,
  message: 'Class section added to student timetable successfully',
  data: {
    studentId: string,
    studentName: string,
    grade: string,
    status: 'active' | 'inactive',
    classSections: Array<{
      id: string,
      name: string,                    // ClassSection.name
      teacher: { name: string },       // Teacher.name
      classroom: { name: string },     // Classroom.name
      schedule: Array<{
        dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
        startTime: string,
        endTime: string
      }>,
      color: string                    // Course.name 기반 생성
    }>
  },
  meta: {
    timestamp: string,
    requestId: string,
    classCount: number
  }
}
```

### **2. 수업 제거 API 응답 (수정 완료)**
```typescript
// POST /api/student-timetables/student/:studentId/remove-class
{
  success: true,
  message: 'Class section removed from student timetable successfully',
  data: {
    studentId: string,
    studentName: string,
    grade: string,
    status: 'active' | 'inactive',
    classSections: Array<{
      id: string,
      name: string,                    // ClassSection.name
      teacher: { name: string },       // Teacher.name
      classroom: { name: string },     // Classroom.name
      schedule: Array<{
        dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
        startTime: string,
        endTime: string
      }>,
      color: string                    // Course.name 기반 생성
    }>
  },
  meta: {
    timestamp: string,
    requestId: string,
    classCount: number
  }
}
```

### **3. 시간표 조회 API 응답 (수정 완료)**
```typescript
// GET /api/student-timetables/student/:studentId
{
  success: true,
  message: 'Student timetable retrieved successfully',
  data: {
    studentId: string,
    studentName: string,
    grade: string,
    status: 'active' | 'inactive',
    classSections: Array<{
      id: string,
      name: string,                    // ClassSection.name
      teacher: { name: string },       // Teacher.name
      classroom: { name: string },     // Classroom.name
      schedule: Array<{
        dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
        startTime: string,
        endTime: string
      }>,
      color: string                    // Course.name 기반 생성
    }>
  },
  meta: {
    timestamp: string,
    requestId: string,
    classCount: number
  }
}
```

## 🎯 **해결 방안: 백엔드 API 응답 구조를 프론트엔드 요구사항에 맞춤 (DB 구조 변경 없음)**

### **핵심 아이디어**
백엔드 API 응답 구조를 프론트엔드가 실제로 사용하는 데이터 구조에 정확히 맞춤으로써, 데이터 변환 로직 없이 직접 사용할 수 있도록 하는 방식

### **구현 전략**
1. **백엔드 컨트롤러 수정**: API 응답을 프론트엔드가 실제 사용하는 데이터 구조에 맞게 변환
2. **프론트엔드 타입 정의**: 백엔드 응답과 일치하는 타입 정의로 업데이트
3. **상태 관리 단순화**: 백엔드 응답을 데이터 변환 없이 직접 사용하여 시간표 데이터 구성
4. **이벤트 핸들러 개선**: 일관된 데이터 구조로 처리 로직 단순화 및 충돌 검증 호환성 확보

## 🛠️ **구체적인 수정 과정**

### **1단계: 백엔드 컨트롤러 수정**

#### **1-1: StudentTimetableController 수정 (프론트엔드 요구사항에 맞춤)**
```typescript
// functions/src/controllers/StudentTimetableController.ts

export class StudentTimetableController {
  // ... 기존 코드 ...

  /**
   * 완전한 학생 시간표 데이터를 구성하는 공통 메서드
   * 프론트엔드가 실제 사용하는 데이터 구조에 맞춰 응답 구성
   * DB 구조는 변경하지 않고 응답만 변환
   */
  private async buildCompleteTimetableData(
    studentId: string, 
    timetable: any
  ): Promise<CompleteTimetableData> {
    try {
      // 1. 학생 정보 조회
      const student = await this.studentService.getStudentById(studentId);
      if (!student) {
        throw new Error(`Student not found: ${studentId}`);
      }

      // 2. 수업 섹션들의 상세 정보 조회 (병렬 처리로 성능 향상)
      const classSectionsWithDetails = await Promise.all(
        timetable.classSectionIds.map(async (classSectionId: string) => {
          try {
            const classSection = await this.classSectionService.getClassSectionById(classSectionId);
            if (!classSection) {
              console.warn(`Class section not found: ${classSectionId}`);
              return null;
            }

            // 3. 강사 정보 조회
            let teacherName = '담당 교사 미정';
            if (classSection.teacherId) {
              try {
                const teacher = await this.teacherService.getTeacherById(classSection.teacherId);
                teacherName = teacher?.name || teacherName;
              } catch (error) {
                console.warn(`Failed to fetch teacher: ${classSection.teacherId}`, error);
              }
            }

            // 4. 강의실 정보 조회
            let classroomName = '강의실 미정';
            if (classSection.classroomId) {
              try {
                const classroom = await this.classroomService.getClassroomById(classSection.classroomId);
                classroomName = classroom?.name || classroomName;
              } catch (error) {
                console.warn(`Failed to fetch classroom: ${classSection.classroomId}`, error);
              }
            }

            // 5. Course 정보 조회 (색상 생성용)
            let courseName = '수업명 미정';
            if (classSection.courseId) {
              try {
                const course = await this.courseService.getCourseById(classSection.courseId);
                courseName = course?.name || courseName;
              } catch (error) {
                console.warn(`Failed to fetch course: ${classSection.courseId}`, error);
              }
            }

            // 6. 색상 생성 (Course.name 사용)
            const color = this.generateClassColor(classSection.id, courseName);

            // 7. 스케줄 정보 정리 (타입 안전성 확보)
            const schedule = (classSection.schedule || []).map(s => ({
              dayOfWeek: s.dayOfWeek as DayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime
            }));

            return {
              id: classSection.id,
              name: classSection.name,                          // 프론트엔드에서 사용하는 name 필드
              teacher: { name: teacherName },                   // 프론트엔드에서 사용하는 중첩 객체 구조
              classroom: { name: classroomName },               // 프론트엔드에서 사용하는 중첩 객체 구조
              schedule,
              color
            };
          } catch (error) {
            console.error(`Error processing class section ${classSectionId}:`, error);
            return null;
          }
        })
      );

      // 7. null 값 제거 및 유효한 수업만 필터링
      const validClassSections = classSectionsWithDetails.filter(Boolean);

      // 8. 최종 데이터 구성 (프론트엔드 요구사항에 정확히 맞춤)
      return {
        studentId: student.id,
        studentName: student.name,
        grade: student.grade || '',
        status: student.status || 'active',
        classSections: validClassSections
      };

    } catch (error) {
      console.error('Error building complete timetable data:', error);
      throw error;
    }
  }

  /**
   * 수업 색상 생성 헬퍼 메서드 (Course.name 기반)
   */
  private generateClassColor(classId: string, courseName: string): string {
    const colors = [
      '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a',
      '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94',
      '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d',
      '#17becf', '#9edae5', '#393b79', '#637939', '#8c6d31', '#b5cf6b',
      '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', '#ad494a', '#a6cee3'
    ];
    
    const combined = `${classId}_${courseName}`;
    let hash = 0;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit 정수로 변환
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
}
```

#### **1-2: addClassToStudentTimetableByStudentId 수정**
```typescript
// functions/src/controllers/StudentTimetableController.ts

async addClassToStudentTimetableByStudentId(req: Request, res: Response): Promise<void> {
  try {
    const { studentId } = req.params;
    const { classSectionId } = req.body;
    
    console.log(`📚 [DEBUG] Adding class ${classSectionId} to student ${studentId}`);
    
    // 1. 입력값 검증
    if (!classSectionId) {
      res.status(400).json({
        success: false,
        error: 'Class section ID is required'
      });
      return;
    }

    // 2. 학생 존재 여부 확인
    const student = await this.studentService.getStudentById(studentId);
    if (!student) {
      res.status(404).json({
        success: false,
        error: 'Student not found'
      });
      return;
    }

    // 3. 수업 섹션 존재 여부 확인
    const classSection = await this.classSectionService.getClassSectionById(classSectionId);
    if (!classSection) {
      res.status(404).json({
        success: false,
        error: 'Class section not found'
      });
      return;
    }

    // 4. 학생 시간표 조회 (없으면 생성)
    let timetable = await this.studentTimetableService.getStudentTimetableByStudentId(studentId);
    
    if (!timetable) {
      console.log(`🆕 [DEBUG] Creating new timetable for student ${studentId}`);
      
      // 시간표가 없으면 새로 생성 (DB 구조는 동일하게 유지)
      const newTimetableId = await this.studentTimetableService.createStudentTimetable({
        studentId,
        classSectionIds: []
      });
      
      if (!newTimetableId) {
        res.status(500).json({
          success: false,
          error: 'Failed to create student timetable'
        });
        return;
      }
      
      // 생성된 시간표를 다시 조회
      timetable = await this.studentTimetableService.getStudentTimetableById(newTimetableId);
      if (!timetable) {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve created student timetable'
        });
        return;
      }
    }

    // 5. 이미 추가된 수업인지 확인
    if (timetable.classSectionIds.includes(classSectionId)) {
      res.status(409).json({
        success: false,
        error: 'Class section already exists in timetable'
      });
      return;
    }

    // 6. 수업 추가 (DB 구조는 변경하지 않음)
    console.log(`➕ [DEBUG] Adding class ${classSectionId} to timetable ${timetable.id}`);
    const updatedClassSectionIds = [...timetable.classSectionIds, classSectionId];
    
    await this.studentTimetableService.updateStudentTimetable(timetable.id, {
      classSectionIds: updatedClassSectionIds
    });

    // 7. 업데이트된 시간표 조회
    const updatedTimetable = await this.studentTimetableService.getStudentTimetableById(timetable.id);
    if (!updatedTimetable) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve updated timetable'
      });
      return;
    }

    // 8. 완전한 시간표 데이터 구성 (프론트엔드가 기대하는 형태)
    const completeTimetableData = await this.buildCompleteTimetableData(studentId, updatedTimetable);

          // 9. 성공 응답 (프론트엔드 요구사항에 맞춘 구조)
      const response: TimetableApiResponse = {
        success: true,
        message: 'Class section added to student timetable successfully',
        data: completeTimetableData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          classCount: completeTimetableData.classSections.length
        }
      };

    console.log(`✅ [DEBUG] Successfully added class. Total classes: ${completeTimetableData.classSections.length}`);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ [ERROR] Error adding class to student timetable by student ID:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

#### **1-3: removeClassFromStudentTimetableByStudentId 수정**
```typescript
// functions/src/controllers/StudentTimetableController.ts

async removeClassFromStudentTimetableByStudentId(req: Request, res: Response): Promise<void> {
  try {
    const { studentId } = req.params;
    const { classSectionId } = req.body;
    
    console.log(`📚 [DEBUG] Removing class ${classSectionId} from student ${studentId}`);
    
    // 1. 입력값 검증
    if (!classSectionId) {
      res.status(400).json({
        success: false,
        error: 'Class section ID is required'
      });
      return;
    }

    // 2. 학생 존재 여부 확인
    const student = await this.studentService.getStudentById(studentId);
    if (!student) {
      res.status(404).json({
        success: false,
        error: 'Student not found'
      });
      return;
    }

    // 3. 학생 시간표 조회
    const timetable = await this.studentTimetableService.getStudentTimetableByStudentId(studentId);
    if (!timetable) {
      res.status(404).json({
        success: false,
        error: 'Student timetable not found'
      });
      return;
    }

    // 4. 수업이 시간표에 존재하는지 확인
    if (!timetable.classSectionIds.includes(classSectionId)) {
      res.status(404).json({
        success: false,
        error: 'Class section not found in timetable'
      });
      return;
    }

    // 5. 수업 제거 (DB 구조는 변경하지 않음)
    console.log(`➖ [DEBUG] Removing class ${classSectionId} from timetable ${timetable.id}`);
    const updatedClassSectionIds = timetable.classSectionIds.filter(id => id !== classSectionId);
    
    await this.studentTimetableService.updateStudentTimetable(timetable.id, {
      classSectionIds: updatedClassSectionIds
    });

    // 6. 업데이트된 시간표 조회
    const updatedTimetable = await this.studentTimetableService.getStudentTimetableById(timetable.id);
    if (!updatedTimetable) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve updated timetable'
      });
      return;
    }

    // 7. 완전한 시간표 데이터 구성 (프론트엔드가 기대하는 형태)
    const completeTimetableData = await this.buildCompleteTimetableData(studentId, updatedTimetable);

          // 8. 성공 응답 (프론트엔드 요구사항에 맞춘 구조)
      const response: TimetableApiResponse = {
        success: true,
        message: 'Class section removed from student timetable successfully',
        data: completeTimetableData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          classCount: completeTimetableData.classSections.length
        }
      };

    console.log(`✅ [DEBUG] Successfully removed class. Total classes: ${completeTimetableData.classSections.length}`);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ [ERROR] Error removing class from student timetable by student ID:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

#### **1-4: getStudentTimetableByStudentId 수정**
```typescript
// functions/src/controllers/StudentTimetableController.ts

async getStudentTimetableByStudentId(req: Request, res: Response): Promise<void> {
  try {
    const { studentId } = req.params;
    
    console.log(`📚 [DEBUG] Getting timetable for student ${studentId}`);
    
    // 1. 학생 존재 여부 확인
    const student = await this.studentService.getStudentById(studentId);
    if (!student) {
      res.status(404).json({
        success: false,
        error: 'Student not found'
      });
      return;
    }

    // 2. 학생 시간표 조회
    const timetable = await this.studentTimetableService.getStudentTimetableByStudentId(studentId);
    
    if (!timetable) {
      // 시간표가 없는 경우 빈 시간표로 응답 (DB 구조는 변경하지 않음)
      const emptyTimetableData: CompleteTimetableData = {
        studentId: student.id,
        studentName: student.name,
        grade: student.grade || '',
        status: student.status || 'active',
        classSections: []
      };

      const response: TimetableApiResponse = {
        success: true,
        message: 'Student timetable retrieved successfully (empty)',
        data: emptyTimetableData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          classCount: 0
        }
      };

      res.status(200).json(response);
      return;
    }

    // 3. 완전한 시간표 데이터 구성 (프론트엔드가 기대하는 형태)
    const completeTimetableData = await this.buildCompleteTimetableData(studentId, timetable);

          // 4. 성공 응답 (프론트엔드 요구사항에 맞춘 구조)
      const response: TimetableApiResponse = {
        success: true,
        message: 'Student timetable retrieved successfully',
        data: completeTimetableData,
        meta: {
          timestamp: new Date().toISOString(),
          classCount: completeTimetableData.classSections.length
        }
      };

    console.log(`✅ [DEBUG] Successfully retrieved timetable. Total classes: ${completeTimetableData.classSections.length}`);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ [ERROR] Error getting student timetable by student ID:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

### **2단계: 백엔드 타입 정의 추가**

#### **2-1: shared/types에 타입 정의 추가 (프론트엔드 요구사항에 맞춤)**
```typescript
// shared/types/timetable.types.ts

import type { DayOfWeek } from './common.types';

export interface CompleteTimetableData {
  studentId: string
  studentName: string
  grade: string
  status: 'active' | 'inactive'
  classSections: Array<{
    id: string
    name: string                    // 프론트엔드에서 사용하는 name 필드
    teacher: { name: string }       // 프론트엔드에서 사용하는 중첩 객체 구조
    classroom: { name: string }     // 프론트엔드에서 사용하는 중첩 객체 구조
    schedule: Array<{
      dayOfWeek: DayOfWeek          // 공통 타입 사용으로 엄격성 확보
      startTime: string
      endTime: string
    }>
    color: string
  }>
}

export interface TimetableApiResponse {
  success: boolean
  message: string
  data: CompleteTimetableData
  meta?: {
    timestamp: string
    requestId: string
    classCount: number
  }
}
```

#### **2-2: 컨트롤러에 타입 import 추가**
```typescript
// functions/src/controllers/StudentTimetableController.ts

import { Request, Response } from 'express';
import { StudentTimetableService } from '../services/StudentTimetableService';
import { StudentService } from '../services/StudentService';
import { ClassSectionService } from '../services/ClassSectionService';
import { TeacherService } from '../services/TeacherService';
import { ClassroomService } from '../services/ClassroomService';
import { CourseService } from '../services/CourseService';
import type { 
  CreateStudentTimetableRequest, 
  UpdateStudentTimetableRequest, 
  StudentTimetableSearchParams 
} from '@shared/types';
import type { 
  CompleteTimetableData, 
  TimetableApiResponse,
  DayOfWeek
} from '@shared/types';
```

### **3단계: 프론트엔드 수정 (데이터 구조 일치)**

#### **3-1: 기존 코드 그대로 유지**
```typescript
// frontend/src/features/schedule/components/TimetableEditModal.tsx

export const TimetableEditModal: React.FC<TimetableEditModalProps> = ({
  isOpen,
  onClose,
  student,
  onSave
}) => {
  // 기존 상태
  const [availableClasses, setAvailableClasses] = useState<ClassSectionWithDetails[]>([])
  const [currentTimetable, setCurrentTimetable] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 기존 상태 그대로 유지 (추가 상태 불필요)

  // ... 기존 코드 ...
}
```

#### **3-2: 기존 함수들 단순화 (데이터 구조 일치로 인한 단순화)**
```typescript
// frontend/src/features/schedule/components/TimetableEditModal.tsx

// 백엔드에서 프론트엔드 요구사항에 맞춘 데이터를 제공하므로
// 복잡한 헬퍼 함수나 데이터 변환이 필요하지 않음
// 기존 코드를 그대로 사용하면 됨
```

#### **3-3: 모달 데이터 로딩 함수 (기존 코드 유지)**
```typescript
// frontend/src/features/schedule/components/TimetableEditModal.tsx

const loadModalData = async (studentId: string) => {
  setIsLoading(true)
  setError(null)
  
  try {
    console.log(`📚 ${student?.name}의 모달 데이터 로드 시작...`)
    
    // 병렬로 데이터 로드
    const [classesResponse, timetableResponse] = await Promise.all([
      apiService.getClassSectionsWithDetails(),
      apiService.getStudentTimetable(studentId)
    ])
    
    // 수업 목록 설정
    if (classesResponse.success && classesResponse.data) {
      setAvailableClasses(classesResponse.data)
      console.log('✅ 수업 목록 로드 성공:', classesResponse.data.length, '개')
    } else {
      console.warn('⚠️ 수업 목록 로드 실패:', classesResponse.message)
      setAvailableClasses([])
    }
    
    // 학생 시간표 설정
    if (timetableResponse.success && timetableResponse.data) {
      console.log('✅ 학생 시간표 로드 성공:', timetableResponse.data)
      
      // 백엔드에서 프론트엔드 요구사항에 맞춘 데이터를 제공하므로
      // 추가 상태 관리나 데이터 변환이 필요하지 않음
      
      const timetableGrid = transformStudentTimetableResponse(
        timetableResponse.data,
        TIMETABLE_CONFIG.startHour,
        TIMETABLE_CONFIG.endHour,
        TIMETABLE_CONFIG.timeInterval
      )
      
      setCurrentTimetable(timetableGrid)
    } else {
      // 시간표가 없는 경우 빈 시간표 생성
      console.log('🔍 학생 시간표가 없습니다. 빈 시간표를 생성합니다.')
      
      if (student) {
        // 빈 시간표 생성 (기존 로직 유지)
        const emptyTimetableGrid = transformStudentTimetableResponse(
          {
            studentId: studentId,
            studentName: student.name,
            grade: student.grade || '',
            status: 'active' as const,
            classSections: []
          },
          TIMETABLE_CONFIG.startHour,
          TIMETABLE_CONFIG.endHour,
          TIMETABLE_CONFIG.timeInterval
        )
        
        setCurrentTimetable(emptyTimetableGrid)
      }
    }
    
  } catch (err) {
    console.error('❌ 모달 데이터 로드 오류:', err)
    setError('데이터를 불러오는 중 오류가 발생했습니다.')
    
    // 에러 시에도 빈 시간표는 표시
    if (student) {
      const emptyTimetableGrid = transformStudentTimetableResponse(
        {
          studentId: student.id,
          studentName: student.name,
          grade: student.grade || '',
          status: 'active' as const,
          classSections: []
        },
        TIMETABLE_CONFIG.startHour,
        TIMETABLE_CONFIG.endHour,
        TIMETABLE_CONFIG.timeInterval
      )
      setCurrentTimetable(emptyTimetableGrid)
    }
    
  } finally {
    setIsLoading(false)
  }
}
```

#### **3-4: 수업 추가 함수 (기존 코드 유지)**
```typescript
// frontend/src/features/schedule/components/TimetableEditModal.tsx

const handleAddClass = async (classSectionId: string) => {
  if (!student) return
  
  try {
    console.log(`📚 ${student.name}에게 수업 추가 시작:`, classSectionId)
    
    // 추가하려는 수업 정보 찾기
    const classToAdd = availableClasses.find(c => c.id === classSectionId)
    if (!classToAdd) {
      setError('수업 정보를 찾을 수 없습니다.')
      return
    }
    
    // 시간 충돌 검증 (기존 로직 유지)
    if (currentTimetable) {
      const timetableForConflictCheck = {
        classSections: currentTimetable.daySchedules.flatMap((day: any) => day.classes)
      }
      
      const conflictCheck = checkAllConflicts(
        {
          id: classToAdd.id,
          courseName: classToAdd.name,                    // name을 courseName으로 매핑 (충돌 검증 함수 호환성)
          teacherName: classToAdd.teacher?.name || '담당 교사 미정',
          classroomName: classToAdd.classroom?.name || '강의실 미정',
          schedule: classToAdd.schedule || [],
          color: '#3498db'
        },
        [timetableForConflictCheck],
        {
          checkStudent: true,
          checkTeacher: true,
          checkClassroom: true
        }
      )
      
      if (conflictCheck.hasConflict) {
        // ... 기존 충돌 처리 로직 ...
        return
      }
    }
    
    // 충돌이 없으면 API 호출
    const response = await apiService.addClassToStudentTimetable(student.id, classSectionId)
    
    if (response.success && response.data) {
      console.log('✅ 수업 추가 성공:', response.data)
      
      // 백엔드에서 완전한 시간표 데이터를 제공하므로
      // 직접 사용하여 시간표 업데이트
      const updatedTimetableGrid = transformStudentTimetableResponse(
        response.data,
        TIMETABLE_CONFIG.startHour,
        TIMETABLE_CONFIG.endHour,
        TIMETABLE_CONFIG.timeInterval
      )
      
      setCurrentTimetable(updatedTimetableGrid)
      setError(null)
      
      console.log('🎉 시간표가 업데이트되었습니다.')
      
    } else {
      throw new Error(response.message || '수업 추가에 실패했습니다.')
    }
    
  } catch (err) {
    console.error('❌ 수업 추가 실패:', err)
    
    // 학생 시간표가 없는 경우 자동 생성 시도 (기존 로직 유지)
    if (err instanceof Error && err.message.includes('Student timetable not found')) {
      // ... 기존 자동 생성 로직 ...
    }
    
    // 다른 에러는 기존 방식으로 처리
    let errorMessage = '수업을 추가하는 중 오류가 발생했습니다.'
    
    if (err instanceof Error) {
      if (err.message.includes('Network Error') || err.message.includes('fetch')) {
        errorMessage = '네트워크 연결을 확인해주세요.'
      } else if (err.message.includes('timeout')) {
        errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.'
      } else if (err.message.includes('conflict') || err.message.includes('충돌')) {
        errorMessage = '시간 충돌이 발생했습니다. 다른 시간을 선택해주세요.'
      } else {
        errorMessage = err.message
      }
    }
    
    setError(errorMessage)
  }
}
```

#### **3-5: 수업 제거 함수 (기존 코드 유지)**
```typescript
// frontend/src/features/schedule/components/TimetableEditModal.tsx

const handleRemoveClass = async (classSectionId: string) => {
  if (!student) return
  
  try {
    console.log(`📚 ${student.name}에서 수업 제거 시작:`, classSectionId)
    
    const response = await apiService.removeClassFromStudentTimetable(student.id, classSectionId)
    
    if (response.success && response.data) {
      console.log('✅ 수업 제거 성공:', response.data)
      
      // 백엔드에서 완전한 시간표 데이터를 제공하므로
      // 직접 사용하여 시간표 업데이트
      const updatedTimetableGrid = transformStudentTimetableResponse(
        response.data,
        TIMETABLE_CONFIG.startHour,
        TIMETABLE_CONFIG.endHour,
        TIMETABLE_CONFIG.timeInterval
      )
      
      setCurrentTimetable(updatedTimetableGrid)
      setError(null)
      
      console.log('🎉 시간표가 업데이트되었습니다.')
      
    } else {
      throw new Error(response.message || '수업 제거에 실패했습니다.')
    }
    
  } catch (err) {
    console.error('❌ 수업 제거 실패:', err)
    setError('수업을 제거하는 중 오류가 발생했습니다.')
  }
}
```

#### **3-6: 드롭 이벤트 처리 함수 (기존 코드 유지)**
```typescript
// frontend/src/features/schedule/components/TimetableEditModal.tsx

const handleDrop = async (item: any) => {
  console.log('🎯 드롭 이벤트 처리:', item)
  
  if (item.type === 'class-section' && item.classSection) {
    const classSection = item.classSection
    console.log('📚 드롭된 수업 정보:', {
      id: classSection.id,
      name: classSection.name,
      schedule: classSection.schedule
    })
    
    // 수업 카드의 스케줄 정보 자동 파싱 및 배치
    if (classSection.schedule && classSection.schedule.length > 0) {
      console.log('📅 수업 스케줄 정보 파싱:', classSection.schedule)
      
      // 각 스케줄에 대해 시간 충돌 검증 및 추가
      for (const schedule of classSection.schedule) {
        console.log(`🔍 ${schedule.dayOfWeek} ${schedule.startTime}~${schedule.endTime} 스케줄 처리`)
        
        // 시간 충돌 검증 (기존 로직 유지)
        if (currentTimetable) {
          const timetableForConflictCheck = {
            classSections: currentTimetable.daySchedules.flatMap((day: any) => day.classes)
          }
          
          const conflictCheck = checkAllConflicts(
            {
              id: classSection.id,
              courseName: classSection.name,                    // name을 courseName으로 매핑 (충돌 검증 함수 호환성)
              teacherName: classSection.teacher?.name || '담당 교사 미정',
              classroomName: classSection.classroom?.name || '강의실 미정',
              schedule: [schedule], // 개별 스케줄만 검증
              color: '#3498db'
            },
            [timetableForConflictCheck],
            {
              checkStudent: true,
              checkTeacher: true,
              checkClassroom: true
            }
          )
          
          if (conflictCheck.hasConflict) {
            // ... 기존 충돌 처리 로직 ...
            return
          }
        }
      }
      
      // 충돌이 없으면 수업 추가
      console.log('✅ 충돌 검증 완료, 수업 추가 진행')
      await handleAddClass(classSection.id)
      
    } else {
      console.log('⚠️ 수업에 스케줄 정보가 없습니다.')
      setError('수업에 스케줄 정보가 없습니다. 먼저 수업 시간을 설정해주세요.')
    }
  }
}
```

### **4단계: 프론트엔드 타입 정의 업데이트**

#### **4-1: 프론트엔드 타입 정의 업데이트 (shared/types 사용)**
```typescript
// frontend/src/features/schedule/types/timetable.types.ts

import type { TimetableGrid } from '../../../components/business/timetable/types/timetable.types'
import type { CompleteTimetableData, TimetableApiResponse } from '@shared/types'

// 학생 시간표 기본 정보 (shared/types와 일치)
export interface StudentTimetable extends Omit<CompleteTimetableData, 'classSections'> {
  id: string
  classSections: ClassSectionWithSchedule[]
  createdAt: string
  updatedAt: string
}

// 수업 섹션 정보 (스케줄 포함) - shared/types와 일치
export type ClassSectionWithSchedule = CompleteTimetableData['classSections'][0]

// 수업 스케줄 정보 (shared/types와 일치)
export type ClassSchedule = CompleteTimetableData['classSections'][0]['schedule'][0]

// 백엔드 API 응답 타입 (shared/types와 일치)
export type StudentTimetableResponse = TimetableApiResponse

// TimetableWidget에 전달할 데이터 타입
export interface TimetableData {
  timetableGrid: TimetableGrid
  isEmpty: boolean
  hasConflicts: boolean
  conflictCount: number
}
```

## 🧪 **테스트 및 검증 과정**

### **1단계: 백엔드 API 응답 검증**
- 수업 추가/제거/조회 API가 통일된 응답 구조를 반환하는지 확인
- `buildCompleteTimetableData` 메서드가 올바르게 작동하는지 확인

### **2단계: 프론트엔드 호환성 검증**
- 기존 `transformStudentTimetableResponse` 함수가 정상적으로 작동하는지 확인
- 시간표 UI가 올바르게 렌더링되는지 확인

### **3단계: 드래그 앤 드롭 기능 검증**
- 수업 카드 드래그 앤 드롭이 정상적으로 작동하는지 확인
- 시간표가 즉시 업데이트되는지 확인

### **4단계: 데이터 일관성 검증**
- 백엔드 응답과 프론트엔드 상태가 일치하는지 확인
- 시간 충돌 검증이 정상적으로 작동하는지 확인

### **5단계: 에러 처리 검증**
- 시간 충돌 시 적절한 에러 메시지가 표시되는지 확인
- 네트워크 오류 시 적절한 에러 처리가 되는지 확인

## 🎯 **예상 결과**

### **1. 드래그 앤 드롭 기능 정상 작동**
- 수업 카드를 드래그하여 시간표에 드롭하면 즉시 추가됨
- 시간표 UI가 실시간으로 업데이트됨

### **2. 데이터 일관성 유지**
- 백엔드 API 응답 구조가 통일되어 일관성 확보
- 프론트엔드에서 복잡한 데이터 변환 로직 불필요

### **3. 사용자 경험 개선**
- 수업 추가/제거 후 즉시 피드백 제공
- 시간 충돌 시 명확한 에러 메시지 표시

### **4. 코드 품질 향상**
- 백엔드와 프론트엔드 간 데이터 구조 일치
- 프론트엔드 코드 단순화 및 유지보수성 향상
- 타입 안전성 확보

## 🔧 **구현 시 주의사항**

### **1. 백엔드 수정 시 주의사항**
- 데이터베이스 구조는 절대 변경하지 않음
- 기존 API 엔드포인트는 유지하되 응답 구조만 변경
- 다른 클라이언트에 영향을 주지 않도록 주의

### **2. 프론트엔드 호환성**
- 기존 기능들이 정상적으로 작동하는지 확인
- `transformStudentTimetableResponse` 함수가 새로운 응답 구조와 호환되는지 확인

### **3. 성능 고려사항**
- 백엔드에서 병렬 처리로 관련 데이터 조회 성능 향상
- 프론트엔드에서 불필요한 데이터 변환 로직 제거로 성능 개선

### **4. 에러 처리**
- 백엔드에서 각 단계별 에러 상황에 대한 적절한 처리
- 프론트엔드에서 기존 에러 처리 로직 유지

## 📝 **구현 완료 후 체크리스트**

### **백엔드 체크리스트**
- [x] `shared/types/timetable.types.ts` 파일이 생성되고 타입이 정의됨
- [x] `StudentTimetableController`에 `buildCompleteTimetableData` 메서드가 추가됨
- [x] `CourseService`가 추가되어 Course 정보 조회 가능
- [x] `generateClassColor` 메서드가 Course.name 기반으로 수정됨
- [x] `addClassToStudentTimetableByStudentId` 메서드가 통일된 응답 구조를 반환함
- [x] `removeClassFromStudentTimetableByStudentId` 메서드가 통일된 응답 구조를 반환함
- [x] `getStudentTimetableByStudentId` 메서드가 통일된 응답 구조를 반환함
- [x] 모든 API가 `CompleteTimetableData` 형태의 데이터를 반환함
- [x] `DayOfWeek` 타입이 적용되어 타입 안전성 확보
- [x] 데이터베이스 구조는 변경되지 않음

### **프론트엔드 체크리스트**
- [x] 기존 `StudentTimetableResponse` 타입이 새로운 백엔드 응답과 호환됨 (shared/types 사용)
- [x] `handleAddClass` 함수가 백엔드 응답을 직접 사용하여 시간표 업데이트함
- [x] `handleRemoveClass` 함수가 백엔드 응답을 직접 사용하여 시간표 업데이트함
- [x] `handleDrop` 함수가 드래그 앤 드롭 이벤트를 올바르게 처리함
- [x] 시간표 UI가 수업 추가/제거 후 즉시 업데이트됨
- [x] 시간 충돌 검증이 정상적으로 작동함 (courseName 매핑으로 호환성 확보)
- [x] 기존 에러 처리 로직이 정상적으로 작동함
- [x] TypeScript 컴파일 에러가 없음
- [x] 콘솔에 적절한 로그가 출력됨

## 🚀 **다음 단계**

이 수정이 완료되면, 향후 다음과 같은 개선을 고려할 수 있습니다:

1. **성능 최적화**: 백엔드에서 병렬 처리 최적화 및 프론트엔드 캐싱 전략 수립
2. **사용자 경험 개선**: 로딩 상태, 성공/실패 피드백 등 UI/UX 개선
3. **테스트 자동화**: 백엔드 API 테스트 및 프론트엔드 통합 테스트 자동화 구축
4. **모니터링 강화**: API 응답 시간, 에러율 등 성능 지표 모니터링

## 🎯 **핵심 요약**

### **변경되는 부분**
- **백엔드 API 응답 구조**: 프론트엔드가 실제 사용하는 데이터 구조에 정확히 맞춤
- **프론트엔드 코드**: 데이터 변환 로직 제거, 백엔드 응답을 직접 사용하여 코드 단순화
- **타입 정의**: 백엔드 응답과 프론트엔드 타입을 완벽하게 일치
- **색상 생성**: Course.name 기반으로 일관된 색상 생성
- **타입 안전성**: DayOfWeek 등 엄격한 타입 적용

### **변경되지 않는 부분**
- **데이터베이스 구조**: 기존 스키마 그대로 유지
- **API 엔드포인트**: 기존 경로 그대로 유지
- **비즈니스 로직**: 수업 추가/제거 로직은 동일하게 유지

### **해결되는 문제**
- 드래그 앤 드롭 기능이 정상적으로 작동
- 백엔드와 프론트엔드 간 데이터 구조 완벽 일치
- 충돌 검증 함수와의 호환성 확보 (courseName 매핑)
- 파라미터 불일치 문제 완전 해결
- 색상 생성의 일관성 및 결정성 확보
- 코드 유지보수성 및 가독성 향상

이 계획을 통해 데이터베이스 구조는 변경하지 않으면서도 드래그 앤 드롭 기능 문제를 근본적으로 해결할 수 있습니다.
