/**
 * Firebase Functions v1 - WiseUp Management System API
 * 
 * Express.js를 사용하여 RESTful API 엔드포인트를 처리합니다.
 */

import * as functions from 'firebase-functions';
import express, { Request, Response, NextFunction } from 'express';
import { initializeFirebase } from './config/firebase';
import { studentRouter } from './routes/student';
import { attendanceRouter } from './routes/attendance';
import { seatRouter } from './routes/seat';
import { initializationRouter } from './routes/initialization';
import assignmentRouter from './routes/assignment';
import timetableRouter from './routes/timetable';
import { setCorsHeaders, handleOptionsRequest } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { versionMiddleware } from './middleware/versionMiddleware';

// 환경 변수 설정 (Firebase Functions v1)
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000';
process.env.RATE_LIMIT_MAX_REQUESTS = process.env.RATE_LIMIT_MAX_REQUESTS || '100';
process.env.REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT || '30000';
process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'wiseupmanagementsystem';
process.env.USE_EMULATOR = process.env.USE_EMULATOR || 'true';

// Firebase 초기화
initializeFirebase();

// Express 앱 생성
const app = express();

// 전역 미들웨어 적용
app.use(requestLogger);
app.use(versionMiddleware);
app.use((req: Request, res: Response, next: NextFunction) => {
  setCorsHeaders(res);
  if (handleOptionsRequest(res)) return;
  next();
});

// JSON 파싱 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== 기본 API =====

// GET /api/health - 헬스 체크
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'WiseUp Management System API is running',
    timestamp: new Date().toISOString(),
    version: 'v1',
    env: process.env.NODE_ENV
  });
});

// GET /api/debug/firestore - Firestore 연결 상태 확인
app.get('/api/debug/firestore', async (req: Request, res: Response) => {
  try {
    const { getFirestore } = await import('./config/firebase.js');
    const db = getFirestore();
    
    // 간단한 연결 테스트
    await db.collection('_test').doc('connection').get();
    
    res.json({
      success: true,
      message: 'Firestore 연결 성공',
      timestamp: new Date().toISOString(),
      firestore: {
        connected: true,
        emulator: process.env.USE_EMULATOR === 'true',
        emulatorHost: process.env.FIRESTORE_EMULATOR_HOST
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Firestore 연결 실패',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// ===== 라우터 적용 =====

// 학생 관리 라우터
app.use('/api/students', studentRouter);

// 출석 관리 라우터 (별도 라우터로 분리)
app.use('/api/attendance', attendanceRouter);

// 좌석 관리 라우터
app.use('/api/seats', seatRouter);

// 초기화 관리 라우터
app.use('/api/initialization', initializationRouter);

// 과제 관리 라우터
app.use('/api/assignments', assignmentRouter);

// 시간표 관리 라우터
app.use('/api/timetable', timetableRouter);

// ===== 기존 API 호환성 (임시) =====

// 학생 출석 상태 업데이트 (기존 API 호환성)
app.post('/updateAttendance', (req: Request, res: Response) => {
  // 기존 API 호환성을 위한 임시 처리
  res.status(410).json({
    success: false,
    message: '이 API는 더 이상 사용되지 않습니다. /api/attendance/records를 사용해주세요.',
    deprecated: true
  });
});

// 출석 기록 조회 (기존 API 호환성)
app.get('/getAttendanceHistory', (req: Request, res: Response) => {
  // 기존 API 호환성을 위한 임시 처리
  res.status(410).json({
    success: false,
    message: '이 API는 더 이상 사용되지 않습니다. /api/attendance/records를 사용해주세요.',
    deprecated: true
  });
});

// 학생 데이터 초기화 (기존 API 호환성)
app.post('/initializeStudents', (req: Request, res: Response) => {
  // 기존 API 호환성을 위한 임시 처리
  res.status(410).json({
    success: false,
    message: '이 API는 더 이상 사용되지 않습니다. /api/students/initialize를 사용해주세요.',
    deprecated: true
  });
});

// 404 핸들러
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
    meta: {
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    }
  });
});

// 에러 핸들러
app.use(errorHandler);

// ===== Firebase Functions v1 =====

// 모든 API 엔드포인트를 처리하는 단일 함수
export const wiseupApi = functions.https.onRequest(app);
