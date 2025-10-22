import { Request, Response } from 'express';
import { StudentTimetableService } from '../services/StudentTimetableService';
import { TimetableVersionService } from '../services/TimetableVersionService';
import { ClassSectionService } from '../services/ClassSectionService';
import { StudentService } from '../services/StudentService';
import { TeacherService } from '../services/TeacherService';
import { ClassroomService } from '../services/ClassroomService';
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

export class StudentTimetableController {
  private studentTimetableService: StudentTimetableService;
  private versionService: TimetableVersionService;
  private classSectionService: ClassSectionService;
  private studentService: StudentService;
  private teacherService: TeacherService;
  private classroomService: ClassroomService;

  constructor() {
    this.studentTimetableService = new StudentTimetableService();
    this.versionService = new TimetableVersionService();
    this.classSectionService = new ClassSectionService();
    this.studentService = new StudentService();
    this.teacherService = new TeacherService();
    this.classroomService = new ClassroomService();
  }

  // 학생 시간표 생성
  async createStudentTimetable(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateStudentTimetableRequest = req.body;
      
      // 학생 존재 여부 확인
      const student = await this.studentService.getStudentById(data.studentId);
      if (!student) {
        res.status(404).json({ 
          success: false, 
          error: 'Student not found' 
        });
        return;
      }

      // 이미 시간표가 존재하는지 확인
      const existingTimetable = await this.studentTimetableService.getStudentTimetableByStudentId(data.studentId);
      if (existingTimetable) {
        res.status(409).json({ 
          success: false, 
          error: 'Student timetable already exists' 
        });
        return;
      }

      const timetableId = await this.studentTimetableService.createStudentTimetable(data);
      
      res.status(201).json({
        success: true,
        data: { id: timetableId },
        message: 'Student timetable created successfully'
      });
    } catch (error) {
      console.error('Error creating student timetable:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 모든 학생 시간표 조회
  async getAllStudentTimetables(req: Request, res: Response): Promise<void> {
    try {
      const timetables = await this.studentTimetableService.getAllStudentTimetables();
      
      res.status(200).json({
        success: true,
        data: timetables,
        meta: {
          count: timetables.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching all student timetables:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 개별 학생 시간표 조회 (ID로)
  async getStudentTimetableById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const timetable = await this.studentTimetableService.getStudentTimetableById(id);
      
      if (!timetable) {
        res.status(404).json({
          success: false,
          error: 'Student timetable not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: timetable
      });
    } catch (error) {
      console.error('Error fetching student timetable by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 학생별 시간표 조회 (학생 ID로)
  async getStudentTimetableByStudentId(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      
      // 학생 존재 여부 확인
      const student = await this.studentService.getStudentById(studentId);
      if (!student) {
        res.status(404).json({
          success: false,
          error: 'Student not found'
        });
        return;
      }

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
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          classCount: completeTimetableData.classSections.length
        }
      };

      console.log(`✅ [DEBUG] Successfully retrieved timetable. Total classes: ${completeTimetableData.classSections.length}`);
      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching student timetable by student ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 학생별 버전 시간표 조회
  async getStudentTimetableByVersion(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, versionId } = req.params;

      // 학생 존재 여부 확인
      const student = await this.studentService.getStudentById(studentId);
      if (!student) {
        res.status(404).json({
          success: false,
          error: 'Student not found'
        });
        return;
      }

      // 버전 존재 여부 확인
      const version = await this.versionService.getVersionById(versionId);
      if (!version) {
        res.status(404).json({
          success: false,
          error: 'Timetable version not found'
        });
        return;
      }

      const timetable = await this.studentTimetableService.getStudentTimetableByStudentIdAndVersion(studentId, versionId);

      if (!timetable) {
        // 시간표가 없는 경우 빈 시간표로 응답
        const emptyTimetableData: CompleteTimetableData = {
          studentId: student.id,
          studentName: student.name,
          grade: student.grade || '',
          status: student.status || 'active',
          classSections: []
        };

        const response: any = {
          success: true,
          message: 'Student timetable retrieved successfully (empty)',
          data: emptyTimetableData,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            classCount: 0,
            versionId: versionId,
            versionName: version.name
          }
        };

        res.status(200).json(response);
        return;
      }

      // 완전한 시간표 데이터 구성
      const completeTimetableData = await this.buildCompleteTimetableData(studentId, timetable);

      const response: any = {
        success: true,
        message: 'Student timetable retrieved successfully',
        data: completeTimetableData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          classCount: completeTimetableData.classSections.length,
          versionId: versionId,
          versionName: version.name
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching student timetable by version:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 학생 시간표 수정
  async updateStudentTimetable(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateStudentTimetableRequest = req.body;
      
      // 시간표 존재 여부 확인
      const existingTimetable = await this.studentTimetableService.getStudentTimetableById(id);
      if (!existingTimetable) {
        res.status(404).json({
          success: false,
          error: 'Student timetable not found'
        });
        return;
      }

      await this.studentTimetableService.updateStudentTimetable(id, data);
      
      res.status(200).json({
        success: true,
        message: 'Student timetable updated successfully'
      });
    } catch (error) {
      console.error('Error updating student timetable:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 학생 시간표 삭제
  async deleteStudentTimetable(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // 시간표 존재 여부 확인
      const existingTimetable = await this.studentTimetableService.getStudentTimetableById(id);
      if (!existingTimetable) {
        res.status(404).json({
          success: false,
          error: 'Student timetable not found'
        });
        return;
      }

      await this.studentTimetableService.deleteStudentTimetable(id);
      
      res.status(200).json({
        success: true,
        message: 'Student timetable deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting student timetable:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 학생 시간표에 수업 추가
  async addClassToStudentTimetable(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { classSectionId } = req.body;
      
      if (!classSectionId) {
        res.status(400).json({
          success: false,
          error: 'Class section ID is required'
        });
        return;
      }

      // 시간표 존재 여부 확인
      const timetable = await this.studentTimetableService.getStudentTimetableById(id);
      if (!timetable) {
        res.status(404).json({
          success: false,
          error: 'Student timetable not found'
        });
        return;
      }

      // 수업 존재 여부 확인
      const classSection = await this.classSectionService.getClassSectionById(classSectionId);
      if (!classSection) {
        res.status(404).json({
          success: false,
          error: 'Class section not found'
        });
        return;
      }

      // 이미 추가된 수업인지 확인
      if (timetable.classSectionIds.includes(classSectionId)) {
        res.status(409).json({
          success: false,
          error: 'Class section already exists in timetable'
        });
        return;
      }

      // 수업 추가
      const updatedClassSectionIds = [...timetable.classSectionIds, classSectionId];
      await this.studentTimetableService.updateStudentTimetable(id, {
        classSectionIds: updatedClassSectionIds
      });

      res.status(200).json({
        success: true,
        message: 'Class section added to student timetable successfully'
      });
    } catch (error) {
      console.error('Error adding class to student timetable:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 학생 시간표에서 수업 제거
  async removeClassFromStudentTimetable(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { classSectionId } = req.body;
      
      if (!classSectionId) {
        res.status(400).json({
          success: false,
          error: 'Class section ID is required'
        });
        return;
      }

      // 시간표 존재 여부 확인
      const timetable = await this.studentTimetableService.getStudentTimetableById(id);
      if (!timetable) {
        res.status(404).json({
          success: false,
          error: 'Student timetable not found'
        });
        return;
      }

      // 수업이 시간표에 존재하는지 확인
      if (!timetable.classSectionIds.includes(classSectionId)) {
        res.status(404).json({
          success: false,
          error: 'Class section not found in timetable'
        });
        return;
      }

      // 수업 제거
      const updatedClassSectionIds = timetable.classSectionIds.filter(id => id !== classSectionId);
      await this.studentTimetableService.updateStudentTimetable(id, {
        classSectionIds: updatedClassSectionIds
      });

      res.status(200).json({
        success: true,
        message: 'Class section removed from student timetable successfully'
      });
    } catch (error) {
      console.error('Error removing class from student timetable:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 학생 시간표 검색
  async searchStudentTimetables(req: Request, res: Response): Promise<void> {
    try {
      const params: StudentTimetableSearchParams = req.query as any;
      const timetables = await this.studentTimetableService.searchStudentTimetables(params);
      
      res.status(200).json({
        success: true,
        data: timetables,
        meta: {
          count: timetables.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error searching student timetables:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 학생 시간표 통계 조회
  async getStudentTimetableStatistics(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.studentTimetableService.getStudentTimetableStatistics();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching student timetable statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 학생별 통합 시간표 조회 (수업 상세 정보 포함)
  async getStudentScheduleWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      
      // 학생 존재 여부 확인
      const student = await this.studentService.getStudentById(studentId);
      if (!student) {
        res.status(404).json({
          success: false,
          error: 'Student not found'
        });
        return;
      }

      // 학생 시간표 조회
      const timetable = await this.studentTimetableService.getStudentTimetableByStudentId(studentId);
      
      if (!timetable) {
        res.status(404).json({
          success: false,
          error: 'Student timetable not found'
        });
        return;
      }

      // 수업 상세 정보 조회
      const classSectionsWithDetails = [];
      for (const classSectionId of timetable.classSectionIds) {
        try {
          const classSection = await this.classSectionService.getClassSectionWithDetailsById(classSectionId);
          if (classSection) {
            classSectionsWithDetails.push(classSection);
          }
        } catch (error) {
          console.warn(`Failed to fetch class section ${classSectionId}:`, error);
        }
      }

      // 응답 데이터 구성
      const responseData = {
        studentId: student.id,
        studentName: student.name,
        grade: student.grade,
        status: student.status,
        classSections: classSectionsWithDetails.map(cs => ({
          id: cs.id,
          courseName: cs.course?.name || 'Unknown Course',
          teacherName: cs.teacher?.name || 'Unknown Teacher',
          classroomName: cs.classroom?.name || 'Unknown Classroom',
          schedule: cs.schedule || [],
          // 🎨 Phase 4: 기존 색상 생성 로직 제거, DB 저장 색상 사용
          color: cs.color || '#3498db'
        }))
      };

      res.status(200).json({
        success: true,
        data: responseData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          classCount: classSectionsWithDetails.length
        }
      });
    } catch (error) {
      console.error('Error fetching student schedule with details:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

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

            // 5. 색상 사용 (DB에 저장된 색상 사용, 없으면 기본 색상)
            // 🎨 Phase 4: 기존 색상 생성 로직 제거, DB 저장 색상 사용
            const color = classSection.color || '#3498db';

            // 6. 스케줄 정보 정리 (타입 안전성 확보)
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

  // 학생 ID 기반으로 수업 추가 (새로운 방식)
  async addClassToStudentTimetableByStudentId(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const { classSectionId } = req.body;
      
      if (!classSectionId) {
        res.status(400).json({
          success: false,
          error: 'Class section ID is required'
        });
        return;
      }

      // 학생 존재 여부 확인
      const student = await this.studentService.getStudentById(studentId);
      if (!student) {
        res.status(404).json({
          success: false,
          error: 'Student not found'
        });
        return;
      }

      // ✅ 활성 버전 조회
      const activeVersion = await this.versionService.getActiveVersion();
      if (!activeVersion) {
        res.status(404).json({
          success: false,
          error: 'No active timetable version found'
        });
        return;
      }

      // 학생 시간표 조회 (없으면 생성)
      let timetable = await this.studentTimetableService.getStudentTimetableByStudentId(studentId, activeVersion.id);

      if (!timetable) {
        // 시간표가 없으면 새로 생성
        const newTimetableId = await this.studentTimetableService.createStudentTimetable({
          studentId,
          versionId: activeVersion.id,
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

      // 수업 존재 여부 확인
      const classSection = await this.classSectionService.getClassSectionById(classSectionId);
      if (!classSection) {
        res.status(404).json({
          success: false,
          error: 'Class section not found'
        });
        return;
      }

      // 이미 추가된 수업인지 확인
      if (timetable.classSectionIds.includes(classSectionId)) {
        res.status(409).json({
          success: false,
          error: 'Class section already exists in timetable'
        });
        return;
      }

      // 수업 추가
      const updatedClassSectionIds = [...timetable.classSectionIds, classSectionId];
      await this.studentTimetableService.updateStudentTimetable(timetable.id, {
        classSectionIds: updatedClassSectionIds
      });

      // ✅ 실제 등록된 학생 수로 currentStudents 업데이트
      await this.updateCurrentStudentsFromActualCount(classSectionId);

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
      console.error('Error adding class to student timetable by student ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 학생 ID 기반으로 수업 제거 (새로운 방식)
  async removeClassFromStudentTimetableByStudentId(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const { classSectionId } = req.body;
      
      if (!classSectionId) {
        res.status(400).json({
          success: false,
          error: 'Class section ID is required'
        });
        return;
      }

      // 학생 존재 여부 확인
      const student = await this.studentService.getStudentById(studentId);
      if (!student) {
        res.status(404).json({
          success: false,
          error: 'Student not found'
        });
        return;
      }

      // 학생 시간표 조회
      const timetable = await this.studentTimetableService.getStudentTimetableByStudentId(studentId);
      if (!timetable) {
        res.status(404).json({
          success: false,
          error: 'Student timetable not found'
        });
        return;
      }

      // 수업이 시간표에 존재하는지 확인
      if (!timetable.classSectionIds.includes(classSectionId)) {
        res.status(404).json({
          success: false,
          error: 'Class section not found in timetable'
        });
        return;
      }

      // 수업 제거
      const updatedClassSectionIds = timetable.classSectionIds.filter(id => id !== classSectionId);
      await this.studentTimetableService.updateStudentTimetable(timetable.id, {
        classSectionIds: updatedClassSectionIds
      });

      // ✅ 실제 등록된 학생 수로 currentStudents 업데이트
      await this.updateCurrentStudentsFromActualCount(classSectionId);

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
      console.error('Error removing class from student timetable by student ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ✅ 헬퍼 메서드: 실제 등록된 학생 수로 currentStudents 업데이트
  private async updateCurrentStudentsFromActualCount(classSectionId: string): Promise<void> {
    try {
      // 실제 등록된 학생 수 계산
      const enrolledStudents = await this.classSectionService.getEnrolledStudents(classSectionId);
      const actualStudentCount = enrolledStudents.length;

      // currentStudents를 실제 값으로 업데이트
      await this.classSectionService.updateClassSection(classSectionId, {
        currentStudents: actualStudentCount
      });

      console.log(`✅ ClassSection ${classSectionId} currentStudents 업데이트: ${actualStudentCount}`);
    } catch (error) {
      console.error('❌ currentStudents 업데이트 실패:', error);
    }
  }

  // 버전별 수업 추가
  async addClassToStudentTimetableByVersion(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, versionId } = req.params;
      const { classSectionId } = req.body;

      if (!classSectionId) {
        res.status(400).json({
          success: false,
          error: 'Class section ID is required'
        });
        return;
      }

      // 학생 존재 여부 확인
      const student = await this.studentService.getStudentById(studentId);
      if (!student) {
        res.status(404).json({
          success: false,
          error: 'Student not found'
        });
        return;
      }

      // 버전 존재 여부 확인
      const version = await this.versionService.getVersionById(versionId);
      if (!version) {
        res.status(404).json({
          success: false,
          error: 'Timetable version not found'
        });
        return;
      }

      // 학생 시간표 조회 (없으면 생성)
      let timetable = await this.studentTimetableService.getStudentTimetableByStudentIdAndVersion(studentId, versionId);

      if (!timetable) {
        // 시간표가 없으면 새로 생성
        const newTimetableId = await this.studentTimetableService.createStudentTimetable({
          studentId,
          versionId: versionId,
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
      }

      if (!timetable) {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve timetable'
        });
        return;
      }

      // 수업 추가
      const updatedClassSectionIds = [...timetable.classSectionIds, classSectionId];
      await this.studentTimetableService.updateStudentTimetable(timetable.id, {
        classSectionIds: updatedClassSectionIds
      });

      // 업데이트된 시간표 조회
      const updatedTimetable = await this.studentTimetableService.getStudentTimetableByStudentIdAndVersion(studentId, versionId);

      if (!updatedTimetable) {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve updated timetable'
        });
        return;
      }

      // 완전한 시간표 데이터 구성
      const completeTimetableData = await this.buildCompleteTimetableData(studentId, updatedTimetable);

      const response: TimetableApiResponse = {
        success: true,
        message: 'Class added successfully',
        data: completeTimetableData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          classCount: completeTimetableData.classSections.length
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error adding class to student timetable by version:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 버전별 수업 제거
  async removeClassFromStudentTimetableByVersion(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, versionId } = req.params;
      const { classSectionId } = req.body;

      if (!classSectionId) {
        res.status(400).json({
          success: false,
          error: 'Class section ID is required'
        });
        return;
      }

      // 학생 존재 여부 확인
      const student = await this.studentService.getStudentById(studentId);
      if (!student) {
        res.status(404).json({
          success: false,
          error: 'Student not found'
        });
        return;
      }

      // 버전 존재 여부 확인
      const version = await this.versionService.getVersionById(versionId);
      if (!version) {
        res.status(404).json({
          success: false,
          error: 'Timetable version not found'
        });
        return;
      }

      // 학생 시간표 조회
      const timetable = await this.studentTimetableService.getStudentTimetableByStudentIdAndVersion(studentId, versionId);

      if (!timetable) {
        res.status(404).json({
          success: false,
          error: 'Student timetable not found'
        });
        return;
      }

      // 수업 제거
      const updatedClassSectionIds = timetable.classSectionIds.filter(id => id !== classSectionId);
      await this.studentTimetableService.updateStudentTimetable(timetable.id, {
        classSectionIds: updatedClassSectionIds
      });

      // 업데이트된 시간표 조회
      const updatedTimetable = await this.studentTimetableService.getStudentTimetableByStudentIdAndVersion(studentId, versionId);

      if (!updatedTimetable) {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve updated timetable'
        });
        return;
      }

      // 완전한 시간표 데이터 구성
      const completeTimetableData = await this.buildCompleteTimetableData(studentId, updatedTimetable);

      const response: TimetableApiResponse = {
        success: true,
        message: 'Class removed successfully',
        data: completeTimetableData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          classCount: completeTimetableData.classSections.length
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error removing class from student timetable by version:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
