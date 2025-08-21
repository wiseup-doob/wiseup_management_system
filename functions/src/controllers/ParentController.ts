import { Request, Response } from 'express';
import { ParentService } from '../services/ParentService';
import type { CreateParentRequest, UpdateParentRequest, ParentSearchParams } from '@shared/types';

export class ParentController {
  private parentService: ParentService;

  constructor() {
    this.parentService = new ParentService();
  }

  // 부모 생성
  async createParent(req: Request, res: Response): Promise<void> {
    try {
      const parentData: CreateParentRequest = req.body;
      const parentId = await this.parentService.createParent(parentData);

      res.status(201).json({
        success: true,
        message: '부모 정보가 성공적으로 생성되었습니다.',
        data: { id: parentId }
      });
    } catch (error) {
      console.error('부모 생성 오류:', error);
      res.status(500).json({
        success: false,
        message: '부모 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 부모 조회 (ID로)
  async getParentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parent = await this.parentService.getParentById(id);

      if (!parent) {
        res.status(404).json({
          success: false,
          message: '부모를 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: parent
      });
    } catch (error) {
      console.error('부모 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '부모 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 부모 수정
  async updateParent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateParentRequest = req.body;

      await this.parentService.updateParent(id, updateData);

      res.json({
        success: true,
        message: '부모 정보가 성공적으로 수정되었습니다.'
      });
    } catch (error) {
      console.error('부모 수정 오류:', error);
      res.status(500).json({
        success: false,
        message: '부모 수정 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 부모 삭제
  async deleteParent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.parentService.deleteParent(id);

      res.json({
        success: true,
        message: '부모 정보가 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('부모 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: '부모 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 모든 부모 조회
  async getAllParents(req: Request, res: Response): Promise<void> {
    try {
      const parents = await this.parentService.getAllParents();

      res.json({
        success: true,
        data: parents,
        count: parents.length
      });
    } catch (error) {
      console.error('부모 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '부모 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 부모 검색
  async searchParents(req: Request, res: Response): Promise<void> {
    try {
      const searchParams: ParentSearchParams = req.query as any;
      const parents = await this.parentService.searchParents(searchParams);

      res.json({
        success: true,
        data: parents,
        count: parents.length
      });
    } catch (error) {
      console.error('부모 검색 오류:', error);
      res.status(500).json({
        success: false,
        message: '부모 검색 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 자녀 추가
  async addChild(req: Request, res: Response): Promise<void> {
    try {
      const { parentId } = req.params;
      const { studentId } = req.body;

      if (!studentId) {
        res.status(400).json({
          success: false,
          message: '학생 ID가 필요합니다.'
        });
        return;
      }

      await this.parentService.addChild(parentId, studentId);

      res.json({
        success: true,
        message: '자녀가 성공적으로 추가되었습니다.'
      });
    } catch (error) {
      console.error('자녀 추가 오류:', error);
      res.status(500).json({
        success: false,
        message: '자녀 추가 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 자녀 제거
  async removeChild(req: Request, res: Response): Promise<void> {
    try {
      const { parentId, studentId } = req.params;

      await this.parentService.removeChild(parentId, studentId);

      res.json({
        success: true,
        message: '자녀가 성공적으로 제거되었습니다.'
      });
    } catch (error) {
      console.error('자녀 제거 오류:', error);
      res.status(500).json({
        success: false,
        message: '자녀 제거 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 특정 학생의 부모 조회
  async getParentByStudentId(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const parent = await this.parentService.getParentByStudentId(studentId);

      if (!parent) {
        res.status(404).json({
          success: false,
          message: '해당 학생의 부모를 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: parent
      });
    } catch (error) {
      console.error('학생 부모 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '학생 부모 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 부모 통계 조회
  async getParentStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.parentService.getParentStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('부모 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '부모 통계 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
}
