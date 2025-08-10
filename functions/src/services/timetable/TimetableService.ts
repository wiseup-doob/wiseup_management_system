import { BaseService } from '../base/BaseService'
import type { 
  Timetable, 
  TimetableItem, 
  TimeSlot, 
  Class, 
  Teacher, 
  Classroom,
  TimetableSummary,
  CreateTimetableRequest,
  UpdateTimetableRequest,
  CreateTimetableItemRequest,
  TimetableSearchParams
} from '@shared/types'

export class TimetableService extends BaseService {
  static readonly COLLECTION_NAME = 'timetables'
  static readonly ITEMS_COLLECTION_NAME = 'timetable_items'
  static readonly TIMESLOTS_COLLECTION_NAME = 'time_slots'
  static readonly CLASSES_COLLECTION_NAME = 'classes'
  static readonly TEACHERS_COLLECTION_NAME = 'teachers'
  static readonly CLASSROOMS_COLLECTION_NAME = 'classrooms'
  static readonly ENROLLMENTS_COLLECTION_NAME = 'enrollments'

  // ===== 시간표 관리 =====

  async createTimetable(data: CreateTimetableRequest): Promise<Timetable> {
    try {
      const timetable: Timetable = {
        id: this.generateId(),
        name: data.name,
        academicYear: data.academicYear,
        semester: data.semester,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: true,
        description: data.description,
        // 학생별 독립 시간표 소유자(선택)
        ...(data as any).ownerStudentId ? { ownerStudentId: (data as any).ownerStudentId as any } : {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await this.getCollection(TimetableService.COLLECTION_NAME).doc(timetable.id).set(timetable)
      return timetable
    } catch (error) {
      console.error('시간표 생성 오류:', error)
      throw error
    }
  }

  async updateTimetable(id: string, data: UpdateTimetableRequest): Promise<Timetable> {
    try {
      const updateData: Partial<Timetable> = {
        ...data,
        updatedAt: new Date().toISOString()
      }

      await this.getCollection(TimetableService.COLLECTION_NAME).doc(id).update(updateData)
      
      const updated = await this.getTimetableById(id)
      if (!updated) {
        throw new Error('시간표를 찾을 수 없습니다.')
      }
      
      return updated
    } catch (error) {
      console.error('시간표 업데이트 오류:', error)
      throw error
    }
  }

  async getTimetableById(id: string): Promise<Timetable | null> {
    try {
      const doc = await this.getCollection(TimetableService.COLLECTION_NAME).doc(id).get()
      if (!doc.exists) {
        return null
      }
      return doc.data() as Timetable
    } catch (error) {
      console.error('시간표 조회 오류:', error)
      throw error
    }
  }

  async getAllTimetables(searchParams?: TimetableSearchParams): Promise<Timetable[]> {
    try {
      let query = this.getCollection(TimetableService.COLLECTION_NAME) as any

      if (searchParams?.isActive !== undefined) {
        query = query.where('isActive', '==', searchParams.isActive)
      }

      const snapshot = await query.get()
      return snapshot.docs.map((doc: any) => doc.data() as Timetable)
    } catch (error) {
      console.error('시간표 목록 조회 오류:', error)
      throw error
    }
  }

  async deleteTimetable(id: string): Promise<void> {
    try {
      await this.getCollection(TimetableService.COLLECTION_NAME).doc(id).delete()
    } catch (error) {
      console.error('시간표 삭제 오류:', error)
      throw error
    }
  }

  // ===== 시간표 항목 관리 =====

  async createTimetableItem(data: CreateTimetableItemRequest): Promise<TimetableItem> {
    try {
      console.log('[SERVICE][CREATE_ITEM] payload', data)
      const item: TimetableItem = {
        id: this.generateId(),
        // 학생별 독립 시간표 스코핑
        // timetableId는 프론트에서 전달되거나 컨트롤러에서 보강됩니다.
        ...(data as any).timetableId ? { timetableId: (data as any).timetableId } as any : {},
        classId: data.classId,
        teacherId: data.teacherId,
        dayOfWeek: data.dayOfWeek,
        timeSlotId: data.timeSlotId,
        roomId: data.roomId ?? null as any,
        startDate: data.startDate,
        endDate: data.endDate ?? null as any,
        isRecurring: data.isRecurring,
        recurrencePattern: (data.recurrencePattern as any) ?? null as any,
        status: 'scheduled',
        notes: data.notes ?? null as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await this.getCollection(TimetableService.ITEMS_COLLECTION_NAME).doc(item.id).set(item)
      console.log('[SERVICE][CREATE_ITEM] saved', item.id)
      return item
    } catch (error) {
      console.error('시간표 항목 생성 오류:', error)
      throw error
    }
  }

  async updateTimetableItem(id: string, data: Partial<TimetableItem>): Promise<TimetableItem> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      }

      await this.getCollection(TimetableService.ITEMS_COLLECTION_NAME).doc(id).update(updateData)
      
      const updated = await this.getTimetableItemById(id)
      if (!updated) {
        throw new Error('시간표 항목을 찾을 수 없습니다.')
      }
      
      return updated
    } catch (error) {
      console.error('시간표 항목 업데이트 오류:', error)
      throw error
    }
  }

