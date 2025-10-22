import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { studentRoutes } from './routes/student';
import { parentRoutes } from './routes/parent';
import { studentSummaryRoutes } from './routes/student-summary';
import { attendanceRoutes } from './routes/attendance';
import { courseRoutes } from './routes/course';
import { classSectionRoutes } from './routes/class-section';
import { teacherRoutes } from './routes/teacher';
import { classroomRoutes } from './routes/classroom';
import { seatRoutes } from './routes/seat';
import { seatAssignmentRoutes } from './routes/seat-assignment';
import { studentTimetableRoutes } from './routes/student-timetable';
import { timetableVersionRoutes } from './routes/timetable-version';
import colorsRouter from './routes/colors';
// import testDataRoutes from './routes/test-data';

// Firebase Admin 초기화
admin.initializeApp();

// Express 앱 생성
const app = express();

// 미들웨어
app.use(cors({ origin: true }));
app.use(express.json());

// ===== 모든 요청 로깅 미들웨어 =====
app.use((req, res, next) => {
  console.log('🌐 [DEBUG] 메인 라우터에서 요청 수신');
  console.log('📝 요청 정보:', { 
    method: req.method, 
    url: req.url, 
    path: req.path, 
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    params: req.params 
  });
  console.log('🔍 요청 헤더:', req.headers);
  next();
});

// ===== 구체적인 경로를 먼저 등록 =====

// 시간표 버전 관련 라우트 (가장 먼저 등록)
console.log('🚀 [DEBUG] timetable-versions 라우터 등록 시작...');
app.use('/api/timetable-versions', timetableVersionRoutes);
console.log('✅ Timetable-versions routes registered successfully');

// 학생 시간표 관련 라우트 (더 구체적인 경로)
console.log('🚀 [DEBUG] student-timetables 라우터 등록 시작...');
app.use('/api/student-timetables', (req, res, next) => {
  console.log('🎯 [DEBUG] /api/student-timetables 라우터로 요청 라우팅됨');
  console.log('📝 라우팅 정보:', {
    method: req.method,
    url: req.url,
    path: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl
  });
  next();
}, studentTimetableRoutes);
console.log('✅ Student-timetables routes registered successfully');

// 수업 관련 라우트 (더 구체적인 경로)
console.log('🚀 [DEBUG] class-sections 라우터 등록 시작...');
app.use('/api/class-sections', (req, res, next) => {
  console.log('🎯 [DEBUG] /api/class-sections 라우터로 요청 라우팅됨');
  console.log('📝 라우팅 정보:', { 
    method: req.method, 
    url: req.url, 
    path: req.path, 
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl 
  });
  next();
}, classSectionRoutes);
console.log('✅ Class-sections routes registered successfully');

// 출석 기록 관련 라우트 (더 구체적인 경로)
app.use('/api/attendance', attendanceRoutes);

// 좌석 배정 관련 라우트 (더 구체적인 경로)
app.use('/api/seat-assignments', seatAssignmentRoutes);

// 좌석 관련 라우트 (더 구체적인 경로)
app.use('/api/seats', seatRoutes);

// ===== 일반적인 경로를 나중에 등록 =====

// 학생 관련 라우트 (일반적인 경로)
app.use('/api/students', studentRoutes);

// 부모 관련 라우트 (일반적인 경로)
app.use('/api/parents', parentRoutes);

// 학생 요약 정보 관련 라우트 (일반적인 경로)
app.use('/api/student-summaries', studentSummaryRoutes);

// 강의 관련 라우트 (일반적인 경로)
app.use('/api/courses', courseRoutes);

// 강사 관련 라우트 (일반적인 경로)
app.use('/api/teachers', teacherRoutes);

// 교실 관련 라우트 (일반적인 경로)
app.use('/api/classrooms', classroomRoutes);

// 색상 팔레트 관련 라우트 (일반적인 경로)
app.use('/api/colors', colorsRouter);

// 기본 라우트는 마지막에 등록 (catch-all 방지)
app.get('/', (req, res) => {
  res.json({ 
    message: 'WiseUp Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 라우트 등록 확인을 위한 디버깅
console.log('All routes registered. Available routes:');
app._router.stack.forEach((layer: any) => {
  if (layer.route) {
    console.log(`${layer.route.stack[0].method.toUpperCase()} ${layer.route.path}`);
  } else if (layer.name === 'router') {
    console.log(`Router: ${layer.regexp}`);
  }
});

// Firebase Functions로 export
// 강제 배포를 위한 타임스탬프: 2025-08-21 09:35:00
// asia-northeast3 지역으로 배포 (Firestore와 동일한 지역)
export const api = functions.https.onRequest({
  region: 'asia-northeast3'
}, app);

// ===== 데이터 마이그레이션 Functions =====
import { migrateTimetableVersions } from './scripts/migrate-timetable-versions';

/**
 * 시간표 버전 마이그레이션 Function
 * URL: https://asia-northeast3-[project-id].cloudfunctions.net/migrateTimetableVersionsFunction
 *
 * 사용법:
 * - GET: 마이그레이션 상태 확인
 * - POST: 마이그레이션 실행
 */
export const migrateTimetableVersionsFunction = functions.https.onRequest({
  region: 'asia-northeast3',
  timeoutSeconds: 540, // 9분
  memory: '1GiB'
}, async (req: any, res: any) => {
    // CORS 설정
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      if (req.method === 'GET') {
        // 상태 확인
        console.log('📊 마이그레이션 상태 확인 요청');

        // 상태 확인 로직 직접 구현
        const { TimetableVersionService } = await import('./services/TimetableVersionService.js');
        const { StudentTimetableService } = await import('./services/StudentTimetableService.js');

        const versionService = new TimetableVersionService();
        const timetableService = new StudentTimetableService();

        const versions = await versionService.getAllVersions();
        const activeVersion = await versionService.getActiveVersion();
        const allTimetables = await timetableService.getAllStudentTimetables();
        const withVersion = allTimetables.filter((t: any) => !!t.versionId);
        const withoutVersion = allTimetables.filter((t: any) => !t.versionId);

        res.status(200).json({
          success: true,
          status: {
            versions: {
              total: versions.length,
              active: activeVersion ? activeVersion.name : null
            },
            timetables: {
              total: allTimetables.length,
              withVersion: withVersion.length,
              withoutVersion: withoutVersion.length,
              migrationNeeded: withoutVersion.length > 0
            }
          }
        });

      } else if (req.method === 'POST') {
        // 마이그레이션 실행
        console.log('🚀 마이그레이션 실행 요청');

        const result = await migrateTimetableVersions();

        res.status(200).json({
          success: true,
          message: 'Migration completed',
          result
        });

      } else {
        res.status(405).json({
          success: false,
          error: 'Method not allowed. Use GET to check status or POST to migrate.'
        });
      }

    } catch (error: any) {
      console.error('❌ 마이그레이션 Function 오류:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Migration failed',
        details: error.toString()
      });
    }
  });
