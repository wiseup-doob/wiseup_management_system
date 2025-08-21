import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
import type { 
  Course, 
  CreateCourseRequest, 
  UpdateCourseRequest, 
  CourseSearchParams 
} from '@shared/types';

export class CourseService extends BaseService {
  constructor() {
    super('courses');
  }

  // 강의 생성
  async createCourse(data: CreateCourseRequest): Promise<string> {
    const courseData: Omit<Course, 'id'> = {
      ...data,
      isActive: data.isActive ?? true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return this.create(courseData);
  }

  // 강의 조회 (ID로)
  async getCourseById(id: string): Promise<Course | null> {
    return this.getById<Course>(id);
  }

  // 강의 수정
  async updateCourse(id: string, data: UpdateCourseRequest): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await this.update(id, updateData);
  }

  // 강의 삭제
  async deleteCourse(id: string): Promise<void> {
    await this.delete(id);
  }

  // 모든 강의 조회
  async getAllCourses(): Promise<Course[]> {
    return this.getAll<Course>();
  }

  // 강의 검색
  async searchCourses(params: CourseSearchParams): Promise<Course[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName);

    // 강의명으로 검색
    if (params.name) {
      query = query.where('name', '>=', params.name)
                   .where('name', '<=', params.name + '\uf8ff');
    }

    // 과목으로 검색
    if (params.subject) {
      query = query.where('subject', '==', params.subject);
    }

    // 난이도로 검색
    if (params.difficulty) {
      query = query.where('difficulty', '==', params.difficulty);
    }

    // 활성화 상태로 검색
    if (params.isActive !== undefined) {
      query = query.where('isActive', '==', params.isActive);
    }

    return this.search<Course>(query);
  }

  // 강의 통계 조회
  async getCourseStatistics(): Promise<{
    totalCourses: number;
  }> {
    const courses = await this.getAllCourses();
    
    return {
      totalCourses: courses.length
    };
  }

  // 강의 상태 변경 (활성/비활성)
  async toggleCourseStatus(id: string): Promise<void> {
    const course = await this.getCourseById(id);
    
    if (!course) {
      throw new Error('강의를 찾을 수 없습니다.');
    }

    await this.updateCourse(id, {
      isActive: !course.isActive
    });
  }
}
