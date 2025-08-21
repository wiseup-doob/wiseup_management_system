import { Request, Response } from 'express';
import { CourseService } from '../services/CourseService';
import type { CreateCourseRequest, UpdateCourseRequest, CourseSearchParams } from '@shared/types';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  // 강의 생성
  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const courseData: CreateCourseRequest = req.body;
      const courseId = await this.courseService.createCourse(courseData);

      res.status(201).json({
        success: true,
        message: '강의가 성공적으로 생성되었습니다.',
        data: { id: courseId }
      });
    } catch (error) {
      console.error('강의 생성 오류:', error);
      res.status(500).json({
        success: false,
        message: '강의 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강의 조회 (ID로)
  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const course = await this.courseService.getCourseById(id);

      if (!course) {
        res.status(404).json({
          success: false,
          message: '강의를 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('강의 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '강의 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강의 수정
  async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateCourseRequest = req.body;

      await this.courseService.updateCourse(id, updateData);

      res.json({
        success: true,
        message: '강의 정보가 성공적으로 수정되었습니다.'
      });
    } catch (error) {
      console.error('강의 수정 오류:', error);
      res.status(500).json({
        success: false,
        message: '강의 수정 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강의 삭제
  async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.courseService.deleteCourse(id);

      res.json({
        success: true,
        message: '강의가 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('강의 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '강의 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 모든 강의 조회
  async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const courses = await this.courseService.getAllCourses();

      res.json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error) {
      console.error('강의 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '강의 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강의 검색
  async searchCourses(req: Request, res: Response): Promise<void> {
    try {
      const searchParams: CourseSearchParams = req.query as any;
      const courses = await this.courseService.searchCourses(searchParams);

      res.json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error) {
      console.error('강의 검색 오류:', error);
      res.status(500).json({
        success: false,
        message: '강의 검색 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강의 통계 조회
  async getCourseStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.courseService.getCourseStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('강의 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '강의 통계 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 강의 상태 변경 (활성/비활성)
  async toggleCourseStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.courseService.toggleCourseStatus(id);

      res.json({
        success: true,
        message: '강의 상태가 성공적으로 변경되었습니다.'
      });
    } catch (error) {
      console.error('강의 상태 변경 오류:', error);
      res.status(500).json({
        success: false,
        message: '강의 상태 변경 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
}