  async getTimetableItemById(id: string): Promise<TimetableItem | null> {
    try {
      const doc = await this.getCollection(TimetableService.ITEMS_COLLECTION_NAME).doc(id).get()
      if (!doc.exists) {
        return null
      }
      return doc.data() as TimetableItem
    } catch (error) {
      console.error('시간표 항목 조회 오류:', error)
      throw error
    }
  }

  async getTimetableItemsByTimetable(timetableId: string): Promise<TimetableItem[]> {
    try {
      const snapshot = await this.getCollection(TimetableService.ITEMS_COLLECTION_NAME)
        .where('timetableId', '==', timetableId)
        .get()
      return snapshot.docs.map(doc => doc.data() as TimetableItem)
    } catch (error) {
      console.error('시간표 항목 목록 조회 오류:', error)
      throw error
    }
  }

  // 학생별 시간표 보장/조회
  async getStudentTimetable(studentId: string): Promise<Timetable | null> {
    const snapshot = await this.getCollection(TimetableService.COLLECTION_NAME)
      .where('ownerStudentId', '==', studentId)
      .where('isActive', '==', true)
      .limit(1)
      .get()
    if (snapshot.empty) return null
    return snapshot.docs[0].data() as Timetable
  }

  async getOrCreateStudentTimetable(studentId: string): Promise<Timetable> {
    const found = await this.getStudentTimetable(studentId)
    if (found) return found
    const now = new Date()
    const yyyy = String(now.getFullYear())
    const start = new Date(now.getFullYear(), 0, 1).toISOString().slice(0,10)
    const end = new Date(now.getFullYear(), 11, 31).toISOString().slice(0,10)
    const t: any = await this.createTimetable({
      name: `${yyyy} 개인 시간표`,
      academicYear: yyyy,
      semester: 'spring' as any,
      startDate: start,
      endDate: end,
      description: '개인 시간표',
      ownerStudentId: studentId as any
    } as any)
    return t
  }

  // 신규: 학생별 수강신청 조회
  async getEnrollmentsByStudent(studentId: string): Promise<any[]> {
    const snapshot = await this.getCollection(TimetableService.ENROLLMENTS_COLLECTION_NAME)
      .where('studentId', '==', studentId)
      .get()
    return snapshot.docs.map(d => d.data())
  }

  // 신규: 여러 ID로 TimetableItem 조회 (in-쿼리, 청크 분할 호출 권장)
  async getTimetableItemsByIds(ids: string[]): Promise<TimetableItem[]> {
    if (!ids || ids.length === 0) return []
    // Firestore in 제한(환경별 10/30 등)을 고려해 청크 처리
    const chunkSize = 10
    const chunks: string[][] = []
    for (let i = 0; i < ids.length; i += chunkSize) chunks.push(ids.slice(i, i + chunkSize))
    const results: TimetableItem[] = []
    for (const chunk of chunks) {
      const snap = await this.getCollection(TimetableService.ITEMS_COLLECTION_NAME)
        .where('id', 'in', chunk)
        .get()
      results.push(...snap.docs.map(d => d.data() as TimetableItem))
    }
    return results
  }

  async deleteTimetableItem(id: string): Promise<void> {
    try {
      await this.getCollection(TimetableService.ITEMS_COLLECTION_NAME).doc(id).delete()
    } catch (error) {
      console.error('시간표 항목 삭제 오류:', error)
      throw error
    }
  }

