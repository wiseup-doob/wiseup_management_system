import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../config/container';
import { AttendanceController } from '../controllers/AttendanceController';
import { API_ENDPOINTS } from '@shared/constants';

// Express Router 생성
const router = Router();

// 컨트롤러 해결 함수
const getAttendanceController = (): AttendanceController => {
  return container.resolve<AttendanceController>('AttendanceController');
};

// 에러 핸들링 래퍼
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ===== 출석 초기화 라우트 =====

// POST /initialize - 전체 출석 데이터 초기화
router.post('/initialize', asyncHandler(async (req: Request, res: Response) => {
  console.log('initializeAttendanceData 함수 호출됨');
  console.log('엔드포인트:', API_ENDPOINTS.ATTENDANCE.GET_RECORDS + '/initialize');
  await getAttendanceController().initializeAttendanceData(req, res);
}));

// POST /initialize-today - 오늘 출석 데이터 초기화
router.post('/initialize-today', asyncHandler(async (req: Request, res: Response) => {
  console.log('initializeTodayAttendanceData 함수 호출됨');
  console.log('엔드포인트:', API_ENDPOINTS.ATTENDANCE.GET_RECORDS + '/initialize-today');
  await getAttendanceController().initializeTodayAttendanceData(req, res);
}));

// ===== 출석 관리 라우트 =====

// GET /records - 출석 기록 조회
router.get('/records', asyncHandler(async (req: Request, res: Response) => {
  console.log('getAttendanceRecords 함수 호출됨');
  console.log('엔드포인트:', API_ENDPOINTS.ATTENDANCE.GET_RECORDS);
  await getAttendanceController().getAttendanceRecords(req, res);
}));

// GET /records/:id - 개별 출석 기록 조회
router.get('/records/:id', asyncHandler(async (req: Request, res: Response) => {
  console.log('getAttendanceRecordById 함수 호출됨');
  const id = req.params.id;
  console.log('엔드포인트:', API_ENDPOINTS.ATTENDANCE.GET_RECORD_BY_ID(id));
  await getAttendanceController().getAttendanceRecordById(req, res);
}));

// POST /records - 출석 기록 생성
router.post('/records', asyncHandler(async (req: Request, res: Response) => {
  console.log('createAttendanceRecord 함수 호출됨');
  console.log('엔드포인트:', API_ENDPOINTS.ATTENDANCE.CREATE_RECORD);
  await getAttendanceController().createAttendanceRecord(req, res);
}));

// PUT /records/:id - 출석 기록 수정
router.put('/records/:id', asyncHandler(async (req: Request, res: Response) => {
  console.log('updateAttendanceRecord 함수 호출됨');
  const id = req.params.id;
  console.log('엔드포인트:', API_ENDPOINTS.ATTENDANCE.UPDATE_RECORD(id));
  await getAttendanceController().updateAttendanceRecord(req, res);
}));

// DELETE /records/:id - 출석 기록 삭제
router.delete('/records/:id', asyncHandler(async (req: Request, res: Response) => {
  console.log('deleteAttendanceRecord 함수 호출됨');
  const id = req.params.id;
  console.log('엔드포인트:', API_ENDPOINTS.ATTENDANCE.DELETE_RECORD(id));
  await getAttendanceController().deleteAttendanceRecord(req, res);
}));

// GET /students/:studentId/records - 학생별 출석 기록
router.get('/students/:studentId/records', asyncHandler(async (req: Request, res: Response) => {
  console.log('getAttendanceByStudent 함수 호출됨');
  const studentId = req.params.studentId;
  console.log('엔드포인트:', API_ENDPOINTS.ATTENDANCE.GET_BY_STUDENT(studentId));
  await getAttendanceController().getAttendanceByStudent(req, res);
}));

// GET /date/:date - 날짜별 출석 기록
router.get('/date/:date', asyncHandler(async (req: Request, res: Response) => {
  console.log('getAttendanceByDate 함수 호출됨');
  const date = req.params.date;
  console.log('엔드포인트:', API_ENDPOINTS.ATTENDANCE.GET_BY_DATE(date));
  await getAttendanceController().getAttendanceByDate(req, res);
}));

// POST /bulk-update - 일괄 출석 업데이트
router.post('/bulk-update', asyncHandler(async (req: Request, res: Response) => {
  console.log('bulkUpdateAttendance 함수 호출됨');
  console.log('엔드포인트:', API_ENDPOINTS.ATTENDANCE.BULK_UPDATE);
  await getAttendanceController().bulkUpdateAttendance(req, res);
}));

// GET /stats - 출석 통계
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  console.log('getAttendanceStatistics 함수 호출됨');
  console.log('엔드포인트:', API_ENDPOINTS.ATTENDANCE.GET_STATS);
  await getAttendanceController().getAttendanceStatistics(req, res);
}));

export const attendanceRouter: Router = router;
