import * as functions from "firebase-functions";
import { StudentController } from '../controllers/StudentController';
import { StudentService } from '../services/student/StudentService';
import { setCorsHeaders, handleOptionsRequest } from '../middleware/cors';
import { createErrorResponse } from '../middleware/errorHandler';

// HTTP 핸들러 팩토리
const createHttpHandler = (handler: (request: any, response: any) => Promise<void>) => {
  return functions.https.onRequest(async (request, response) => {
    setCorsHeaders(response);

    if (handleOptionsRequest(response)) {
      return;
    }

    try {
      await handler(request, response);
    } catch (error) {
      createErrorResponse(response, error, "요청 처리 중 오류가 발생했습니다.");
    }
  });
};

// 학생 서비스 및 컨트롤러 인스턴스
const studentService = new StudentService();
const studentController = new StudentController(studentService);

// 학생 라우트
export const studentRoutes = {
  initializeStudents: createHttpHandler(async (request, response) => {
    await studentController.initializeStudents(request, response);
  }),
  
  getStudents: createHttpHandler(async (request, response) => {
    await studentController.getStudents(request, response);
  }),
  
  getStudentById: createHttpHandler(async (request, response) => {
    await studentController.getStudentById(request, response);
  }),
}; 