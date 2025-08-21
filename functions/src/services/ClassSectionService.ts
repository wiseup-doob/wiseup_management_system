import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
import type { 
  ClassSection, 
  CreateClassSectionRequest, 
  UpdateClassSectionRequest, 
  ClassSectionSearchParams,
  ClassScheduleBlock,
  ClassScheduleGrid,
  ClassScheduleSearchParams,
  DayOfWeek
} from '@shared/types';
import type { Student } from '@shared/types';

export class ClassSectionService extends BaseService {
  constructor() {
    super('class_sections');
  }

  // 수업 생성
  async createClassSection(data: CreateClassSectionRequest): Promise<string> {
    // schedule 검증 로직 추가
    if (data.schedule && data.schedule.length > 0) {
      for (const schedule of data.schedule) {
        if (!schedule.dayOfWeek || !schedule.startTime || !schedule.endTime) {
          throw new Error('스케줄의 요일, 시작 시간, 종료 시간은 필수입니다.');
        }
        
        // 시간 형식 검증 (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(schedule.startTime) || !timeRegex.test(schedule.endTime)) {
          throw new Error('시간 형식이 올바르지 않습니다. (HH:MM)');
        }
        
        // 시작 시간이 종료 시간보다 빠른지 검증
        if (schedule.startTime >= schedule.endTime) {
          throw new Error('시작 시간은 종료 시간보다 빨라야 합니다.');
        }
      }
    }

    const classSectionData: Omit<ClassSection, 'id'> = {
      ...data,
      currentStudents: data.currentStudents ?? 0,
      status: data.status ?? 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return this.create(classSectionData);
  }

  // 수업 조회 (ID로)
  async getClassSectionById(id: string): Promise<ClassSection | null> {
    return this.getById<ClassSection>(id);
  }

