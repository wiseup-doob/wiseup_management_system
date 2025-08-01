import {Request, Response} from "express";
import {ParentsService} from "./parents.service";
import {
  CreateParentRequest,
  UpdateParentRequest,
  CreateParentStudentRequest,
  ParentFilter,
} from "./parents.types";

export class ParentsController {
  private parentsService = new ParentsService();

  // 부모 생성
  async createParent(req: Request, res: Response): Promise<void> {
    try {
      const parentData: CreateParentRequest = req.body;
      const parent = await this.parentsService.createParent(parentData);
      res.status(201).json({success: true, data: parent});
    } catch (error) {
      res.status(500).json({success: false, error: "부모 생성에 실패했습니다."});
    }
  }

  // 부모 조회
  async getParent(req: Request, res: Response): Promise<void> {
    try {
      const {parentId} = req.params;
      const parent = await this.parentsService.getParent(parentId);

      if (!parent) {
        res.status(404).json({success: false, error: "부모를 찾을 수 없습니다."});
        return;
      }

      res.json({success: true, data: parent});
    } catch (error) {
      res.status(500).json({success: false, error: "부모 조회에 실패했습니다."});
    }
  }

  // 사용자 ID로 부모 조회
  async getParentByUserId(req: Request, res: Response): Promise<void> {
    try {
      const {userId} = req.params;
      const parent = await this.parentsService.getParentByUserId(userId);

      if (!parent) {
        res.status(404).json({success: false, error: "부모를 찾을 수 없습니다."});
        return;
      }

      res.json({success: true, data: parent});
    } catch (error) {
      res.status(500).json({success: false, error: "부모 조회에 실패했습니다."});
    }
  }

  // 모든 부모 조회
  async getAllParents(req: Request, res: Response): Promise<void> {
    try {
      const filter: ParentFilter = req.query;
      const parents = await this.parentsService.getAllParents(filter);
      res.json({success: true, data: parents});
    } catch (error) {
      res.status(500).json({success: false, error: "부모 목록 조회에 실패했습니다."});
    }
  }

  // 부모 업데이트
  async updateParent(req: Request, res: Response): Promise<void> {
    try {
      const {parentId} = req.params;
      const updateData: UpdateParentRequest = req.body;
      const parent = await this.parentsService.updateParent(parentId, updateData);

      if (!parent) {
        res.status(404).json({success: false, error: "부모를 찾을 수 없습니다."});
        return;
      }

      res.json({success: true, data: parent});
    } catch (error) {
      res.status(500).json({success: false, error: "부모 업데이트에 실패했습니다."});
    }
  }

  // 부모 삭제
  async deleteParent(req: Request, res: Response): Promise<void> {
    try {
      const {parentId} = req.params;
      const success = await this.parentsService.deleteParent(parentId);

      if (!success) {
        res.status(404).json({success: false, error: "부모를 찾을 수 없습니다."});
        return;
      }

      res.json({success: true, message: "부모가 삭제되었습니다."});
    } catch (error) {
      res.status(500).json({success: false, error: "부모 삭제에 실패했습니다."});
    }
  }

  // 부모-학생 관계 생성
  async createParentStudent(req: Request, res: Response): Promise<void> {
    try {
      const relationship: CreateParentStudentRequest = req.body;
      const parentStudent = await this.parentsService.createParentStudent(relationship);
      res.status(201).json({success: true, data: parentStudent});
    } catch (error) {
      res.status(500).json({success: false, error: "부모-학생 관계 생성에 실패했습니다."});
    }
  }

  // 부모의 모든 학생 조회
  async getStudentsByParent(req: Request, res: Response): Promise<void> {
    try {
      const {parentId} = req.params;
      const students = await this.parentsService.getStudentsByParent(parentId);
      res.json({success: true, data: students});
    } catch (error) {
      res.status(500).json({success: false, error: "학생 목록 조회에 실패했습니다."});
    }
  }

  // 학생의 모든 부모 조회
  async getParentsByStudent(req: Request, res: Response): Promise<void> {
    try {
      const {studentId} = req.params;
      const parents = await this.parentsService.getParentsByStudent(studentId);
      res.json({success: true, data: parents});
    } catch (error) {
      res.status(500).json({success: false, error: "부모 목록 조회에 실패했습니다."});
    }
  }

  // 부모와 학생 정보를 포함한 상세 조회
  async getParentWithStudents(req: Request, res: Response): Promise<void> {
    try {
      const {parentId} = req.params;
      const parentWithStudents = await this.parentsService.getParentWithStudents(parentId);

      if (!parentWithStudents) {
        res.status(404).json({success: false, error: "부모를 찾을 수 없습니다."});
        return;
      }

      res.json({success: true, data: parentWithStudents});
    } catch (error) {
      res.status(500).json({success: false, error: "부모 상세 조회에 실패했습니다."});
    }
  }

  // 학생과 부모 정보를 포함한 상세 조회
  async getStudentWithParents(req: Request, res: Response): Promise<void> {
    try {
      const {studentId} = req.params;
      const studentWithParents = await this.parentsService.getStudentWithParents(studentId);

      if (!studentWithParents) {
        res.status(404).json({success: false, error: "학생을 찾을 수 없습니다."});
        return;
      }

      res.json({success: true, data: studentWithParents});
    } catch (error) {
      res.status(500).json({success: false, error: "학생 상세 조회에 실패했습니다."});
    }
  }

  // 부모-학생 관계 삭제
  async deleteParentStudent(req: Request, res: Response): Promise<void> {
    try {
      const {parentId, studentId} = req.params;
      const success = await this.parentsService.deleteParentStudent(parentId, studentId);

      if (!success) {
        res.status(404).json({success: false, error: "부모-학생 관계를 찾을 수 없습니다."});
        return;
      }

      res.json({success: true, message: "부모-학생 관계가 삭제되었습니다."});
    } catch (error) {
      res.status(500).json({success: false, error: "부모-학생 관계 삭제에 실패했습니다."});
    }
  }
}
