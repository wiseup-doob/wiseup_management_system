import { Router } from 'express';
import { StudentTimetableController } from '../controllers/StudentTimetableController';

const router = Router();
const studentTimetableController = new StudentTimetableController();

// ===== 학생별 라우트 (더 구체적인 경로를 먼저 등록) =====

// 학생별 시간표 조회 (학생 ID로)
router.get('/student/:studentId', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: GET /student/:studentId 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentTimetableController.getStudentTimetableByStudentId(req, res);
});

// 학생별 버전 시간표 조회
router.get('/student/:studentId/version/:versionId', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: GET /student/:studentId/version/:versionId 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentTimetableController.getStudentTimetableByVersion(req, res);
});

// 학생별 통합 시간표 조회 (수업 상세 정보 포함)
router.get('/student/:studentId/schedule-with-details', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: GET /student/:studentId/schedule-with-details 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentTimetableController.getStudentScheduleWithDetails(req, res);
});

// 버전별 수업 추가
router.post('/student/:studentId/version/:versionId/add-class', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: POST /student/:studentId/version/:versionId/add-class 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params, body: req.body });
  studentTimetableController.addClassToStudentTimetableByVersion(req, res);
});

// 버전별 수업 제거
router.post('/student/:studentId/version/:versionId/remove-class', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: POST /student/:studentId/version/:versionId/remove-class 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params, body: req.body });
  studentTimetableController.removeClassFromStudentTimetableByVersion(req, res);
});

// 학생 ID 기반으로 수업 추가 (새로운 방식)
router.post('/student/:studentId/add-class', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: POST /student/:studentId/add-class 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params, body: req.body });
  studentTimetableController.addClassToStudentTimetableByStudentId(req, res);
});

// 학생 ID 기반으로 수업 제거 (새로운 방식)
router.post('/student/:studentId/remove-class', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: POST /student/:studentId/remove-class 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params, body: req.body });
  studentTimetableController.removeClassFromStudentTimetableByStudentId(req, res);
});

// ===== 기본 CRUD 라우트 (나중에 등록) =====

// 학생 시간표 생성
router.post('/', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: POST / 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentTimetableController.createStudentTimetable(req, res);
});

// 모든 학생 시간표 조회
router.get('/', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: GET / 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentTimetableController.getAllStudentTimetables(req, res);
});

// 학생 시간표 검색
router.get('/search', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: GET /search 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentTimetableController.searchStudentTimetables(req, res);
});

// 학생 시간표 통계 조회
router.get('/statistics', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: GET /statistics 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentTimetableController.getStudentTimetableStatistics(req, res);
});

// ===== 일반 CRUD 라우트 (가장 마지막에 등록) =====

// 개별 학생 시간표 조회 (ID로)
router.get('/:id', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: GET /:id 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentTimetableController.getStudentTimetableById(req, res);
});

// 학생 시간표 수정
router.put('/:id', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: PUT /:id 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params, body: req.body });
  studentTimetableController.updateStudentTimetable(req, res);
});

// 학생 시간표 삭제
router.delete('/:id', (req, res) => {
  console.log('🔍 [DEBUG] student-timetable.ts: DELETE /:id 라우트 매칭됨');
  console.log('📝 요청 정보:', { method: req.method, url: req.url, path: req.path, params: req.params });
  studentTimetableController.deleteStudentTimetable(req, res);
});

// ===== 기존 방식 (시간표 ID 기반) - 하위 호환성을 위해 유지 =====

// 기존 방식 (시간표 ID 기반) - 하위 호환성을 위해 유지
// router.post('/:id/add-class', (req, res) => studentTimetableController.addClassToStudentTimetable(req, res));
// router.post('/:id/remove-class', (req, res) => studentTimetableController.removeClassFromStudentTimetable(req, res));

export { router as studentTimetableRoutes };
