import { BaseController } from './BaseController'
import { TimetableService } from '../services/timetable/TimetableService'
import { 
  sampleTimeSlots, 
  sampleTeachers, 
  sampleClassrooms, 
  sampleClasses, 
  sampleTimetableRequest,
  sampleTimetableItems 
} from '../services/timetable/timetableData'

export class TimetableInitializationController extends BaseController {
  private timetableService: TimetableService

  constructor() {
    super()
    this.timetableService = new TimetableService()
  }

  async initializeTimetableData(req: any, res: any) {
    try {
      console.log('=== 시간표 데이터 초기화 시작 ===')

      // 1. 시간대 데이터 초기화
      console.log('1. 시간대 데이터 초기화 중...')
      const timeSlots = []
      for (const timeSlotData of sampleTimeSlots) {
        const timeSlot = await this.timetableService.createTimeSlot(timeSlotData)
        timeSlots.push(timeSlot)
        console.log(`   - ${timeSlot.name} (${timeSlot.startTime}-${timeSlot.endTime}) 생성 완료`)
      }
      console.log(`   ✅ ${timeSlots.length}개의 시간대 생성 완료`)

      // 2. 교사 데이터 초기화
      console.log('2. 교사 데이터 초기화 중...')
      const teachers = []
      for (const teacherData of sampleTeachers) {
        const teacher = await this.timetableService.createTeacher(teacherData)
        teachers.push(teacher)
        console.log(`   - ${teacher.name} (${teacher.subjects.join(', ')}) 생성 완료`)
      }
      console.log(`   ✅ ${teachers.length}명의 교사 생성 완료`)

      // 3. 강의실 데이터 초기화
      console.log('3. 강의실 데이터 초기화 중...')
      const classrooms = []
      for (const classroomData of sampleClassrooms) {
        const classroom = await this.timetableService.createClassroom(classroomData)
        classrooms.push(classroom)
        console.log(`   - ${classroom.name} (수용인원: ${classroom.capacity}명) 생성 완료`)
      }
      console.log(`   ✅ ${classrooms.length}개의 강의실 생성 완료`)

      // 4. 수업 데이터 초기화 (교사 ID 매핑)
      console.log('4. 수업 데이터 초기화 중...')
      const classes = []
      for (let i = 0; i < sampleClasses.length; i++) {
        const classData = {
          ...sampleClasses[i],
          teacherId: teachers[i]?.id || `teacher_${i + 1}` // 실제 교사 ID로 매핑
        }
        const classItem = await this.timetableService.createClass(classData)
        classes.push(classItem)
        console.log(`   - ${classItem.name} (${classItem.subject}) 생성 완료`)
      }
      console.log(`   ✅ ${classes.length}개의 수업 생성 완료`)

      // 5. 시간표 생성
      console.log('5. 시간표 생성 중...')
      const timetable = await this.timetableService.createTimetable(sampleTimetableRequest)
      console.log(`   - ${timetable.name} 생성 완료`)

      // 6. 시간표 항목 생성 (수업 ID와 교사 ID 매핑)
      console.log('6. 시간표 항목 생성 중...')
      const timetableItems = []
      for (let i = 0; i < sampleTimetableItems.length; i++) {
        const itemData = {
          ...sampleTimetableItems[i],
          classId: classes[i]?.id || `class_${i + 1}`,
          teacherId: teachers[i]?.id || `teacher_${i + 1}`,
          timeSlotId: timeSlots[0]?.id || `time_${i + 1}`,
          roomId: classrooms[0]?.id || `room_${i + 1}`
        }
        const item = await this.timetableService.createTimetableItem(itemData)
        timetableItems.push(item)
        console.log(`   - ${item.dayOfWeek} ${item.notes} 생성 완료`)
      }
      console.log(`   ✅ ${timetableItems.length}개의 시간표 항목 생성 완료`)

      // 7. 시간표 요약 생성
      console.log('7. 시간표 요약 생성 중...')
      const summary = await this.timetableService.getTimetableSummary(timetable.id)
      console.log(`   - 총 ${summary.totalClasses}개 수업, ${summary.totalTeachers}명 교사, ${summary.totalStudents}명 학생`)

      const result = {
        timetable: timetable,
        summary: summary,
        statistics: {
          timeSlots: timeSlots.length,
          teachers: teachers.length,
          classrooms: classrooms.length,
          classes: classes.length,
          timetableItems: timetableItems.length
        }
      }

      console.log('=== 시간표 데이터 초기화 완료 ===')
      return this.sendSuccess(res, result, '시간표 데이터가 성공적으로 초기화되었습니다.')
    } catch (error) {
      console.error('시간표 데이터 초기화 오류:', error)
      return this.sendError(res, '시간표 데이터 초기화에 실패했습니다.', 500)
    }
  }

  async clearTimetableData(req: any, res: any) {
    try {
      console.log('=== 시간표 데이터 삭제 시작 ===')

      // 모든 컬렉션의 데이터 삭제
      const collections = [
        'timetables',
        'timetable_items',
        'time_slots',
        'classes',
        'teachers',
        'classrooms'
      ]

      for (const collectionName of collections) {
        const collection = this.timetableService['getCollection'](collectionName)
        const snapshot = await collection.get()
        const batch = collection.firestore.batch()
        
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref)
        })
        
        await batch.commit()
        console.log(`   - ${collectionName} 컬렉션 ${snapshot.docs.length}개 문서 삭제 완료`)
      }

      console.log('=== 시간표 데이터 삭제 완료 ===')
      return this.sendSuccess(res, null, '시간표 데이터가 성공적으로 삭제되었습니다.')
    } catch (error) {
      console.error('시간표 데이터 삭제 오류:', error)
      return this.sendError(res, '시간표 데이터 삭제에 실패했습니다.', 500)
    }
  }
}
