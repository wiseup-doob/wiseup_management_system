import { BaseController } from './BaseController'
import { TimetableService } from '../services/timetable/TimetableService'
import type { 
  CreateTimetableRequest,
  UpdateTimetableRequest,
  CreateTimetableItemRequest,
  TimetableSearchParams
} from '@shared/types'
import { omitUndefined, nullifyOptionals } from '../utils/sanitize'

export class TimetableController extends BaseController {
  private timetableService: TimetableService

  constructor() {
    super()
    this.timetableService = new TimetableService()
  }

  // ===== 시간표 관리 API =====

  async createTimetable(req: any, res: any) {
    try {
      const data: CreateTimetableRequest = req.body
      
      if (!data.name || !data.academicYear || !data.semester || !data.startDate || !data.endDate) {
        return this.sendError(res, '필수 필드가 누락되었습니다.', 400)
      }

      const timetable = await this.timetableService.createTimetable(data)
      return this.sendSuccess(res, timetable, '시간표가 성공적으로 생성되었습니다.')
    } catch (error) {
      console.error('시간표 생성 오류:', error)
      return this.sendError(res, '시간표 생성에 실패했습니다.', 500)
    }
  }

  async updateTimetable(req: any, res: any) {
    try {
      const { id } = req.params
      const data: UpdateTimetableRequest = req.body

      if (!id) {
        return this.sendError(res, '시간표 ID가 필요합니다.', 400)
      }

      const timetable = await this.timetableService.updateTimetable(id, data)
      return this.sendSuccess(res, timetable, '시간표가 성공적으로 업데이트되었습니다.')
    } catch (error) {
      console.error('시간표 업데이트 오류:', error)
      return this.sendError(res, '시간표 업데이트에 실패했습니다.', 500)
    }
  }

  async getTimetable(req: any, res: any) {
    try {
      const { id } = req.params

      if (!id) {
        return this.sendError(res, '시간표 ID가 필요합니다.', 400)
      }

      const timetable = await this.timetableService.getTimetableById(id)
      if (!timetable) {
        return this.sendError(res, '시간표를 찾을 수 없습니다.', 404)
      }

      return this.sendSuccess(res, timetable, '시간표 조회 성공')
    } catch (error) {
      console.error('시간표 조회 오류:', error)
      return this.sendError(res, '시간표 조회에 실패했습니다.', 500)
    }
  }

  async getAllTimetables(req: any, res: any) {
    try {
      const searchParams: TimetableSearchParams = req.query
      const timetables = await this.timetableService.getAllTimetables(searchParams)
      
      return this.sendSuccess(res, timetables, '시간표 목록 조회 성공')
    } catch (error) {
      console.error('시간표 목록 조회 오류:', error)
      return this.sendError(res, '시간표 목록 조회에 실패했습니다.', 500)
    }
  }

  async deleteTimetable(req: any, res: any) {
    try {
      const { id } = req.params

      if (!id) {
        return this.sendError(res, '시간표 ID가 필요합니다.', 400)
      }

      await this.timetableService.deleteTimetable(id)
      return this.sendSuccess(res, null, '시간표가 성공적으로 삭제되었습니다.')
    } catch (error) {
      console.error('시간표 삭제 오류:', error)
      return this.sendError(res, '시간표 삭제에 실패했습니다.', 500)
    }
  }

  // ===== 시간표 항목 관리 API =====

  async createTimetableItem(req: any, res: any) {
    try {
      let data: CreateTimetableItemRequest = req.body
      // sanitize: undefined 제거 및 선택 필드 null 정규화
      data = omitUndefined(data)
      data = nullifyOptionals(data as any, ['endDate','roomId','recurrencePattern','notes'])
      
      if (!data.classId || !data.teacherId || !data.dayOfWeek || !data.timeSlotId || !data.startDate) {
        return this.sendError(res, '필수 필드가 누락되었습니다.', 400, JSON.stringify({ body: req.body }))
      }

      // 학생별 독립 시간표: timetableId가 필수. 없으면 오류 반환
      if (!(data as any).timetableId) {
        return this.sendError(res, 'timetableId가 필요합니다.', 400)
      }

      // 참조 유효성 사전 검증 및 상세 로그
      const [classes, teachers, slots] = await Promise.all([
        this.timetableService.getAllClasses().catch(e => { console.error('클래스 조회 실패', e); return [] }),
        this.timetableService.getAllTeachers().catch(e => { console.error('교사 조회 실패', e); return [] }),
        this.timetableService.getAllTimeSlots().catch(e => { console.error('타임슬롯 조회 실패', e); return [] }),
      ])
      const classOk = !!classes.find((c: any) => c.id === data.classId)
      const teacherOk = !!teachers.find((t: any) => t.id === data.teacherId)
      const slotOk = !!slots.find((s: any) => s.id === data.timeSlotId)
      if (!classOk || !teacherOk || !slotOk) {
        const details = {
          classId: data.classId,
          teacherId: data.teacherId,
          timeSlotId: data.timeSlotId,
          classOk, teacherOk, slotOk,
        }
        console.error('참조 유효성 검증 실패', details)
        return this.sendError(res, '유효하지 않은 참조 ID입니다.', 400, JSON.stringify(details))
      }

      const item = await this.timetableService.createTimetableItem(data)
      return this.sendSuccess(res, item, '시간표 항목이 성공적으로 생성되었습니다.')
    } catch (error) {
      console.error('시간표 항목 생성 오류:', error)
      return this.sendError(res, '시간표 항목 생성에 실패했습니다.', 500, (error as any)?.message)
    }
  }

