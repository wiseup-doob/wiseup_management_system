import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
import { ColorService } from './ColorService';
import { TimetableVersionService } from './TimetableVersionService';
import type {
  ClassSection,
  CreateClassSectionRequest,
  UpdateClassSectionRequest,
  ClassSectionSearchParams,
  ClassScheduleBlock,
  ClassScheduleGrid,
  ClassScheduleSearchParams,
  DayOfWeek,
  ClassSchedule
} from '@shared/types';
import type { Student } from '@shared/types';

export class ClassSectionService extends BaseService {
  private colorService: ColorService;
  private timetableVersionService: TimetableVersionService;

  constructor() {
    super('class_sections');
    this.colorService = new ColorService();
    this.timetableVersionService = new TimetableVersionService();
  }

  // 수업 생성
  async createClassSection(data: CreateClassSectionRequest): Promise<string> {
    // versionId가 없으면 활성 버전 사용
    let versionId = data.versionId;
    if (!versionId) {
      const activeVersion = await this.timetableVersionService.getActiveVersion();
      if (!activeVersion) {
        throw new Error('활성화된 시간표 버전이 없습니다.');
      }
      versionId = activeVersion.id;
    }

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

    // 🎨 새 수업 색상 자동 생성 (Class Section 기반 고급 색상 생성)
    let color: string | undefined;
    try {
      if (!data.color) {
        // 🚀 새로운 Class Section 기반 색상 생성 로직 사용
        // 임시 ID로 색상 생성 (실제 ID는 생성 후에 알 수 있음)
        const tempId = `temp_${Date.now()}`;
        color = await this.colorService.generateColorForClassSection(
          tempId,           // 임시 수업 ID
          data.name,        // 수업명
          data.teacherId,   // 교사 ID
          data.classroomId, // 강의실 ID
          data.schedule     // 수업 스케줄
        );
        console.log(`🎨 새 수업 "${data.name}" 색깔 자동 생성: ${color}`);
      } else {
        color = data.color; // 사용자가 직접 지정한 색상 사용
        console.log(`🎨 사용자 지정 색상 사용: ${color}`);
      }
    } catch (error) {
      console.warn('새 수업 색깔 생성 실패, 나중에 자동 생성됩니다:', error);
      // 색상 생성 실패해도 수업 생성은 계속 진행
    }

    const classSectionData: Omit<ClassSection, 'id'> = {
      ...data,
      versionId, // 👈 활성 버전 ID 저장
      color, // 👈 생성된 색상 저장
      currentStudents: data.currentStudents ?? 0,
      status: data.status ?? 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const classSectionId = await this.create(classSectionData);
    
    // 🔄 실제 ID로 색상 재생성 (일관성 보장 + 색상 충돌 방지)
    if (color && color.startsWith('temp_')) {
      try {
        // 🚀 새로운 로직으로 실제 색상 생성
        const actualColor = await this.colorService.generateColorForClassSection(
          classSectionId,   // 실제 수업 ID
          data.name,        // 수업명
          data.teacherId,   // 교사 ID
          data.classroomId, // 강의실 ID
          data.schedule     // 수업 스케줄
        );
        
        // 색상 충돌 확인 및 조정
        const finalColor = await this.resolveColorConflict(classSectionId, actualColor, data.schedule);
        
        await this.updateClassSection(classSectionId, { color: finalColor });
        console.log(`✅ 새 수업 색깔 최종 업데이트: ${finalColor}`);
      } catch (error) {
        console.error('새 수업 색깔 최종 업데이트 실패:', error);
        // 실패해도 임시 색상으로 유지
      }
    }

    return classSectionId;
  }

  // 수업 조회 (ID로)
  async getClassSectionById(id: string): Promise<ClassSection | null> {
    const classSection = await this.getById<ClassSection>(id);
    if (!classSection) return null;
    
    // 색상이 없으면 자동 생성
    return this.ensureClassSectionHasColor(classSection);
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
    color?: string; // 색상 필드 추가
    versionId?: string; // versionId 추가
  }): Promise<{ course: any; classSection: ClassSection }> {
    // versionId가 없으면 활성 버전 사용
    let versionId = data.versionId;
    if (!versionId) {
      const activeVersion = await this.timetableVersionService.getActiveVersion();
      if (!activeVersion) {
        throw new Error('활성화된 시간표 버전이 없습니다.');
      }
      versionId = activeVersion.id;
    }

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
      versionId,
      courseId,
      teacherId: data.teacherId,
      classroomId: data.classroomId,
      schedule: data.schedule,
      maxStudents: data.maxStudents,
      currentStudents: 0,
      description: data.description || '',
      notes: data.notes || '',
      // 색상 필드: 전달받은 색상이 있으면 사용, 없으면 undefined (자동 생성)
      color: data.color || undefined,
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

  // 모든 수업 조회 (versionId로 필터링)
  async getAllClassSections(versionId?: string): Promise<ClassSection[]> {
    // versionId가 없으면 활성 버전 사용
    if (!versionId) {
      const activeVersion = await this.timetableVersionService.getActiveVersion();
      if (!activeVersion) {
        throw new Error('활성화된 시간표 버전이 없습니다.');
      }
      versionId = activeVersion.id;
    }

    const query = this.db.collection(this.collectionName).where('versionId', '==', versionId);
    return this.search<ClassSection>(query);
  }

  // 특정 버전의 특정 수업 조회
  async getByIdAndVersion(id: string, versionId?: string): Promise<ClassSection | null> {
    // versionId가 없으면 활성 버전 사용
    if (!versionId) {
      const activeVersion = await this.timetableVersionService.getActiveVersion();
      if (!activeVersion) {
        throw new Error('활성화된 시간표 버전이 없습니다.');
      }
      versionId = activeVersion.id;
    }

    const classSection = await this.getById<ClassSection>(id);
    if (!classSection || classSection.versionId !== versionId) {
      return null;
    }
    return classSection;
  }

  // 모든 수업을 상세 정보와 함께 조회 (Course, Teacher, Classroom 포함)
  async getClassSectionsWithDetails(versionId?: string): Promise<any[]> {
    try {
      const classSections = await this.getAllClassSections(versionId);
      
      // 🔄 점진적 색상 생성: 색상이 없는 수업들만 배치 처리
      const sectionsWithColors = await this.ensureBatchClassSectionsHaveColors(classSections);
      
      // 각 ClassSection에 관련 정보 추가
      const enrichedData = await Promise.all(
        sectionsWithColors.map(async (section) => {
          try {
            const [courseDoc, teacherDoc, classroomDoc] = await Promise.all([
              this.db.collection('courses').doc(section.courseId).get(),
              this.db.collection('teachers').doc(section.teacherId).get(),
              this.db.collection('classrooms').doc(section.classroomId).get()
            ]);
            
            // ✅ currentStudents 정합성 검사 및 업데이트
            const updatedSection = await this.validateAndUpdateCurrentStudents(section);
            
            return {
              ...updatedSection,
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
      
      // ✅ currentStudents 정합성 검사 및 업데이트
      const updatedClassSection = await this.validateAndUpdateCurrentStudents(classSection);
      
      return {
        ...updatedClassSection,
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

    // versionId로 검색 (없으면 활성 버전 사용)
    let versionId = params.versionId;
    if (!versionId) {
      const activeVersion = await this.timetableVersionService.getActiveVersion();
      if (!activeVersion) {
        throw new Error('활성화된 시간표 버전이 없습니다.');
      }
      versionId = activeVersion.id;
    }
    query = query.where('versionId', '==', versionId);

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
    // ✅ 해당 수업의 버전 ID 가져오기
    const classSectionDoc = await this.db.collection('class_sections').doc(classSectionId).get();
    if (!classSectionDoc.exists) {
      return 0;
    }

    const classSectionData = classSectionDoc.data();
    let versionId = classSectionData?.versionId;

    // ✅ 수업에 버전이 없으면 활성 버전 사용
    if (!versionId) {
      const versionService = new TimetableVersionService();
      const activeVersion = await versionService.getActiveVersion();
      if (activeVersion) {
        versionId = activeVersion.id;
      }
    }

    // ✅ 버전이 없으면 0 반환
    if (!versionId) {
      console.warn('⚠️ 버전을 찾을 수 없어서 영향받는 학생 수를 조회할 수 없습니다.');
      return 0;
    }

    // ✅ 버전 필터링 적용하여 학생 시간표 조회
    const studentTimetableQuery = this.db.collection('student_timetables')
      .where('classSectionIds', 'array-contains', classSectionId)
      .where('versionId', '==', versionId);

    const studentTimetables = await studentTimetableQuery.get();

    return studentTimetables.size;
  }

  // 수업의 출석 기록 수 조회
  private async getAttendanceCountByClassSectionId(classSectionId: string): Promise<number> {
    const attendanceQuery = this.db.collection('attendance_records')
                                   .where('classSectionId', '==', classSectionId);
    const records = await this.search(attendanceQuery);
    return records.length;
  }

  // 수업에 학생 추가
  async addStudentToClass(classSectionId: string, studentId: string, versionId?: string): Promise<void> {
    try {
      // ✅ 트랜잭션 전에 버전 결정
      let targetVersionId = versionId;
      if (!targetVersionId) {
        const versionService = new TimetableVersionService();
        const activeVersion = await versionService.getActiveVersion();
        if (!activeVersion) {
          throw new Error('활성 시간표 버전이 없습니다.');
        }
        targetVersionId = activeVersion.id;
      }

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

        // ✅ 수정: studentId + versionId로 시간표 조회
        const timetableQuery = this.db.collection('student_timetables')
          .where('studentId', '==', studentId)
          .where('versionId', '==', targetVersionId)
          .limit(1);
        const timetableSnapshot = await transaction.get(timetableQuery);

        // === 2단계: 모든 쓰기 작업을 수행 ===

        if (!timetableSnapshot.empty) {
          // 기존 시간표에 수업 추가
          const timetableDoc = timetableSnapshot.docs[0];
          const timetableData = timetableDoc.data();

          const classSectionIds = timetableData.classSectionIds || [];

          // 이미 등록된 수업인지 확인
          if (classSectionIds.includes(classSectionId)) {
            throw new Error('이미 등록된 수업입니다.');
          }

          // 수업 ID 추가
          transaction.update(timetableDoc.ref, {
            classSectionIds: [...classSectionIds, classSectionId],
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } else {
          // ✅ 새로운 학생 시간표 생성 (자동 생성 ID 사용)
          const newTimetableRef = this.db.collection('student_timetables').doc();
          transaction.set(newTimetableRef, {
            studentId,
            versionId: targetVersionId,
            classSectionIds: [classSectionId],
            notes: '',
            createAt: admin.firestore.FieldValue.serverTimestamp(),
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
  async removeStudentFromClass(classSectionId: string, studentId: string, versionId?: string): Promise<void> {
    try {
      console.log('🗑️ [removeStudentFromClass] 시작');
      console.log('📝 파라미터:', { classSectionId, studentId, versionId });

      // ✅ 트랜잭션 전에 버전 결정
      let targetVersionId = versionId;
      if (!targetVersionId) {
        console.log('⚠️ versionId가 제공되지 않음, 활성 버전 조회 중...');
        const versionService = new TimetableVersionService();
        const activeVersion = await versionService.getActiveVersion();
        if (!activeVersion) {
          throw new Error('활성 시간표 버전이 없습니다.');
        }
        targetVersionId = activeVersion.id;
        console.log('✅ 활성 버전 ID:', targetVersionId);
      } else {
        console.log('✅ 제공된 버전 ID 사용:', targetVersionId);
      }

      // 트랜잭션 시작
      await this.runTransaction(async (transaction) => {
        // === 1단계: 모든 읽기 작업을 먼저 수행 ===

        // 수업 존재 여부 확인
        console.log('🔍 수업 존재 여부 확인 중...', classSectionId);
        const classSectionRef = this.db.collection('class_sections').doc(classSectionId);
        const classSectionDoc = await transaction.get(classSectionRef);

        if (!classSectionDoc.exists) {
          console.error('❌ 수업을 찾을 수 없음:', classSectionId);
          throw new Error('수업을 찾을 수 없습니다.');
        }
        console.log('✅ 수업 확인됨');

        // ✅ 수정: studentId + versionId로 시간표 조회
        console.log('🔍 학생 시간표 조회 중...', { studentId, targetVersionId });
        const timetableQuery = this.db.collection('student_timetables')
          .where('studentId', '==', studentId)
          .where('versionId', '==', targetVersionId)
          .limit(1);
        const timetableSnapshot = await transaction.get(timetableQuery);

        console.log('📊 시간표 조회 결과:', {
          empty: timetableSnapshot.empty,
          size: timetableSnapshot.size,
          docs: timetableSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
        });

        if (timetableSnapshot.empty) {
          console.warn('⚠️ 학생 시간표를 찾을 수 없음 - 시간표 없이 진행');
          console.warn('🔍 디버깅 정보:', {
            studentId,
            targetVersionId,
            classSectionId,
            message: '학생에게 시간표가 없지만 수업의 currentStudents는 감소시킵니다.'
          });
          // 시간표가 없어도 계속 진행 (수업의 currentStudents만 감소)
        } else {
          // 시간표가 있는 경우 시간표 업데이트
          const timetableDoc = timetableSnapshot.docs[0];
          const timetableData = timetableDoc.data();

          const classSectionIds = timetableData.classSectionIds || [];

          // 수업이 등록되어 있는지 확인 (경고만 출력)
          if (!classSectionIds.includes(classSectionId)) {
            console.warn('⚠️ 시간표에 해당 수업이 등록되어 있지 않음 - 그래도 시간표는 업데이트');
            console.warn('🔍 디버깅 정보:', {
              studentId,
              targetVersionId,
              classSectionId,
              currentClassSectionIds: classSectionIds,
              message: '시간표에 해당 수업이 없지만 안전하게 필터링하여 시간표를 업데이트합니다.'
            });
          }

          // === 2단계: 모든 쓰기 작업을 수행 ===

          // 학생 시간표에서 수업 ID 제거 (없어도 filter는 안전하게 처리)
          const updatedClassSectionIds = classSectionIds.filter((id: string) => id !== classSectionId);

          if (updatedClassSectionIds.length === 0) {
            // ✅ 수업이 하나도 없으면 학생 시간표 문서 삭제
            console.log('🗑️ 시간표에 수업이 하나도 없으므로 시간표 문서 삭제');
            transaction.delete(timetableDoc.ref);
          } else {
            // 수업 ID 목록 업데이트
            console.log('✅ 시간표에서 수업 제거 (또는 이미 없었음)');
            transaction.update(timetableDoc.ref, {
              classSectionIds: updatedClassSectionIds,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
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
  async getEnrolledStudents(classSectionId: string, versionId?: string): Promise<Student[]> {
    try {
      // ✅ 버전 결정
      let targetVersionId = versionId;
      if (!targetVersionId) {
        const versionService = new TimetableVersionService();
        const activeVersion = await versionService.getActiveVersion();
        if (activeVersion) {
          targetVersionId = activeVersion.id;
        }
      }

      // ✅ student_timetables 컬렉션에서 해당 수업을 듣는 학생들 조회 (버전 필터링 필수)
      if (!targetVersionId) {
        console.warn('⚠️ 활성 버전을 찾을 수 없어서 등록된 학생을 조회할 수 없습니다.');
        return [];
      }

      const studentTimetableQuery = this.db.collection('student_timetables')
        .where('classSectionIds', 'array-contains', classSectionId)
        .where('versionId', '==', targetVersionId);

      const studentTimetableDocs = await studentTimetableQuery.get();

      if (studentTimetableDocs.empty) {
        return [];
      }

      // ✅ 고유한 학생 ID 목록 추출 (중복 제거)
      const uniqueStudentIds = Array.from(new Set(studentTimetableDocs.docs.map(doc => doc.data().studentId)));

      if (uniqueStudentIds.length === 0) {
        return [];
      }

      // 학생 상세 정보 조회
      const students: Student[] = [];

      // Firestore의 'in' 쿼리 제한(10개)을 고려하여 청크 단위로 처리
      const chunkSize = 10;
      for (let i = 0; i < uniqueStudentIds.length; i += chunkSize) {
        const chunk = uniqueStudentIds.slice(i, i + chunkSize);
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

  /**
   * 수업의 currentStudents 필드를 실제 등록된 학생 수와 비교하여 정합성을 검사하고 필요시 업데이트합니다.
   * @param classSection 검사할 수업 정보
   * @returns 업데이트된 수업 정보 (업데이트가 발생한 경우) 또는 원본 수업 정보
   */
  private async validateAndUpdateCurrentStudents(classSection: any): Promise<any> {
    try {
      const enrolledStudents = await this.getEnrolledStudents(classSection.id);
      const actualCount = enrolledStudents.length;
      const dbCount = classSection.currentStudents || 0;
      
      // currentStudents가 실제와 다른 경우에만 업데이트
      if (dbCount !== actualCount) {
        console.log(`🔧 수업 "${classSection.name}" currentStudents 불일치 수정: ${dbCount} → ${actualCount}`);
        
        // DB 업데이트
        await this.updateClassSection(classSection.id, {
          currentStudents: actualCount
        });
        
        // 반환할 수업 정보에도 업데이트된 값 적용
        return {
          ...classSection,
          currentStudents: actualCount
        };
      }
      
      // 불일치가 없는 경우 원본 데이터 그대로 반환
      return classSection;
      
    } catch (error) {
      console.error(`수업 ${classSection.id} currentStudents 정합성 검사 실패:`, error);
      // 에러가 발생해도 원본 데이터는 반환 (앱 동작 중단 방지)
      return classSection;
    }
  }

  // ===== 색상 관리 메서드들 =====

  /**
   * 수업에 색상이 있는지 확인하고, 없으면 자동으로 생성하여 저장합니다.
   * @param classSection 검사할 수업 정보
   * @returns 색상이 포함된 수업 정보
   */
  private async ensureClassSectionHasColor(classSection: ClassSection): Promise<ClassSection> {
    if (classSection.color) {
      return classSection; // 이미 색깔 있음
    }
    
    try {
      console.log(`🎨 수업 "${classSection.name}" 색깔 자동 생성 시작`);
      
      // 🚀 새로운 Class Section 기반 색상 생성 로직 사용
      const color = await this.colorService.generateColorForClassSection(
        classSection.id, 
        classSection.name,
        classSection.teacherId,
        classSection.classroomId,
        classSection.schedule
      );
      
      // DB에 색상 저장
      await this.updateClassSection(classSection.id, { color });
      
      console.log(`✅ 수업 "${classSection.name}" 색깔 자동 생성 완료: ${color}`);
      
      return {
        ...classSection,
        color
      };
    } catch (error) {
      console.error(`❌ 수업 "${classSection.name}" 색깔 생성 실패:`, error);
      // 실패해도 원본 데이터 반환 (앱 동작 중단 방지)
      return classSection;
    }
  }

  /**
   * 여러 수업에 대한 색상을 일괄 처리합니다.
   * @param classSections 수업 목록
   * @returns 색상이 포함된 수업 목록
   */
  async ensureBatchClassSectionsHaveColors(classSections: ClassSection[]): Promise<ClassSection[]> {
    try {
      // 색상이 없는 수업들만 필터링
      const sectionsWithoutColor = classSections.filter(cs => !cs.color);
      
      if (sectionsWithoutColor.length === 0) {
        return classSections; // 모든 수업에 색깔 있음
      }
      
      console.log(`🎨 ${sectionsWithoutColor.length}개 수업 색깔 배치 생성 시작`);
      
      // 🚀 성능 최적화: 배치 크기 제한 (한 번에 처리할 수업 수 제한)
      const BATCH_SIZE = 50;
      const updatedSections = [...classSections];
      
      // 배치 단위로 처리
      for (let i = 0; i < sectionsWithoutColor.length; i += BATCH_SIZE) {
        const batch = admin.firestore().batch();
        const currentBatch = sectionsWithoutColor.slice(i, i + BATCH_SIZE);
        
        console.log(`🔄 배치 ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(sectionsWithoutColor.length / BATCH_SIZE)} 처리 중...`);
        
        // 현재 배치의 색상 생성 및 업데이트
        for (const section of currentBatch) {
          try {
            // 🚀 새로운 Class Section 기반 색상 생성 로직 사용
            const color = await this.colorService.generateColorForClassSection(
              section.id, 
              section.name,
              section.teacherId,
              section.classroomId,
              section.schedule
            );
            
            // 배치에 추가
            const docRef = admin.firestore().collection('class_sections').doc(section.id);
            batch.update(docRef, { color });
            
            // 메모리상 데이터도 업데이트
            const index = updatedSections.findIndex(cs => cs.id === section.id);
            if (index !== -1) {
              updatedSections[index] = { ...section, color };
            }
          } catch (error) {
            console.error(`수업 ${section.id} 색상 생성 실패:`, error);
            // 실패한 수업은 기본 색상 적용
            const index = updatedSections.findIndex(cs => cs.id === section.id);
            if (index !== -1) {
              updatedSections[index] = { ...section, color: '#3498db' };
            }
          }
        }
        
        // 현재 배치 커밋
        try {
          await batch.commit();
          console.log(`✅ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 완료 (${currentBatch.length}개 수업)`);
        } catch (error) {
          console.error(`배치 ${Math.floor(i / BATCH_SIZE) + 1} 커밋 실패:`, error);
          // 배치 커밋 실패 시 개별 업데이트 시도
          for (const section of currentBatch) {
            try {
              // 🚀 새로운 Class Section 기반 색상 생성 로직 사용
              const color = await this.colorService.generateColorForClassSection(
                section.id, 
                section.name,
                section.teacherId,
                section.classroomId,
                section.schedule
              );
              await this.updateClassSection(section.id, { color });
              
              // 메모리상 데이터도 업데이트
              const index = updatedSections.findIndex(cs => cs.id === section.id);
              if (index !== -1) {
                updatedSections[index] = { ...section, color };
              }
            } catch (error) {
              console.error(`개별 수업 ${section.id} 색상 업데이트 실패:`, error);
            }
          }
        }
      }
      
      console.log(`✅ ${sectionsWithoutColor.length}개 수업 색깔 배치 생성 완료`);
      
      return updatedSections;
      
    } catch (error) {
      console.error('배치 색상 생성 실패:', error);
      // 에러 발생 시 원본 데이터 반환
      return classSections;
    }
  }

  /**
   * 🔍 색상 충돌 해결 및 최적 색상 선택
   * @param classSectionId 수업 ID
   * @param proposedColor 제안된 색상
   * @param schedule 수업 스케줄
   * @returns 충돌이 없는 최적 색상
   */
  private async resolveColorConflict(
    classSectionId: string, 
    proposedColor: string, 
    schedule?: ClassSchedule[]
  ): Promise<string> {
    try {
      if (!schedule || schedule.length === 0) {
        return proposedColor; // 스케줄이 없으면 충돌 확인 불가
      }

      // 🕐 같은 시간대에 진행되는 다른 수업들의 색상 조회
      const conflictingSections = await this.findConflictingClassSections(schedule);
      
      if (conflictingSections.length === 0) {
        return proposedColor; // 충돌하는 수업 없음
      }

      // 🎨 색상 충돌 확인
      const hasConflict = this.colorService.detectColorConflict(
        conflictingSections.map(cs => ({
          id: cs.id,
          color: cs.color || '#3498db',
          schedule: cs.schedule
        })),
        proposedColor,
        schedule
      );

      if (!hasConflict) {
        return proposedColor; // 충돌 없음
      }

      // 🔄 충돌이 있는 경우 대체 색상 생성
      console.log('⚠️ 색상 충돌 감지, 대체 색상 생성 중...');
      
      // 다른 색상 팔레트에서 색상 선택
      const alternativeColors = this.colorService.getAvailableColors();
      const usedColors = conflictingSections.map(cs => cs.color).filter(Boolean);
      
      // 사용되지 않은 색상 중에서 선택
      for (const color of alternativeColors) {
        if (!usedColors.includes(color)) {
          // 충돌 재확인
          const stillHasConflict = this.colorService.detectColorConflict(
            conflictingSections.map(cs => ({
              id: cs.id,
              color: cs.color || '#3498db',
              schedule: cs.schedule
            })),
            color,
            schedule
          );
          
          if (!stillHasConflict) {
            console.log(`✅ 대체 색상 선택: ${color}`);
            return color;
          }
        }
      }

      // 모든 색상이 충돌하는 경우 기본 색상 반환
      console.log('⚠️ 모든 색상이 충돌, 기본 색상 사용');
      return '#3498db';

    } catch (error) {
      console.error('색상 충돌 해결 실패:', error);
      return proposedColor; // 에러 시 원래 색상 반환
    }
  }

  /**
   * 🕐 시간대가 겹치는 다른 수업들 조회
   * @param schedule 현재 수업 스케줄
   * @returns 시간대가 겹치는 수업 목록
   */
  private async findConflictingClassSections(schedule: ClassSchedule[]): Promise<ClassSection[]> {
    try {
      const allClassSections = await this.getAllClassSections();
      const conflictingSections: ClassSection[] = [];

      for (const classSection of allClassSections) {
        if (!classSection.schedule || classSection.schedule.length === 0) continue;

        // 시간대 겹침 확인
        const hasOverlap = this.checkScheduleOverlap(schedule, classSection.schedule);
        if (hasOverlap) {
          conflictingSections.push(classSection);
        }
      }

      return conflictingSections;
    } catch (error) {
      console.error('충돌하는 수업 조회 실패:', error);
      return [];
    }
  }

  /**
   * ⏰ 두 스케줄 간의 시간대 겹침 확인
   * @param schedule1 첫 번째 스케줄
   * @param schedule2 두 번째 스케줄
   * @returns 겹침 여부
   */
  private checkScheduleOverlap(schedule1: ClassSchedule[], schedule2: ClassSchedule[]): boolean {
    for (const s1 of schedule1) {
      for (const s2 of schedule2) {
        if (s1.dayOfWeek === s2.dayOfWeek) {
          // 시간 겹침 확인
          const start1 = this.timeToMinutes(s1.startTime);
          const end1 = this.timeToMinutes(s1.endTime);
          const start2 = this.timeToMinutes(s2.startTime);
          const end2 = this.timeToMinutes(s2.endTime);

          if (!(end1 <= start2 || end2 <= start1)) {
            return true; // 겹침
          }
        }
      }
    }
    return false;
  }

  /**
   * 🕐 시간을 분 단위로 변환
   * @param time 시간 문자열 (HH:MM)
   * @returns 분 단위 시간
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
