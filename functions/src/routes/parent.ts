import { Router } from 'express';
import { ParentController } from '../controllers/ParentController';

const router = Router();
const parentController = new ParentController();

// 부모 생성
router.post('/', (req, res) => parentController.createParent(req, res));

// 모든 부모 조회
router.get('/', (req, res) => parentController.getAllParents(req, res));

// 부모 검색
router.get('/search', (req, res) => parentController.searchParents(req, res));

// 부모 통계 조회
router.get('/statistics', (req, res) => parentController.getParentStatistics(req, res));

// 특정 학생의 부모 조회
router.get('/by-student/:studentId', (req, res) => parentController.getParentByStudentId(req, res));

// 특정 부모 조회
router.get('/:id', (req, res) => parentController.getParentById(req, res));

// 부모 정보 수정
router.put('/:id', (req, res) => parentController.updateParent(req, res));

// 자녀 추가
router.post('/:parentId/children', (req, res) => parentController.addChild(req, res));

// 자녀 제거
router.delete('/:parentId/children/:studentId', (req, res) => parentController.removeChild(req, res));

// 부모 삭제
router.delete('/:id', (req, res) => parentController.deleteParent(req, res));

export { router as parentRoutes };