  async updateTimetableItem(req: any, res: any) {
    try {
      const { id } = req.params
      const data = req.body

      if (!id) {
        return this.sendError(res, '시간표 항목 ID가 필요합니다.', 400)
      }

      const item = await this.timetableService.updateTimetableItem(id, data)
      return this.sendSuccess(res, item, '시간표 항목이 성공적으로 업데이트되었습니다.')
    } catch (error) {
      console.error('시간표 항목 업데이트 오류:', error)
      return this.sendError(res, '시간표 항목 업데이트에 실패했습니다.', 500)
    }
  }

  async getTimetableItem(req: any, res: any) {
    try {
      const { id } = req.params

      if (!id) {
        return this.sendError(res, '시간표 항목 ID가 필요합니다.', 400)
      }

      const item = await this.timetableService.getTimetableItemById(id)
      if (!item) {
        return this.sendError(res, '시간표 항목을 찾을 수 없습니다.', 404)
      }

      return this.sendSuccess(res, item, '시간표 항목 조회 성공')
    } catch (error) {
      console.error('시간표 항목 조회 오류:', error)
      return this.sendError(res, '시간표 항목 조회에 실패했습니다.', 500)
    }
  }

  async getTimetableItems(req: any, res: any) {
    try {
      const { timetableId } = req.params

      if (!timetableId) {
        return this.sendError(res, '시간표 ID가 필요합니다.', 400)
      }

      const items = await this.timetableService.getTimetableItemsByTimetable(timetableId)
      return this.sendSuccess(res, items, '시간표 항목 목록 조회 성공')
    } catch (error) {
      console.error('시간표 항목 목록 조회 오류:', error)
      return this.sendError(res, '시간표 항목 목록 조회에 실패했습니다.', 500)
    }
  }

  // 신규: 학생별 시간표 항목 조회
  async getStudentItems(req: any, res: any) {
    try {
      const { studentId } = req.params
      if (!studentId) {
        return this.sendError(res, '학생 ID가 필요합니다.', 400)
      }

      const enrollments = await this.timetableService.getEnrollmentsByStudent(studentId)
      const itemIds = enrollments
        .map((e: any) => e.timetableItemId)
        .filter((v: any) => !!v)
      if (itemIds.length === 0) {
        return this.sendSuccess(res, [], '학생의 수강신청이 없습니다.')
      }

      const items = await this.timetableService.getTimetableItemsByIds(itemIds)
      return this.sendSuccess(res, items, '학생별 시간표 항목 조회 성공')
    } catch (error) {
      console.error('학생별 시간표 항목 조회 오류:', error)
      return this.sendError(res, '학생별 시간표 항목 조회에 실패했습니다.', 500, (error as any)?.message)
    }
  }

  async deleteTimetableItem(req: any, res: any) {
    try {
      const { id } = req.params

      if (!id) {
        return this.sendError(res, '시간표 항목 ID가 필요합니다.', 400)
      }

      await this.timetableService.deleteTimetableItem(id)
      return this.sendSuccess(res, null, '시간표 항목이 성공적으로 삭제되었습니다.')
    } catch (error) {
      console.error('시간표 항목 삭제 오류:', error)
      return this.sendError(res, '시간표 항목 삭제에 실패했습니다.', 500)
    }
  }

  // ===== 시간대 관리 API =====

