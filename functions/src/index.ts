import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import {errorHandler} from "./common/errorHandler";
import studentRoute from "./modules/student/student.route";
import authRoute from "./modules/auth/auth.route";
import userRoute from "./modules/users/user.route";
import rolesRoute from "./modules/roles/roles.route";
import userRolesRoute from "./modules/user_roles/user_roles.route";
import parentsRoute from "./modules/parents/parents.route";
import attendanceRoute from "./modules/attendance/attendance.route";
import teacherRoute from "./modules/teacher/teacher.route";
import subjectsRoute from "./modules/subjects/subjects.route";
import classRoute from "./modules/class/class.route";
import teacherSubjectsRoute from "./modules/teacher_subjects/teacher_subjects.route";
import classStudentsRoute from "./modules/class_students/class_students.route";
import schedulesRoute from "./modules/schedules/schedules.route";

const app = express();
app.use(cors({origin: true}));
app.use(express.json());

// 도메인별 router mount
app.use("/students", studentRoute);
app.use("/auth", authRoute); // 인증 관련 API
app.use("/users", userRoute); // 사용자 관리 API
app.use("/roles", rolesRoute); // 역할 관리 API
app.use("/user-roles", userRolesRoute); // 사용자-역할 관리 API
app.use("/parents", parentsRoute); // 부모 관리 API
app.use("/attendance", attendanceRoute); // 출석 관리 API
app.use("/teachers", teacherRoute); // 선생님 관리 API
app.use("/subjects", subjectsRoute); // 과목 관리 API
app.use("/classes", classRoute); // 반 관리 API
app.use("/teacher-subjects", teacherSubjectsRoute); // 선생님-과목 관계 관리 API
app.use("/class-students", classStudentsRoute); // 반-학생 관계 관리 API
app.use("/schedules", schedulesRoute); // 일정 관리 API

app.use(errorHandler); // 전역 에러 미들웨어

export const api = functions.https.onRequest(app);
