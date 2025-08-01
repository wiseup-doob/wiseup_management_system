import {Router} from "express";
import {AttendanceController} from "./attendance.controller";

const router = Router();
const attendanceController = new AttendanceController();

// 출석 관리 라우트
router.post("/", attendanceController.createAttendance.bind(attendanceController));
router.get("/", attendanceController.getAttendanceList.bind(attendanceController));
router.get("/:attendanceId", attendanceController.getAttendance.bind(attendanceController));
router.put("/:attendanceId", attendanceController.updateAttendance.bind(attendanceController));
router.delete("/:attendanceId", attendanceController.deleteAttendance.bind(attendanceController));

// 학생별 출석 관리 라우트
router.get("/student/:studentId/date/:date", attendanceController.getAttendanceByStudentAndDate.bind(attendanceController));
router.post("/checkinout", attendanceController.checkInOut.bind(attendanceController));

// 출석 통계 라우트
router.get("/student/:studentId/stats", attendanceController.getStudentAttendanceStats.bind(attendanceController));
router.get("/daily/:date/summary", attendanceController.getDailyAttendanceSummary.bind(attendanceController));
router.get("/summaries", attendanceController.getStudentAttendanceSummaries.bind(attendanceController));

export default router;
