import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../config/container';
import { StudentController } from '../controllers/StudentController';
import { API_ENDPOINTS } from '@shared/constants';

// Express Router 생성
const router = Router();

// 컨트롤러 해결 함수
const getStudentController = (): StudentController => {
  return container.resolve<StudentController>('StudentController');
};

// 에러 핸들링 래퍼
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ===== 학생 관리 라우트 =====

// GET / - 학생 목록 조회
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  console.log('getStudents 함수 호출됨');
  console.log('엔드포인트:', API_ENDPOINTS.STUDENTS.GET_ALL);
  await getStudentController().getStudents(req, res);
}));

// GET /search - 학생 검색
router.get('/search', asyncHandler(async (req: Request, res: Response) => {
  console.log('searchStudents 함수 호출됨');
  console.log('엔드포인트:', API_ENDPOINTS.STUDENTS.SEARCH);
  await getStudentController().searchStudents(req, res);
}));

// POST / - 학생 생성
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  console.log('createStudent 함수 호출됨');
  console.log('엔드포인트:', API_ENDPOINTS.STUDENTS.CREATE);
  await getStudentController().createStudent(req, res);
}));

// GET /:id - 개별 학생 조회
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  console.log('getStudentById 함수 호출됨');
  await getStudentController().getStudentById(req, res);
}));

// PUT /:id - 학생 정보 수정
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  console.log('updateStudent 함수 호출됨');
  const id = req.params.id;
  console.log('엔드포인트:', API_ENDPOINTS.STUDENTS.UPDATE(id));
  await getStudentController().updateStudent(req, res);
}));

// DELETE /:id - 학생 삭제
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  console.log('deleteStudent 함수 호출됨');
  const id = req.params.id;
  console.log('엔드포인트:', API_ENDPOINTS.STUDENTS.DELETE(id));
  await getStudentController().deleteStudent(req, res);
}));

// PUT /:studentId/attendance - 학생 출석 상태 업데이트
router.put('/:studentId/attendance', asyncHandler(async (req: Request, res: Response) => {
  console.log('updateAttendance 함수 호출됨');
  await getStudentController().updateAttendance(req, res);
}));

// ===== 초기화 라우트 =====

// POST /initialize - 학생 데이터 초기화
router.post('/initialize', asyncHandler(async (req: Request, res: Response) => {
  console.log('initializeStudents 함수 호출됨');
  await getStudentController().initializeStudents(req, res);
}));

export const studentRouter: Router = router; 