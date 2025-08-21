import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
import type { 
  Parent, 
  CreateParentRequest, 
  UpdateParentRequest, 
  ParentSearchParams 
} from '@shared/types';

export class ParentService extends BaseService {
  constructor() {
    super('parents');
  }

  // 부모 생성
  async createParent(data: CreateParentRequest): Promise<string> {
    const parentData: Omit<Parent, 'id'> = {
      ...data,
      childStudentIds: data.childStudentIds || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    return this.create(parentData);
  }

  // 부모 조회 (ID로)
  async getParentById(id: string): Promise<Parent | null> {
    return this.getById<Parent>(id);
  }

  // 부모 수정
  async updateParent(id: string, data: UpdateParentRequest): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await this.update(id, updateData);
  }

  // 부모 삭제
  async deleteParent(id: string): Promise<void> {
    await this.delete(id);
  }

  // 모든 부모 조회
  async getAllParents(): Promise<Parent[]> {
    return this.getAll<Parent>();
  }

  // 부모 검색
  async searchParents(params: ParentSearchParams): Promise<Parent[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName);

    // 이름으로 검색
    if (params.name) {
      query = query.where('name', '>=', params.name)
                   .where('name', '<=', params.name + '\uf8ff');
    }

    // 전화번호로 검색
    if (params.phone) {
      query = query.where('contactInfo.phone', '==', params.phone);
    }

    // 이메일로 검색
    if (params.email) {
      query = query.where('contactInfo.email', '==', params.email);
    }

    // 특정 학생의 부모 검색
    if (params.childStudentId) {
      query = query.where('childStudentIds', 'array-contains', params.childStudentId);
    }

    return this.search<Parent>(query);
  }

  // 자녀 추가
  async addChild(parentId: string, studentId: string): Promise<void> {
    const parent = await this.getParentById(parentId);
    if (!parent) {
      throw new Error('부모를 찾을 수 없습니다.');
    }

    if (!parent.childStudentIds.includes(studentId)) {
      const updatedChildIds = [...parent.childStudentIds, studentId];
      await this.update(parentId, { childStudentIds: updatedChildIds });
    }
  }

  // 자녀 제거
  async removeChild(parentId: string, studentId: string): Promise<void> {
    const parent = await this.getParentById(parentId);
    if (!parent) {
      throw new Error('부모를 찾을 수 없습니다.');
    }

    const updatedChildIds = parent.childStudentIds.filter(id => id !== studentId);
    await this.update(parentId, { childStudentIds: updatedChildIds });
  }

  // 자녀 수 조회
  async getChildCount(parentId: string): Promise<number> {
    const parent = await this.getParentById(parentId);
    if (!parent) return 0;
    return parent.childStudentIds.length;
  }

  // 특정 학생의 부모 조회
  async getParentByStudentId(studentId: string): Promise<Parent | null> {
    const query = this.db.collection(this.collectionName)
                         .where('childStudentIds', 'array-contains', studentId);
    
    const parents = await this.search<Parent>(query);
    return parents.length > 0 ? parents[0] : null;
  }

  // 부모 통계 조회
  async getParentStatistics(): Promise<{
    totalParents: number;
    parentsWithChildren: number;
    averageChildrenPerParent: number;
  }> {
    const parents = await this.getAllParents();
    const totalParents = parents.length;
    const parentsWithChildren = parents.filter(p => p.childStudentIds.length > 0).length;
    const totalChildren = parents.reduce((sum, p) => sum + p.childStudentIds.length, 0);
    const averageChildrenPerParent = totalParents > 0 ? totalChildren / totalParents : 0;

    return {
      totalParents,
      parentsWithChildren,
      averageChildrenPerParent: Math.round(averageChildrenPerParent * 100) / 100
    };
  }
}
