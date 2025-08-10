import { BaseController } from './BaseController';
import { StudentService } from '../services/student/StudentService';
import { AttendanceService } from '../services/attendance/AttendanceService';
import { SeatService } from '../services/seat/SeatService';
import { SeatAssignmentService } from '../services/assignment/SeatAssignmentService';
import { TimetableService } from '../services/timetable/TimetableService';
import { 
  sampleTimeSlots, 
  sampleTeachers, 
  sampleClassrooms, 
  sampleClasses, 
  sampleTimetableRequest,
  sampleTimetableItems 
} from '../services/timetable/timetableData';
import type { 
  ApiResponse
} from '@shared/types';
import { 
  AppError, 
  ERROR_CODES, 
  createErrorResponse, 
  logError 
} from '@shared/utils/error.utils';
import { SEAT_CONFIG } from '@shared/constants/seat.constants';

export class InitializationController extends BaseController {
  constructor(
    private studentService: StudentService,
    private attendanceService: AttendanceService,
    private seatService: SeatService,
    private seatAssignmentService: SeatAssignmentService,
    private timetableService: TimetableService
  ) {
    super();
  }

  async initializeAllData(request: any, response: any): Promise<void> {
    const requestId = request.headers['x-request-id'];
    
    try {
      console.log('=== 전체 데이터 초기화 시작 ===');
      
      // 1. 학생 데이터 초기화
      console.log('1. 학생 데이터 초기화 중...');
      await this.studentService.initializeStudents();
      console.log('✅ 학생 데이터 초기화 완료');
      
      // 2. 좌석 데이터 초기화
      console.log('2. 좌석 데이터 초기화 중...');
      await this.seatService.initializeSeats();
      console.log('✅ 좌석 데이터 초기화 완료');
      
      // 3. 학생들을 좌석에 배정
      console.log('3. 학생 좌석 배정 중...');
      // 학생 데이터를 다시 조회하여 ID 목록 가져오기
      const studentsData = await this.studentService.getAllStudents();
      const studentIds = studentsData.map(student => student.id);
      await this.seatAssignmentService.initializeAssignments(studentIds);
      console.log(`✅ 학생 좌석 배정 완료: ${studentIds.length}명`);
      
      // 4. 출석 데이터 초기화 - 실제 좌석 데이터에서 seatId 가져오기
      console.log('4. 출석 데이터 초기화 중...');
      const actualSeats = await this.seatService.getAllSeats();
      const seatIds = actualSeats.map(seat => seat.seatId);
      const attendanceResult = await this.attendanceService.initializeAttendanceData(studentIds, seatIds);
      console.log(`✅ 출석 데이터 초기화 완료: ${attendanceResult.count}개 기록`);
      
      // 5. 시간표 데이터 초기화
      console.log('5. 시간표 데이터 초기화 중...');
      const timetableResult = await this.initializeTimetableData();
      console.log(`✅ 시간표 데이터 초기화 완료: ${timetableResult.statistics.timeSlots}개 시간대, ${timetableResult.statistics.teachers}명 교사, ${timetableResult.statistics.classes}개 수업`);
      
      console.log('=== 전체 데이터 초기화 완료 ===');
      
      const apiResponse: ApiResponse<{
        students: number;
        seats: number;
        assignments: number;
        attendanceRecords: number;
        timetable: {
          timeSlots: number;
          teachers: number;
          classrooms: number;
          classes: number;
          timetableItems: number;
        };
        message: string;
      }> = {
        success: true,
        data: {
          students: studentsData.length,
          seats: SEAT_CONFIG.TOTAL_SEATS, // 상수 사용
          assignments: studentIds.length,
          attendanceRecords: attendanceResult.count,
          timetable: timetableResult.statistics,
          message: '모든 데이터가 성공적으로 초기화되었습니다.'
        },
        message: '모든 데이터가 성공적으로 초기화되었습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId
        }
      };
      
      response.json(apiResponse);
    } catch (error) {
      const appError = AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, '데이터 초기화 중 오류가 발생했습니다.', error, requestId);
      logError(appError, { component: 'InitializationController', action: 'initializeAllData' });
      
