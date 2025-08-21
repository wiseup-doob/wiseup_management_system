import { Router } from 'express';
import { StudentController } from '../controllers/StudentController';

const router = Router();
const studentController = new StudentController();

// 학생 생성
router.post('/', (req, res) => {
  console.log('🔍 [DEBUG] student.ts: POST / 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentController.createStudent(req, res);
});

// 모든 학생 조회
router.get('/', (req, res) => {
  console.log('🔍 [DEBUG] student.ts: GET / 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentController.getAllStudents(req, res);
});

// 학생 검색
router.get('/search', (req, res) => {
  console.log('🔍 [DEBUG] student.ts: GET /search 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentController.searchStudents(req, res);
});

// 학년별 학생 수 조회
router.get('/count/grade', (req, res) => {
  console.log('🔍 [DEBUG] student.ts: GET /count/grade 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentController.getStudentCountByGrade(req, res);
});

// 활성 학생 수 조회
router.get('/count/active', (req, res) => {
  console.log('🔍 [DEBUG] student.ts: GET /count/active 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentController.getActiveStudentCount(req, res);
});

// 특정 학생 조회
router.get('/:id', (req, res) => {
  console.log('🔍 [DEBUG] student.ts: GET /:id 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentController.getStudentById(req, res);
});

// 학생 정보 수정
router.put('/:id', (req, res) => {
  console.log('🔍 [DEBUG] student.ts: PUT /:id 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params, body: req.body });
  studentController.updateStudent(req, res);
});

// 학생 삭제
router.delete('/:id', (req, res) => {
  console.log('🔍 [DEBUG] student.ts: DELETE /:id 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentController.deleteStudent(req, res);
});

// 학생 의존성 확인
router.get('/:id/dependencies', (req, res) => {
  console.log('🔍 [DEBUG] student.ts: GET /:id/dependencies 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentController.getStudentDependencies(req, res);
});

// 학생 계층적 삭제
router.delete('/:id/hierarchical', (req, res) => {
  console.log('🔍 [DEBUG] student.ts: DELETE /:id/hierarchical 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentController.deleteStudentHierarchically(req, res);
});

export { router as studentRoutes };
