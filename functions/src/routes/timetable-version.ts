import { Router } from 'express'
import { TimetableVersionController } from '../controllers/TimetableVersionController'

const router = Router()
const controller = new TimetableVersionController()

// ===== 특정 경로를 먼저 등록 (순서 중요) =====

// 마이그레이션 상태 확인
router.get('/migration/status', (req, res) => controller.getMigrationStatus(req, res))

// 전체 데이터 마이그레이션 실행 (교사, 수업, 학생 시간표)
router.post('/migration/:versionId/all', (req, res) => controller.migrateAll(req, res))

// 데이터 마이그레이션 실행 (학생 시간표만)
router.post('/migration/:versionId', (req, res) => controller.migrateTimetables(req, res))

// 활성 버전 조회
router.get('/active', (req, res) => controller.getActiveVersion(req, res))

// 버전 복사
router.post('/:sourceVersionId/copy', (req, res) => controller.copyVersion(req, res))

// 특정 버전의 모든 학생 시간표 일괄 초기화
router.post('/:versionId/bulk-initialize', (req, res) => controller.bulkInitializeTimetables(req, res))

// 버전 활성화
router.post('/:id/activate', (req, res) => controller.activateVersion(req, res))

// ===== 기본 CRUD (나중에 등록) =====

// 모든 버전 조회
router.get('/', (req, res) => controller.getAllVersions(req, res))

// 버전 생성
router.post('/', (req, res) => controller.createVersion(req, res))

// 버전 조회
router.get('/:id', (req, res) => controller.getVersionById(req, res))

// 버전 수정
router.put('/:id', (req, res) => controller.updateVersion(req, res))

// 버전 삭제
router.delete('/:id', (req, res) => controller.deleteVersion(req, res))

export { router as timetableVersionRoutes }
