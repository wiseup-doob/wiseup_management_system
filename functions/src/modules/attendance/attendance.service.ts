import {db} from "../../config/firebase";
import {
  Attendance,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  AttendanceFilter,
  AttendanceStats,
  DailyAttendanceSummary,
  StudentAttendanceSummary,
  CheckInOutRequest,
} from "./attendance.types";

export class AttendanceService {
  private attendanceCollection = db.collection("attendance");

  // 출석 생성
  async createAttendance(attendanceData: CreateAttendanceRequest): Promise<Attendance> {
    const now = new Date();
    const attendanceId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const attendance: Attendance = {
      attendance_id: attendanceId,
      student_id: attendanceData.student_id,
      att_date: attendanceData.att_date,
      status: attendanceData.status,
      reason: attendanceData.reason,
      checkin_time: attendanceData.checkin_time,
      checkout_time: attendanceData.checkout_time,
      created_at: now as any,
      updated_at: now as any,
    };

    await this.attendanceCollection.doc(attendanceId).set(attendance);
    return attendance;
  }

  // 출석 조회
  async getAttendance(attendanceId: string): Promise<Attendance | null> {
    const doc = await this.attendanceCollection.doc(attendanceId).get();
    return doc.exists ? doc.data() as Attendance : null;
  }

  // 학생의 특정 날짜 출석 조회
  async getAttendanceByStudentAndDate(studentId: string, date: string): Promise<Attendance | null> {
    const snapshot = await this.attendanceCollection
      .where("student_id", "==", studentId)
      .where("att_date", "==", date)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Attendance;
  }

  // 출석 목록 조회
  async getAttendanceList(filter: AttendanceFilter): Promise<Attendance[]> {
    let query: any = this.attendanceCollection;

    if (filter.student_id) {
      query = query.where("student_id", "==", filter.student_id);
    }

    if (filter.att_date) {
      query = query.where("att_date", "==", filter.att_date);
    }

    if (filter.status) {
      query = query.where("status", "==", filter.status);
    }

    if (filter.date_range) {
      query = query
        .where("att_date", ">=", filter.date_range.from)
        .where("att_date", "<=", filter.date_range.to);
    }

    const snapshot = await query.orderBy("att_date", "desc").get();
    return snapshot.docs.map((doc: any) => doc.data() as Attendance);
  }

  // 출석 업데이트
  async updateAttendance(attendanceId: string, updateData: UpdateAttendanceRequest): Promise<Attendance | null> {
    const updateDataWithTimestamp = {
      ...updateData,
      updated_at: new Date() as any,
    };

    await this.attendanceCollection.doc(attendanceId).update(updateDataWithTimestamp);
    return this.getAttendance(attendanceId);
  }

  // 출석 삭제
  async deleteAttendance(attendanceId: string): Promise<boolean> {
    try {
      await this.attendanceCollection.doc(attendanceId).delete();
      return true;
    } catch (error) {
      return false;
    }
  }

  // 체크인/체크아웃
  async checkInOut(request: CheckInOutRequest): Promise<Attendance | null> {
    const currentTime = request.time || new Date().toTimeString().slice(0, 5);
    const today = new Date().toISOString().split("T")[0];

    // 기존 출석 기록 확인
    const attendance = await this.getAttendanceByStudentAndDate(request.student_id, today);

    if (!attendance) {
      // 새로운 출석 기록 생성
      const createRequest: CreateAttendanceRequest = {
        student_id: request.student_id,
        att_date: today,
        status: request.action === "checkin" ? "present" : "absent_unexcused",
        checkin_time: request.action === "checkin" ? currentTime : undefined,
        checkout_time: request.action === "checkout" ? currentTime : undefined,
      };
      return await this.createAttendance(createRequest);
    }

    // 기존 기록 업데이트
    const updateData: UpdateAttendanceRequest = {};

    if (request.action === "checkin") {
      updateData.checkin_time = currentTime;
      updateData.status = "present";
    } else {
      updateData.checkout_time = currentTime;
    }

    return await this.updateAttendance(attendance.attendance_id, updateData);
  }

  // 학생별 출석 통계
  async getStudentAttendanceStats(studentId: string, dateRange?: { from: string; to: string }): Promise<AttendanceStats> {
    const filter: AttendanceFilter = {
      student_id: studentId,
      date_range: dateRange,
    };

    const attendanceList = await this.getAttendanceList(filter);

    const totalDays = attendanceList.length;
    const presentDays = attendanceList.filter((a) => a.status === "present").length;
    const lateDays = attendanceList.filter((a) => a.status === "late").length;
    const absentExcusedDays = attendanceList.filter((a) => a.status === "absent_excused").length;
    const absentUnexcusedDays = attendanceList.filter((a) => a.status === "absent_unexcused").length;

    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return {
      total_days: totalDays,
      present_days: presentDays,
      late_days: lateDays,
      absent_excused_days: absentExcusedDays,
      absent_unexcused_days: absentUnexcusedDays,
      attendance_rate: attendanceRate,
    };
  }

  // 일별 출석 요약
  async getDailyAttendanceSummary(date: string): Promise<DailyAttendanceSummary> {
    const attendanceList = await this.getAttendanceList({att_date: date});

    const totalStudents = attendanceList.length;
    const presentCount = attendanceList.filter((a) => a.status === "present").length;
    const lateCount = attendanceList.filter((a) => a.status === "late").length;
    const absentExcusedCount = attendanceList.filter((a) => a.status === "absent_excused").length;
    const absentUnexcusedCount = attendanceList.filter((a) => a.status === "absent_unexcused").length;

    const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    return {
      date,
      total_students: totalStudents,
      present_count: presentCount,
      late_count: lateCount,
      absent_excused_count: absentExcusedCount,
      absent_unexcused_count: absentUnexcusedCount,
      attendance_rate: attendanceRate,
    };
  }

  // 학생별 출석 요약 목록
  async getStudentAttendanceSummaries(dateRange?: { from: string; to: string }): Promise<StudentAttendanceSummary[]> {
    const filter: AttendanceFilter = {date_range: dateRange};
    const attendanceList = await this.getAttendanceList(filter);

    // 학생별로 그룹화
    const studentGroups = attendanceList.reduce((groups, attendance) => {
      if (!groups[attendance.student_id]) {
        groups[attendance.student_id] = [];
      }
      groups[attendance.student_id].push(attendance);
      return groups;
    }, {} as Record<string, Attendance[]>);

    return Object.entries(studentGroups).map(([studentId, attendances]) => {
      const totalDays = attendances.length;
      const presentDays = attendances.filter((a) => a.status === "present").length;
      const lateDays = attendances.filter((a) => a.status === "late").length;
      const absentExcusedDays = attendances.filter((a) => a.status === "absent_excused").length;
      const absentUnexcusedDays = attendances.filter((a) => a.status === "absent_unexcused").length;

      const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      // 가장 최근 출석 정보
      const sortedAttendances = attendances.sort((a, b) => b.att_date.localeCompare(a.att_date));
      const lastAttendance = sortedAttendances[0];

      return {
        student_id: studentId,
        student_name: `Student ${studentId}`, // 실제로는 users 컬렉션에서 조회
        total_days: totalDays,
        present_days: presentDays,
        late_days: lateDays,
        absent_excused_days: absentExcusedDays,
        absent_unexcused_days: absentUnexcusedDays,
        attendance_rate: attendanceRate,
        last_attendance_date: lastAttendance?.att_date,
        last_attendance_status: lastAttendance?.status,
      };
    });
  }
}