  // ===== 시간대 관리 =====

  async createTimeSlot(data: Omit<TimeSlot, 'id'>): Promise<TimeSlot> {
    try {
      const timeSlot: TimeSlot = {
        id: this.generateId(),
        ...data
      }

      await this.getCollection(TimetableService.TIMESLOTS_COLLECTION_NAME).doc(timeSlot.id).set(timeSlot)
      return timeSlot
    } catch (error) {
      console.error('시간대 생성 오류:', error)
      throw error
    }
  }

  async getAllTimeSlots(): Promise<TimeSlot[]> {
    try {
      const snapshot = await this.getCollection(TimetableService.TIMESLOTS_COLLECTION_NAME)
        .orderBy('order')
        .get()
      
      return snapshot.docs.map(doc => doc.data() as TimeSlot)
    } catch (error) {
      console.error('시간대 목록 조회 오류:', error)
      throw error
    }
  }

  // ===== 수업 관리 =====

  async createClass(data: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Promise<Class> {
    try {
      const classData: Class = {
        id: this.generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await this.getCollection(TimetableService.CLASSES_COLLECTION_NAME).doc(classData.id).set(classData)
      return classData
    } catch (error) {
      console.error('수업 생성 오류:', error)
      throw error
    }
  }

  async getAllClasses(): Promise<Class[]> {
    try {
      const snapshot = await this.getCollection(TimetableService.CLASSES_COLLECTION_NAME).get()
      return snapshot.docs.map(doc => doc.data() as Class)
    } catch (error) {
      console.error('수업 목록 조회 오류:', error)
      throw error
    }
  }

  // ===== 교사 관리 =====

  async createTeacher(data: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Promise<Teacher> {
    try {
      const teacher: Teacher = {
        id: this.generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await this.getCollection(TimetableService.TEACHERS_COLLECTION_NAME).doc(teacher.id).set(teacher)
      return teacher
    } catch (error) {
      console.error('교사 생성 오류:', error)
      throw error
    }
  }

  async getAllTeachers(): Promise<Teacher[]> {
    try {
      const snapshot = await this.getCollection(TimetableService.TEACHERS_COLLECTION_NAME).get()
      return snapshot.docs.map(doc => doc.data() as Teacher)
    } catch (error) {
      console.error('교사 목록 조회 오류:', error)
      throw error
    }
  }

  // ===== 강의실 관리 =====

  async createClassroom(data: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt'>): Promise<Classroom> {
    try {
      const classroom: Classroom = {
        id: this.generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await this.getCollection(TimetableService.CLASSROOMS_COLLECTION_NAME).doc(classroom.id).set(classroom)
      return classroom
    } catch (error) {
      console.error('강의실 생성 오류:', error)
      throw error
    }
  }

  async getAllClassrooms(): Promise<Classroom[]> {
    try {
      const snapshot = await this.getCollection(TimetableService.CLASSROOMS_COLLECTION_NAME).get()
      return snapshot.docs.map(doc => doc.data() as Classroom)
    } catch (error) {
      console.error('강의실 목록 조회 오류:', error)
      throw error
    }
  }

  // ===== 통계 및 요약 =====

  async getTimetableSummary(timetableId: string): Promise<TimetableSummary> {
    try {
      const [timetable, items, classes] = await Promise.all([
        this.getTimetableById(timetableId),
        this.getTimetableItemsByTimetable(timetableId),
        this.getAllClasses()
      ])

      if (!timetable) {
        throw new Error('시간표를 찾을 수 없습니다.')
      }

      const uniqueClassIds = [...new Set(items.map(item => item.classId))]
      const uniqueTeacherIds = [...new Set(items.map(item => item.teacherId))]
      const uniqueRoomIds = [...new Set(items.map(item => item.roomId).filter(Boolean))]

      return {
        id: timetable.id,
        name: timetable.name,
        totalClasses: uniqueClassIds.length,
        totalTeachers: uniqueTeacherIds.length,
        totalStudents: classes.reduce((sum, cls) => sum + cls.currentStudents, 0),
        totalClassrooms: uniqueRoomIds.length,
        academicYear: timetable.academicYear,
        semester: timetable.semester,
        isActive: timetable.isActive
      }
    } catch (error) {
      console.error('시간표 요약 조회 오류:', error)
      throw error
    }
  }
}
