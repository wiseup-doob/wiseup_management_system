import {Request, Response} from "express";
import * as svc from "./class_students.service";

// 반-학생 관계 생성
export const createClassStudent = async (req: Request, res: Response): Promise<void> => {
  const classStudent = await svc.createClassStudent(req.body);
  res.status(201).json({
    success: true,
    message: "Student enrolled in class successfully",
    data: classStudent,
  });
};

// 반-학생 관계 조회
export const getClassStudent = async (req: Request, res: Response): Promise<void> => {
  const {classId, studentId} = req.params;
  const classStudent = await svc.getClassStudent(classId, studentId);

  if (!classStudent) {
    const error = new Error("Class-student relationship not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: classStudent,
  });
};

// 반의 모든 학생 관계 조회
export const getClassStudents = async (req: Request, res: Response): Promise<void> => {
  const {classId} = req.params;
  const classStudents = await svc.getClassStudents(classId);

  res.json({
    success: true,
    data: classStudents,
  });
};

// 학생의 모든 반 관계 조회
export const getStudentClasses = async (req: Request, res: Response): Promise<void> => {
  const {studentId} = req.params;
  const studentClasses = await svc.getStudentClasses(studentId);

  res.json({
    success: true,
    data: studentClasses,
  });
};

// 반-학생 관계 업데이트
export const updateClassStudent = async (req: Request, res: Response): Promise<void> => {
  const {classId, studentId} = req.params;
  const classStudent = await svc.updateClassStudent(classId, studentId, req.body);

  if (!classStudent) {
    const error = new Error("Class-student relationship not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    message: "Class-student relationship updated successfully",
    data: classStudent,
  });
};

// 반-학생 관계 삭제
export const deleteClassStudent = async (req: Request, res: Response): Promise<void> => {
  const {classId, studentId} = req.params;
  const deleted = await svc.deleteClassStudent(classId, studentId);

  if (!deleted) {
    const error = new Error("Class-student relationship not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    message: "Student removed from class successfully",
  });
};

// 필터로 반-학생 관계 조회
export const getClassStudentsByFilter = async (req: Request, res: Response): Promise<void> => {
  const filter = (req as any).validatedQuery;
  const classStudents = await svc.getClassStudentsByFilter(filter);

  res.json({
    success: true,
    data: classStudents,
  });
};

// 반-학생 관계와 상세 정보 함께 조회
export const getClassStudentWithDetails = async (req: Request, res: Response): Promise<void> => {
  const {classId, studentId} = req.params;
  const classStudent = await svc.getClassStudentWithDetails(classId, studentId);

  if (!classStudent) {
    const error = new Error("Class-student relationship not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: classStudent,
  });
};

// 반과 모든 학생 정보 함께 조회
export const getClassWithStudents = async (req: Request, res: Response): Promise<void> => {
  const {classId} = req.params;
  const classWithStudents = await svc.getClassWithStudents(classId);

  if (!classWithStudents) {
    const error = new Error("Class not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: classWithStudents,
  });
};

// 학생과 모든 반 정보 함께 조회
export const getStudentWithClasses = async (req: Request, res: Response): Promise<void> => {
  const {studentId} = req.params;
  const studentWithClasses = await svc.getStudentWithClasses(studentId);

  if (!studentWithClasses) {
    const error = new Error("Student not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: studentWithClasses,
  });
};