      const errorResponse = createErrorResponse(appError);
      response.status(appError.statusCode).json(errorResponse);
    }
  }

  private async initializeTimetableData(): Promise<{
    timetable: any;
    summary: any;
    statistics: {
      timeSlots: number;
      teachers: number;
      classrooms: number;
      classes: number;
      timetableItems: number;
    };
  }> {
    // 1. 시간대 데이터 초기화
    console.log('   1-1. 시간대 데이터 초기화 중...');
    const timeSlots = [];
    for (const timeSlotData of sampleTimeSlots) {
      const timeSlot = await this.timetableService.createTimeSlot(timeSlotData);
      timeSlots.push(timeSlot);
    }
    console.log(`   ✅ ${timeSlots.length}개의 시간대 생성 완료`);

    // 2. 교사 데이터 초기화
    console.log('   1-2. 교사 데이터 초기화 중...');
    const teachers = [];
    for (const teacherData of sampleTeachers) {
      const teacher = await this.timetableService.createTeacher(teacherData);
      teachers.push(teacher);
    }
    console.log(`   ✅ ${teachers.length}명의 교사 생성 완료`);

    // 3. 강의실 데이터 초기화
    console.log('   1-3. 강의실 데이터 초기화 중...');
    const classrooms = [];
    for (const classroomData of sampleClassrooms) {
      const classroom = await this.timetableService.createClassroom(classroomData);
      classrooms.push(classroom);
    }
    console.log(`   ✅ ${classrooms.length}개의 강의실 생성 완료`);

    // 4. 수업 데이터 초기화 (교사 ID 매핑)
    console.log('   1-4. 수업 데이터 초기화 중...');
    const classes = [];
    for (let i = 0; i < sampleClasses.length; i++) {
      const classData = {
        ...sampleClasses[i],
        teacherId: teachers[i]?.id || `teacher_${i + 1}` // 실제 교사 ID로 매핑
      };
      const classItem = await this.timetableService.createClass(classData);
      classes.push(classItem);
    }
    console.log(`   ✅ ${classes.length}개의 수업 생성 완료`);

    // 5. 시간표 생성
    console.log('   1-5. 시간표 생성 중...');
    const timetable = await this.timetableService.createTimetable(sampleTimetableRequest);
    console.log(`   ✅ ${timetable.name} 생성 완료`);

    // 6. 시간표 항목 생성 (수업 ID와 교사 ID 매핑)
    console.log('   1-6. 시간표 항목 생성 중...');
    const timetableItems = [];
    for (let i = 0; i < sampleTimetableItems.length; i++) {
      const itemData = {
        ...sampleTimetableItems[i],
        classId: classes[i]?.id || `class_${i + 1}`,
        teacherId: teachers[i]?.id || `teacher_${i + 1}`,
        timeSlotId: timeSlots[0]?.id || `time_${i + 1}`,
        roomId: classrooms[0]?.id || `room_${i + 1}`
      };
      const item = await this.timetableService.createTimetableItem(itemData);
      timetableItems.push(item);
    }
    console.log(`   ✅ ${timetableItems.length}개의 시간표 항목 생성 완료`);

    // 7. 시간표 요약 생성
    console.log('   1-7. 시간표 요약 생성 중...');
    const summary = await this.timetableService.getTimetableSummary(timetable.id);
    console.log(`   ✅ 총 ${summary.totalClasses}개 수업, ${summary.totalTeachers}명 교사, ${summary.totalStudents}명 학생`);

    return {
      timetable: timetable,
      summary: summary,
      statistics: {
        timeSlots: timeSlots.length,
        teachers: teachers.length,
        classrooms: classrooms.length,
        classes: classes.length,
        timetableItems: timetableItems.length
      }
    };
  }
}
