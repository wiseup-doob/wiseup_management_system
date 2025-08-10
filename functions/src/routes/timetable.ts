import { Router } from 'express'
import { TimetableService } from '../services/timetable/TimetableService'
import { TimetableController } from '../controllers/TimetableController'
import { TimetableInitializationController } from '../controllers/TimetableInitializationController'

const router: Router = Router()
const timetableController = new TimetableController()
const timetableInitController = new TimetableInitializationController()

// ===== 시간표 관리 라우트 =====

// 시간표 생성
router.post('/timetables', timetableController.createTimetable.bind(timetableController))

// 시간표 목록 조회
router.get('/timetables', timetableController.getAllTimetables.bind(timetableController))

// 시간표 상세 조회
router.get('/timetables/:id', timetableController.getTimetable.bind(timetableController))

// 시간표 수정
router.put('/timetables/:id', timetableController.updateTimetable.bind(timetableController))

// 시간표 삭제
router.delete('/timetables/:id', timetableController.deleteTimetable.bind(timetableController))

// ===== 시간표 항목 관리 라우트 =====

// 시간표 항목 생성
router.post('/timetable-items', timetableController.createTimetableItem.bind(timetableController))

// 시간표 항목 목록 조회 (특정 시간표)
router.get('/timetables/:timetableId/items', timetableController.getTimetableItems.bind(timetableController))

// 시간표 항목 상세 조회
router.get('/timetable-items/:id', timetableController.getTimetableItem.bind(timetableController))

// 시간표 항목 수정
router.put('/timetable-items/:id', timetableController.updateTimetableItem.bind(timetableController))

// 시간표 항목 삭제
router.delete('/timetable-items/:id', timetableController.deleteTimetableItem.bind(timetableController))

// ===== 학생별 시간표 항목 조회 (신규) =====
router.get('/students/:studentId/items', timetableController.getStudentItems.bind(timetableController))

// ===== 학생별 개인 시간표 보장/조회 (신규) =====
router.post('/students/:studentId/timetable', async (req, res) => {
  try {
    const { studentId } = req.params as any
    if (!studentId) return res.status(400).json({ success: false, message: '학생 ID가 필요합니다.' })
    const service = new TimetableService()
    const t = await service.getOrCreateStudentTimetable(studentId)
    return res.json({ success: true, data: t })
  } catch (e: any) {
    console.error('학생별 시간표 보장 오류', e)
    return res.status(500).json({ success: false, message: '학생별 시간표 보장 실패', error: e?.message })
  }
})

// ===== 시간대 관리 라우트 =====

// 시간대 생성
router.post('/time-slots', timetableController.createTimeSlot.bind(timetableController))

// 시간대 목록 조회
router.get('/time-slots', timetableController.getAllTimeSlots.bind(timetableController))

// ===== 수업 관리 라우트 =====

// 수업 생성
router.post('/classes', timetableController.createClass.bind(timetableController))

// 수업 목록 조회
router.get('/classes', timetableController.getAllClasses.bind(timetableController))

// ===== 교사 관리 라우트 =====

// 교사 생성
router.post('/teachers', timetableController.createTeacher.bind(timetableController))

// 교사 목록 조회
router.get('/teachers', timetableController.getAllTeachers.bind(timetableController))

// ===== 강의실 관리 라우트 =====

// 강의실 생성
router.post('/classrooms', timetableController.createClassroom.bind(timetableController))

// 강의실 목록 조회
router.get('/classrooms', timetableController.getAllClassrooms.bind(timetableController))

// ===== 통계 및 요약 라우트 =====

// 시간표 요약 조회
router.get('/timetables/:id/summary', timetableController.getTimetableSummary.bind(timetableController))

// ===== 초기화 라우트 =====

// 시간표 데이터 초기화
router.post('/initialize', timetableInitController.initializeTimetableData.bind(timetableInitController))

// 시간표 데이터 삭제
router.delete('/clear', timetableInitController.clearTimetableData.bind(timetableInitController))

export default router
