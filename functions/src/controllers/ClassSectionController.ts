import { Request, Response } from 'express';
import { ClassSectionService } from '../services/ClassSectionService';
import type { CreateClassSectionRequest, UpdateClassSectionRequest, ClassSectionSearchParams } from '@shared/types';

export class ClassSectionController {
  private classSectionService: ClassSectionService;

  constructor() {
    this.classSectionService = new ClassSectionService();
  }

  // 수업 생성
  async createClassSection(req: Request, res: Response): Promise<void> {
    try {
      const classSectionData: CreateClassSectionRequest = req.body;
      const classSectionId = await this.classSectionService.createClassSection(classSectionData);

      res.status(201).json({
        success: true,
        message: '수업이 성공적으로 생성되었습니다.',
        data: { id: classSectionId }
      });
    } catch (error) {
      console.error('수업 생성 오류:', error);
      res.status(500).json({
        success: false,
        message: '수업 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 수업 조회 (ID로)
  async getClassSectionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const classSection = await this.classSectionService.getClassSectionById(id);

      if (!classSection) {
        res.status(404).json({
          success: false,
          message: '수업을 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: classSection
      });
    } catch (error) {
      console.error('수업 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '수업 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 수업 수정
  async updateClassSection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateClassSectionRequest = req.body;

      await this.classSectionService.updateClassSection(id, updateData);

      res.json({
        success: true,
        message: '수업 정보가 성공적으로 수정되었습니다.'
      });
    } catch (error) {
      console.error('수업 수정 오류:', error);
      res.status(500).json({
        success: false,
        message: '수업 수정 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 수업 삭제
  async deleteClassSection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.classSectionService.deleteClassSection(id);

      res.json({
        success: true,
        message: '수업이 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('수업 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '수업 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // Course와 ClassSection을 한번에 생성
  async createClassWithCourse(req: Request, res: Response): Promise<void> {
    try {
      const {
        courseName,
        subject,
        difficulty,
        name,
        teacherId,
        classroomId,
        schedule,
        maxStudents,
        description,
        notes,
        color // 색상 필드 추가
      } = req.body;

      // 필수 필드 검증
      if (!courseName || !subject || !name || !teacherId || !classroomId || !schedule || !maxStudents) {
        res.status(400).json({
          success: false,
          message: '필수 필드가 누락되었습니다.'
        });
        return;
      }

      const result = await this.classSectionService.createClassWithCourse({
        courseName,
        subject,
        difficulty,
        name,
        teacherId,
        classroomId,
        schedule,
        maxStudents,
        description,
        notes,
        color // 색상 필드 전달
      });

      res.status(201).json({
        success: true,
        message: 'Course와 ClassSection이 성공적으로 생성되었습니다.',
        data: result
      });
    } catch (error) {
      console.error('Course + ClassSection 생성 오류:', error);
      res.status(500).json({
        success: false,
        message: 'Course와 ClassSection 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 모든 수업 조회
  async getAllClassSections(req: Request, res: Response): Promise<void> {
    try {
      const versionId = req.query.versionId as string | undefined;
      const classSections = await this.classSectionService.getAllClassSections(versionId);

      res.json({
        success: true,
        data: classSections,
        count: classSections.length
      });
    } catch (error) {
      console.error('수업 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '수업 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 모든 수업을 상세 정보와 함께 조회 (Course, Teacher, Classroom 포함)
  async getAllClassSectionsWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const versionId = req.query.versionId as string | undefined;
      const classSectionsWithDetails = await this.classSectionService.getClassSectionsWithDetails(versionId);

      res.json({
        success: true,
        data: classSectionsWithDetails,
        count: classSectionsWithDetails.length
      });
    } catch (error) {
      console.error('수업 상세 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '수업 상세 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 특정 수업을 상세 정보와 함께 조회
  async getClassSectionWithDetailsById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const classSectionWithDetails = await this.classSectionService.getClassSectionWithDetailsById(id);

      if (!classSectionWithDetails) {
        res.status(404).json({
          success: false,
          message: '수업을 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: classSectionWithDetails
      });
    } catch (error) {
      console.error('수업 상세 정보 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '수업 상세 정보 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 수업 검색
  async searchClassSections(req: Request, res: Response): Promise<void> {
    try {
      const searchParams: ClassSectionSearchParams = req.query as any;
      const classSections = await this.classSectionService.searchClassSections(searchParams);

      res.json({
        success: true,
        data: classSections,
        count: classSections.length
      });
    } catch (error) {
      console.error('수업 검색 오류:', error);
      res.status(500).json({
        success: false,
        message: '수업 검색 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 수업 통계 조회
  async getClassSectionStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.classSectionService.getClassSectionStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('수업 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '수업 통계 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 시간 충돌 검증
  async validateTimeConflict(req: Request, res: Response): Promise<void> {
    try {
      const { teacherId, classroomId, dayOfWeek, startTime, endTime, excludeId } = req.body;

      // 필수 필드 검증
      if (!teacherId || !classroomId || !dayOfWeek || !startTime || !endTime) {
        res.status(400).json({
          success: false,
          message: '필수 필드가 누락되었습니다. (teacherId, classroomId, dayOfWeek, startTime, endTime)'
        });
        return;
      }

      const hasConflict = await this.classSectionService.validateTimeConflict(
        teacherId, 
        classroomId, 
        dayOfWeek, 
        startTime, 
        endTime, 
        excludeId
      );

      res.json({
        success: true,
        data: { 
          hasConflict,
          message: hasConflict ? '시간 충돌이 발생합니다.' : '시간 충돌이 없습니다.'
        }
      });
    } catch (error) {
      console.error('시간 충돌 검증 오류:', error);
      res.status(500).json({
        success: false,
        message: '시간 충돌 검증 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 시간표 통계 조회
  async getScheduleStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.classSectionService.getScheduleStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('시간표 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '시간표 통계 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 수업 의존성 확인
  async getClassSectionDependencies(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dependencies = await this.classSectionService.getClassSectionDependencies(id);

      res.json({
        success: true,
        data: dependencies
      });
    } catch (error) {
      console.error('수업 의존성 확인 오류:', error);
      res.status(500).json({
        success: false,
        message: '수업 의존성 확인 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 수업 계층적 삭제
  async deleteClassSectionHierarchically(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.classSectionService.deleteClassSectionHierarchically(id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('수업 계층적 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '수업 계층적 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 수업에 학생 추가
  async addStudentToClass(req: Request, res: Response): Promise<void> {
    try {
      const { id: classSectionId, studentId } = req.params;
      const versionId = req.query.versionId as string | undefined;

      // 필수 파라미터 검증
      if (!classSectionId || !studentId) {
        res.status(400).json({
          success: false,
          message: '수업 ID와 학생 ID가 필요합니다.'
        });
        return;
      }

      await this.classSectionService.addStudentToClass(classSectionId, studentId, versionId);

      res.json({
        success: true,
        message: '학생이 수업에 성공적으로 추가되었습니다.'
      });
    } catch (error) {
      console.error('학생 추가 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 추가 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 수업에서 학생 제거
  async removeStudentFromClass(req: Request, res: Response): Promise<void> {
    try {
      const { id: classSectionId, studentId } = req.params;
      const versionId = req.query.versionId as string | undefined;

      // 필수 파라미터 검증
      if (!classSectionId || !studentId) {
        res.status(400).json({
          success: false,
          message: '수업 ID와 학생 ID가 필요합니다.'
        });
        return;
      }

      await this.classSectionService.removeStudentFromClass(classSectionId, studentId, versionId);

      res.json({
        success: true,
        message: '학생이 수업에서 성공적으로 제거되었습니다.'
      });
    } catch (error) {
      console.error('학생 제거 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 제거 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 수업에 등록된 학생 목록 조회
  async getEnrolledStudents(req: Request, res: Response): Promise<void> {
    try {
      const { id: classSectionId } = req.params;
      const versionId = req.query.versionId as string | undefined;

      // 필수 파라미터 검증
      if (!classSectionId) {
        res.status(400).json({
          success: false,
          message: '수업 ID가 필요합니다.'
        });
        return;
      }

      const enrolledStudents = await this.classSectionService.getEnrolledStudents(classSectionId, versionId);

      res.json({
        success: true,
        data: enrolledStudents
      });
    } catch (error) {
      console.error('등록된 학생 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '등록된 학생 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // ✅ 데이터 일관성 검증 및 수정 API
  async validateAndFixCurrentStudents(req: Request, res: Response): Promise<void> {
    try {
      const { id: classSectionId } = req.params;

      // 필수 파라미터 검증
      if (!classSectionId) {
        res.status(400).json({
          success: false,
          message: '수업 ID가 필요합니다.'
        });
        return;
      }

      // 실제 등록된 학생 수 조회
      const enrolledStudents = await this.classSectionService.getEnrolledStudents(classSectionId);
      const actualStudentCount = enrolledStudents.length;

      // 현재 DB 값 조회
      const classSection = await this.classSectionService.getClassSectionById(classSectionId);
      if (!classSection) {
        res.status(404).json({
          success: false,
          message: '수업을 찾을 수 없습니다.'
        });
        return;
      }

      const dbStudentCount = classSection.currentStudents || 0;

      if (dbStudentCount !== actualStudentCount) {
        // 불일치 발견 시 자동 수정
        await this.classSectionService.updateClassSection(classSectionId, {
          currentStudents: actualStudentCount
        });

        res.status(200).json({
          success: true,
          message: '데이터 불일치가 수정되었습니다.',
          data: {
            classSectionId,
            oldValue: dbStudentCount,
            newValue: actualStudentCount,
            fixed: true,
            enrolledStudents: enrolledStudents.length
          }
        });
      } else {
        res.status(200).json({
          success: true,
          message: '데이터가 일치합니다.',
          data: {
            classSectionId,
            currentStudents: actualStudentCount,
            fixed: false,
            enrolledStudents: enrolledStudents.length
          }
        });
      }

    } catch (error) {
      console.error('데이터 일관성 검증 오류:', error);
      res.status(500).json({
        success: false,
        message: '데이터 일관성 검증 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
}
