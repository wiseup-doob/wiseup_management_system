import { Router } from 'express'
import { TestDataController } from '../controllers/TestDataController'

const router = Router()
const testDataController = new TestDataController()

// ===== 테스트 데이터 초기화 라우트 =====

// 전체 테스트 데이터 초기화
router.post('/initialize', testDataController.initializeAllTestData)

// 학생 테스트 데이터만 초기화
router.post('/students', testDataController.initializeStudentsData)

// 교사 테스트 데이터만 초기화
router.post('/teachers', testDataController.initializeTeachersData)

// 특정 컬렉션의 테스트 데이터 삭제
router.delete('/students', testDataController.clearStudentsData)
router.delete('/teachers', testDataController.clearTeachersData)
router.delete('/all', testDataController.clearAllTestData)

// 테스트 데이터 상태 확인
router.get('/status', testDataController.getTestDataStatus)

export default router