  async createTimeSlot(req: any, res: any) {
    try {
      const data = req.body
      
      if (!data.name || !data.startTime || !data.endTime || !data.duration || data.isBreak === undefined || !data.order) {
        return this.sendError(res, '필수 필드가 누락되었습니다.', 400, JSON.stringify({ body: req.body }))
      }

      const timeSlot = await this.timetableService.createTimeSlot(data)
      return this.sendSuccess(res, timeSlot, '시간대가 성공적으로 생성되었습니다.')
    } catch (error) {
      console.error('시간대 생성 오류:', error)
      return this.sendError(res, '시간대 생성에 실패했습니다.', 500, (error as any)?.message)
    }
  }

  async getAllTimeSlots(req: any, res: any) {
    try {
      const timeSlots = await this.timetableService.getAllTimeSlots()
      return this.sendSuccess(res, timeSlots, '시간대 목록 조회 성공')
    } catch (error) {
      console.error('시간대 목록 조회 오류:', error)
      return this.sendError(res, '시간대 목록 조회에 실패했습니다.', 500)
    }
  }

  // ===== 수업 관리 API =====

  async createClass(req: any, res: any) {
    try {
      const data = req.body
      
      if (!data.name || !data.subject || !data.classType || !data.teacherId || !data.grade || !data.maxStudents) {
        return this.sendError(res, '필수 필드가 누락되었습니다.', 400)
      }

      const classData = await this.timetableService.createClass(data)
      return this.sendSuccess(res, classData, '수업이 성공적으로 생성되었습니다.')
    } catch (error) {
      console.error('수업 생성 오류:', error)
      return this.sendError(res, '수업 생성에 실패했습니다.', 500)
    }
  }

  async getAllClasses(req: any, res: any) {
    try {
      const classes = await this.timetableService.getAllClasses()
      return this.sendSuccess(res, classes, '수업 목록 조회 성공')
    } catch (error) {
      console.error('수업 목록 조회 오류:', error)
      return this.sendError(res, '수업 목록 조회에 실패했습니다.', 500)
    }
  }

  // ===== 교사 관리 API =====

  async createTeacher(req: any, res: any) {
    try {
      const data = req.body
      
      if (!data.name || !data.email || !data.phone || !data.subjects || !data.gradeLevels || !data.hireDate) {
        return this.sendError(res, '필수 필드가 누락되었습니다.', 400)
      }

      const teacher = await this.timetableService.createTeacher(data)
      return this.sendSuccess(res, teacher, '교사가 성공적으로 생성되었습니다.')
    } catch (error) {
      console.error('교사 생성 오류:', error)
      return this.sendError(res, '교사 생성에 실패했습니다.', 500)
    }
  }

  async getAllTeachers(req: any, res: any) {
    try {
      const teachers = await this.timetableService.getAllTeachers()
      return this.sendSuccess(res, teachers, '교사 목록 조회 성공')
    } catch (error) {
      console.error('교사 목록 조회 오류:', error)
      return this.sendError(res, '교사 목록 조회에 실패했습니다.', 500)
    }
  }

  // ===== 강의실 관리 API =====

  async createClassroom(req: any, res: any) {
    try {
      const data = req.body
      
      if (!data.name || !data.capacity || !data.equipment || !data.features || data.isActive === undefined) {
        return this.sendError(res, '필수 필드가 누락되었습니다.', 400)
      }

      const classroom = await this.timetableService.createClassroom(data)
      return this.sendSuccess(res, classroom, '강의실이 성공적으로 생성되었습니다.')
    } catch (error) {
      console.error('강의실 생성 오류:', error)
      return this.sendError(res, '강의실 생성에 실패했습니다.', 500)
    }
  }

  async getAllClassrooms(req: any, res: any) {
    try {
      const classrooms = await this.timetableService.getAllClassrooms()
      return this.sendSuccess(res, classrooms, '강의실 목록 조회 성공')
    } catch (error) {
      console.error('강의실 목록 조회 오류:', error)
      return this.sendError(res, '강의실 목록 조회에 실패했습니다.', 500)
    }
  }

  // ===== 통계 및 요약 API =====

  async getTimetableSummary(req: any, res: any) {
    try {
      const { id } = req.params

      if (!id) {
        return this.sendError(res, '시간표 ID가 필요합니다.', 400)
      }

      const summary = await this.timetableService.getTimetableSummary(id)
      return this.sendSuccess(res, summary, '시간표 요약 조회 성공')
    } catch (error) {
      console.error('시간표 요약 조회 오류:', error)
      return this.sendError(res, '시간표 요약 조회에 실패했습니다.', 500)
    }
  }
}