  // 수업 수정
  async updateClassSection(id: string, data: UpdateClassSectionRequest): Promise<void> {
    // schedule 검증 로직 추가 (수정 시에도 동일한 검증 적용)
    if (data.schedule && data.schedule.length > 0) {
      for (const schedule of data.schedule) {
        if (!schedule.dayOfWeek || !schedule.startTime || !schedule.endTime) {
          throw new Error('스케줄의 요일, 시작 시간, 종료 시간은 필수입니다.');
        }
        
        // 시간 형식 검증 (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(schedule.startTime) || !timeRegex.test(schedule.endTime)) {
          throw new Error('시간 형식이 올바르지 않습니다. (HH:MM)');
        }
        
        // 시작 시간이 종료 시간보다 빠른지 검증
        if (schedule.startTime >= schedule.endTime) {
          throw new Error('시작 시간은 종료 시간보다 빨라야 합니다.');
        }
      }
    }

    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await this.update(id, updateData);
  }

  // 수업 삭제
  async deleteClassSection(id: string): Promise<void> {
    await this.delete(id);
  }

  // Course와 ClassSection을 한번에 생성
  async createClassWithCourse(data: {
    courseName: string;
    subject: string;
    difficulty?: string;
    name: string;
    teacherId: string;
    classroomId: string;
    schedule: Array<{ dayOfWeek: DayOfWeek; startTime: string; endTime: string }>;
    maxStudents: number;
    description?: string;
    notes?: string;
  }): Promise<{ course: any; classSection: ClassSection }> {
    // 1단계: Course 찾기 또는 생성
    let courseId: string;
    let course: any;

    // 기존 Course가 있는지 확인 (이름, 과목, 난이도로)
    const existingCourse = await this.db
      .collection('courses')
      .where('name', '==', data.courseName)
      .where('subject', '==', data.subject)
      .where('difficulty', '==', data.difficulty)
      .limit(1)
      .get();

    if (!existingCourse.empty) {
      // 기존 Course 사용
      course = existingCourse.docs[0].data();
      courseId = existingCourse.docs[0].id;
      console.log('기존 Course 사용:', courseId);
    } else {
      // 새 Course 생성
      const newCourse = {
        name: data.courseName,
        subject: data.subject,
        difficulty: data.difficulty,
        description: data.description || '',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const courseRef = await this.db.collection('courses').add(newCourse);
      courseId = courseRef.id;
      course = { id: courseId, ...newCourse };
      console.log('새 Course 생성:', courseId);
    }

    // 2단계: ClassSection 생성
    const classSectionData: Omit<ClassSection, 'id'> = {
      name: data.name,
      courseId,
      teacherId: data.teacherId,
      classroomId: data.classroomId,
      schedule: data.schedule,
      maxStudents: data.maxStudents,
      currentStudents: 0,
      description: data.description || '',
      notes: data.notes || '',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const classSectionId = await this.create(classSectionData);
    const classSection = await this.getById<ClassSection>(classSectionId);

    if (!classSection) {
      throw new Error('ClassSection 생성 후 조회에 실패했습니다.');
    }

    return { course, classSection };
  }

  // 모든 수업 조회
  async getAllClassSections(): Promise<ClassSection[]> {
    return this.getAll<ClassSection>();
  }

  // 모든 수업을 상세 정보와 함께 조회 (Course, Teacher, Classroom 포함)
  async getClassSectionsWithDetails(): Promise<any[]> {
    try {
      const classSections = await this.getAllClassSections();
      
      // 각 ClassSection에 관련 정보 추가
      const enrichedData = await Promise.all(
        classSections.map(async (section) => {
          try {
            const [courseDoc, teacherDoc, classroomDoc] = await Promise.all([
              this.db.collection('courses').doc(section.courseId).get(),
              this.db.collection('teachers').doc(section.teacherId).get(),
              this.db.collection('classrooms').doc(section.classroomId).get()
            ]);
            
            return {
              ...section,
              course: courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null,
              teacher: teacherDoc.exists ? { id: teacherDoc.id, ...teacherDoc.data() } : null,
              classroom: classroomDoc.exists ? { id: classroomDoc.id, ...classroomDoc.data() } : null
            };
          } catch (error) {
            console.error(`수업 ${section.id} 상세 정보 조회 실패:`, error);
            // 에러가 발생해도 기본 정보는 반환
            return {
              ...section,
              course: null,
              teacher: null,
              classroom: null
            };
          }
        })
      );
      
      return enrichedData;
    } catch (error) {
      console.error('수업 상세 정보 조회 실패:', error);
      throw new Error('수업 상세 정보 조회에 실패했습니다.');
    }
  }

  // 특정 수업을 상세 정보와 함께 조회
  async getClassSectionWithDetailsById(id: string): Promise<any> {
    try {
      const classSection = await this.getClassSectionById(id);
      if (!classSection) {
        return null;
      }
      
      const [courseDoc, teacherDoc, classroomDoc] = await Promise.all([
        this.db.collection('courses').doc(classSection.courseId).get(),
        this.db.collection('teachers').doc(classSection.teacherId).get(),
        this.db.collection('classrooms').doc(classSection.classroomId).get()
      ]);
      
      return {
        ...classSection,
        course: courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null,
        teacher: teacherDoc.exists ? { id: teacherDoc.id, ...teacherDoc.data() } : null,
        classroom: classroomDoc.exists ? { id: classroomDoc.id, ...classroomDoc.data() } : null
      };
    } catch (error) {
      console.error(`수업 ${id} 상세 정보 조회 실패:`, error);
      throw new Error('수업 상세 정보 조회에 실패했습니다.');
    }
  }

  // 수업 검색
  async searchClassSections(params: ClassSectionSearchParams): Promise<ClassSection[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName);

    // 수업명으로 검색
    if (params.name) {
      query = query.where('name', '>=', params.name)
                   .where('name', '<=', params.name + '\uf8ff');
    }

    // 강의 ID로 검색
    if (params.courseId) {
      query = query.where('courseId', '==', params.courseId);
    }

    // 교사 ID로 검색
    if (params.teacherId) {
      query = query.where('teacherId', '==', params.teacherId);
    }

    // 강의실 ID로 검색
    if (params.classroomId) {
      query = query.where('classroomId', '==', params.classroomId);
    }

    // 상태로 검색
    if (params.status) {
      query = query.where('status', '==', params.status);
    }

    return this.search<ClassSection>(query);
  }

  // 수업 통계 조회
  async getClassSectionStatistics(): Promise<{
    totalClassSections: number;
  }> {
    const classSections = await this.getAllClassSections();
    
    return {
      totalClassSections: classSections.length
    };
  }

  // ===== 시간표 관련 기능 =====

  // 시간표 블록 생성 (UI 표시용)
  private createScheduleBlock(classSection: ClassSection): ClassScheduleBlock[] {
    return classSection.schedule.map(schedule => ({
      id: classSection.id,
      title: classSection.name,
      subtitle: `${classSection.teacherId} - ${classSection.classroomId}`, // 실제로는 교사명과 강의실명을 가져와야 함
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      color: classSection.color || '#e3f2fd', // 기본 색상
      order: classSection.displayOrder || 0
    }));
  }

  // 시간표 그리드 생성
  async createScheduleGrid(): Promise<ClassScheduleGrid> {
    const classSections = await this.getAllClassSections();
    
    // 모든 시간대 추출
    const timeSet = new Set<string>();
    classSections.forEach(section => {
      section.schedule.forEach(schedule => {
        timeSet.add(schedule.startTime);
        timeSet.add(schedule.endTime);
      });
    });
    
    // 시간대를 시간 순서로 정렬
    const timeSlots = Array.from(timeSet).sort((a, b) => {
      const timeA = new Date(`2000-01-01 ${a}`);
      const timeB = new Date(`2000-01-01 ${b}`);
      return timeA.getTime() - timeB.getTime();
    });
    
    // 요일 목록 - DayOfWeek 타입의 모든 값 사용
    const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // 모든 시간표 블록 생성
    const blocks: ClassScheduleBlock[] = [];
    classSections.forEach(section => {
      blocks.push(...this.createScheduleBlock(section));
    });
    
    return {
      timeSlots,
      daysOfWeek,
      blocks
    };
  }

  // 특정 요일의 수업 조회
  async getClassSectionsByDay(dayOfWeek: DayOfWeek): Promise<ClassSection[]> {
    return this.search<ClassSection>(
      this.db.collection(this.collectionName)
        .where('schedule', 'array-contains', { dayOfWeek })
    );
  }

  // 특정 시간대의 수업 조회
  async getClassSectionsByTime(startTime: string, endTime: string): Promise<ClassSection[]> {
    const classSections = await this.getAllClassSections();
    
    return classSections.filter(section => 
      section.schedule.some(schedule => 
        schedule.startTime === startTime && schedule.endTime === endTime
      )
    );
  }

  // 시간표 검색
  async searchSchedule(params: ClassScheduleSearchParams): Promise<ClassSection[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName);

    // 교사별 검색
    if (params.teacherId) {
      query = query.where('teacherId', '==', params.teacherId);
    }

    // 강의별 검색
    if (params.courseId) {
      query = query.where('courseId', '==', params.courseId);
    }

    // 요일별 검색
    if (params.dayOfWeek) {
      query = query.where('schedule', 'array-contains', { dayOfWeek: params.dayOfWeek });
    }

    // 상태별 검색
    if (params.status) {
      query = query.where('status', '==', params.status);
    }

    const results = await this.search<ClassSection>(query);

    // 시간 범위 검색 (클라이언트 사이드에서 필터링)
    if (params.timeRange) {
      return results.filter(section => 
        section.schedule.some(schedule => 
          schedule.startTime >= params.timeRange!.start && 
          schedule.endTime <= params.timeRange!.end
        )
      );
    }

    return results;
  }

  // 시간 충돌 검증
  async validateTimeConflict(
    teacherId: string, 
    classroomId: string, 
    dayOfWeek: DayOfWeek, 
    startTime: string, 
    endTime: string,
    excludeId?: string // 수정 시 제외할 수업 ID
  ): Promise<boolean> {
    const classSections = await this.searchSchedule({ 
      teacherId, 
      dayOfWeek, 
      status: 'active' 
    });

    // 제외할 수업이 있으면 필터링
    const filteredSections = excludeId 
      ? classSections.filter(section => section.id !== excludeId)
      : classSections;

    // 시간 충돌 검사
    for (const section of filteredSections) {
      for (const schedule of section.schedule) {
        if (schedule.dayOfWeek === dayOfWeek) {
          // 시간 겹침 검사
          const hasConflict = (
            (startTime < schedule.endTime && endTime > schedule.startTime) ||
            (schedule.startTime < endTime && schedule.endTime > startTime)
          );
          
          if (hasConflict) {
            return true; // 충돌 발생
          }
        }
      }
    }

    return false; // 충돌 없음
  }

  // 시간표 통계
  async getScheduleStatistics(): Promise<{
    totalClasses: number;
    classesByDay: Record<string, number>;
    classesByTime: Record<string, number>;
    mostBusyTime: string;
    leastBusyTime: string;
  }> {
    const classSections = await this.getAllClassSections();
    
    const classesByDay: Record<string, number> = {};
    const classesByTime: Record<string, number> = {};
    
    classSections.forEach(section => {
      section.schedule.forEach(schedule => {
        // 요일별 통계
        classesByDay[schedule.dayOfWeek] = (classesByDay[schedule.dayOfWeek] || 0) + 1;
        
        // 시간대별 통계
        const timeKey = `${schedule.startTime}-${schedule.endTime}`;
        classesByTime[timeKey] = (classesByTime[timeKey] || 0) + 1;
      });
    });
    
    // 가장 바쁜 시간대와 가장 한가한 시간대 찾기
    let mostBusyTime = '';
    let leastBusyTime = '';
    let maxCount = 0;
    let minCount = Infinity;
    
    Object.entries(classesByTime).forEach(([time, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostBusyTime = time;
      }
      if (count < minCount) {
        minCount = count;
        leastBusyTime = time;
      }
    });
    
    return {
      totalClasses: classSections.length,
      classesByDay,
      classesByTime,
      mostBusyTime,
      leastBusyTime
    };
  }

  // 수업 의존성 확인
  async getClassSectionDependencies(classSectionId: string): Promise<{
    hasStudentTimetables: boolean;
    affectedStudentCount: number;
    hasAttendanceRecords: boolean;
    attendanceCount: number;
    totalRelatedRecords: number;
  }> {
    try {
      // 병렬로 모든 의존성 확인
      const [
        affectedStudentCount,
        attendanceCount
      ] = await Promise.all([
        this.getAffectedStudentCountByClassSectionId(classSectionId),
        this.getAttendanceCountByClassSectionId(classSectionId)
      ]);

      return {
        hasStudentTimetables: affectedStudentCount > 0,
        affectedStudentCount,
        hasAttendanceRecords: attendanceCount > 0,
        attendanceCount,
        totalRelatedRecords: affectedStudentCount + attendanceCount
      };
    } catch (error) {
      console.error('수업 의존성 확인 실패:', error);
      throw new Error(`수업 의존성 확인 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 수업 계층적 삭제 (관련 데이터 모두 삭제)
  async deleteClassSectionHierarchically(classSectionId: string): Promise<{
    success: boolean;
    deletedRecords: {
      studentTimetables: number;
      attendanceRecords: number;
      classSection: boolean;
    };
    message: string;
  }> {
    try {
      // 트랜잭션 시작
      const result = await this.runTransaction(async (transaction) => {
        // === 1단계: 모든 읽기 작업을 먼저 수행 ===
        
        // 해당 수업을 듣는 학생들의 시간표 조회
        const studentTimetableQuery = this.db.collection('student_timetables');
        const studentTimetableDocs = await transaction.get(studentTimetableQuery);
        
        // 해당 수업의 출석 기록 조회
        const attendanceQuery = this.db.collection('attendance_records')
                                       .where('classSectionId', '==', classSectionId);
        const attendanceDocs = await transaction.get(attendanceQuery);
        
        // === 2단계: 모든 쓰기 작업을 수행 ===
        
        let studentTimetablesUpdated = 0;
        let attendanceRecordsDeleted = attendanceDocs.size;
        let classSectionDeleted = false;
        
        // 학생 시간표 업데이트
        for (const doc of studentTimetableDocs.docs) {
          const timetableData = doc.data();
          if (timetableData.classSectionIds && Array.isArray(timetableData.classSectionIds)) {
            // 삭제될 수업 ID를 제거
            const updatedClassSectionIds = timetableData.classSectionIds.filter(
              (id: string) => id !== classSectionId
            );
            
            if (updatedClassSectionIds.length !== timetableData.classSectionIds.length) {
              transaction.update(doc.ref, {
                classSectionIds: updatedClassSectionIds,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });
              studentTimetablesUpdated++;
            }
          }
        }
        
        // 출석 기록 삭제
        attendanceDocs.forEach(doc => {
          transaction.delete(doc.ref);
        });
        
        // 수업 삭제
        const classSectionRef = this.db.collection('class_sections').doc(classSectionId);
        transaction.delete(classSectionRef);
        classSectionDeleted = true;

        return {
          studentTimetablesUpdated,
          attendanceRecordsDeleted,
          classSectionDeleted
        };
      });

      return {
        success: true,
        deletedRecords: {
          studentTimetables: result.studentTimetablesUpdated,
          attendanceRecords: result.attendanceRecordsDeleted,
          classSection: result.classSectionDeleted
        },
        message: '수업과 관련 데이터가 모두 삭제되었습니다.'
      };

    } catch (error) {
      console.error('수업 계층적 삭제 실패:', error);
      throw new Error(`수업 계층적 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  // 수업을 듣는 학생 수 조회
  private async getAffectedStudentCountByClassSectionId(classSectionId: string): Promise<number> {
    const studentTimetableQuery = this.db.collection('student_timetables');
    const studentTimetables = await this.search<{ studentId: string; classSectionIds?: string[] }>(studentTimetableQuery);
    
    // 해당 수업을 듣는 학생들 카운트
    let affectedStudentCount = 0;
    studentTimetables.forEach(timetable => {
      if (timetable.classSectionIds && Array.isArray(timetable.classSectionIds)) {
        if (timetable.classSectionIds.includes(classSectionId)) {
          affectedStudentCount++;
        }
      }
    });

    return affectedStudentCount;
  }

  // 수업의 출석 기록 수 조회
  private async getAttendanceCountByClassSectionId(classSectionId: string): Promise<number> {
    const attendanceQuery = this.db.collection('attendance_records')
                                   .where('classSectionId', '==', classSectionId);
    const records = await this.search(attendanceQuery);
    return records.length;
  }

  // 수업에 학생 추가
  async addStudentToClass(classSectionId: string, studentId: string): Promise<void> {
    try {
      // 트랜잭션 시작
      await this.runTransaction(async (transaction) => {
        // === 1단계: 모든 읽기 작업을 먼저 수행 ===
        
        // 수업 존재 여부 확인
        const classSectionRef = this.db.collection('class_sections').doc(classSectionId);
        const classSectionDoc = await transaction.get(classSectionRef);
        
        if (!classSectionDoc.exists) {
          throw new Error('수업을 찾을 수 없습니다.');
        }
        
        const classSectionData = classSectionDoc.data() as ClassSection;
        
        // 학생 존재 여부 확인
        const studentRef = this.db.collection('students').doc(studentId);
        const studentDoc = await transaction.get(studentRef);
        
        if (!studentDoc.exists) {
          throw new Error('학생을 찾을 수 없습니다.');
        }
        
        // 수업 정원 확인
        if ((classSectionData.currentStudents || 0) >= classSectionData.maxStudents) {
          throw new Error('수업 정원이 가득 찼습니다.');
        }
        
        // 학생 시간표 조회 (없으면 생성)
        const studentTimetableRef = this.db.collection('student_timetables').doc(studentId);
        const studentTimetableDoc = await transaction.get(studentTimetableRef);
        
        // === 2단계: 모든 쓰기 작업을 수행 ===
        
        if (studentTimetableDoc.exists) {
          // 기존 시간표에 수업 추가
          const timetableData = studentTimetableDoc.data();
          if (!timetableData) {
            throw new Error('학생 시간표 데이터를 읽을 수 없습니다.');
          }
          
          const classSectionIds = timetableData.classSectionIds || [];
          
          // 이미 등록된 수업인지 확인
          if (classSectionIds.includes(classSectionId)) {
            throw new Error('이미 등록된 수업입니다.');
          }
          
          // 수업 ID 추가
          transaction.update(studentTimetableRef, {
            classSectionIds: [...classSectionIds, classSectionId],
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } else {
          // 새로운 학생 시간표 생성
          transaction.set(studentTimetableRef, {
            studentId,
            classSectionIds: [classSectionId],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        // 수업의 현재 학생 수 증가
        transaction.update(classSectionRef, {
          currentStudents: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
    } catch (error) {
      console.error('학생 추가 실패:', error);
      throw error;
    }
  }

  // 수업에서 학생 제거
  async removeStudentFromClass(classSectionId: string, studentId: string): Promise<void> {
    try {
      // 트랜잭션 시작
      await this.runTransaction(async (transaction) => {
        // === 1단계: 모든 읽기 작업을 먼저 수행 ===
        
        // 수업 존재 여부 확인
        const classSectionRef = this.db.collection('class_sections').doc(classSectionId);
        const classSectionDoc = await transaction.get(classSectionRef);
        
        if (!classSectionDoc.exists) {
          throw new Error('수업을 찾을 수 없습니다.');
        }
        
        // 학생 시간표 조회
        const studentTimetableRef = this.db.collection('student_timetables').doc(studentId);
        const studentTimetableDoc = await transaction.get(studentTimetableRef);
        
        if (!studentTimetableDoc.exists) {
          throw new Error('학생 시간표를 찾을 수 없습니다.');
        }
        
        const timetableData = studentTimetableDoc.data();
        if (!timetableData) {
          throw new Error('학생 시간표 데이터를 읽을 수 없습니다.');
        }
        
        const classSectionIds = timetableData.classSectionIds || [];
        
        // 수업이 등록되어 있는지 확인
        if (!classSectionIds.includes(classSectionId)) {
          throw new Error('등록되지 않은 수업입니다.');
        }
        
        // === 2단계: 모든 쓰기 작업을 수행 ===
        
        // 학생 시간표에서 수업 ID 제거
        const updatedClassSectionIds = classSectionIds.filter((id: string) => id !== classSectionId);
        
        if (updatedClassSectionIds.length === 0) {
          // 수업이 하나도 없으면 학생 시간표 문서 삭제
          transaction.delete(studentTimetableRef);
        } else {
          // 수업 ID 목록 업데이트
          transaction.update(studentTimetableRef, {
            classSectionIds: updatedClassSectionIds,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        // 수업의 현재 학생 수 감소
        transaction.update(classSectionRef, {
          currentStudents: admin.firestore.FieldValue.increment(-1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
    } catch (error) {
      console.error('학생 제거 실패:', error);
      throw error;
    }
  }

  // 수업에 등록된 학생 목록 조회
  async getEnrolledStudents(classSectionId: string): Promise<Student[]> {
    try {
      // student_timetables 컬렉션에서 해당 수업을 듣는 학생들 조회
      const studentTimetableQuery = this.db.collection('student_timetables')
        .where('classSectionIds', 'array-contains', classSectionId);
      
      const studentTimetableDocs = await studentTimetableQuery.get();
      
      if (studentTimetableDocs.empty) {
        return [];
      }
      
      // 학생 ID 목록 추출
      const studentIds = studentTimetableDocs.docs.map(doc => doc.data().studentId);
      
      if (studentIds.length === 0) {
        return [];
      }
      
      // 학생 상세 정보 조회
      const students: Student[] = [];
      
      // Firestore의 'in' 쿼리 제한(10개)을 고려하여 청크 단위로 처리
      const chunkSize = 10;
      for (let i = 0; i < studentIds.length; i += chunkSize) {
        const chunk = studentIds.slice(i, i + chunkSize);
        const studentsQuery = this.db.collection('students')
          .where(admin.firestore.FieldPath.documentId(), 'in', chunk);
        
        const studentsDocs = await studentsQuery.get();
        studentsDocs.forEach(doc => {
          const studentData = doc.data() as Student;
          students.push({
            ...studentData,
            id: doc.id
          });
        });
      }
      
      return students;
      
    } catch (error) {
      console.error('등록된 학생 목록 조회 실패:', error);
      throw new Error(`등록된 학생 목록 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }
}
