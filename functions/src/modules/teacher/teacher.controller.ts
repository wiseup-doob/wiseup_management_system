import {Request, Response} from "express";
import * as svc from "./teacher.service";

// 선생님 생성
export const createTeacher = async (req: Request, res: Response): Promise<void> => {
  const teacher = await svc.createTeacher(req.body);
  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: teacher,
  });
};

// 전체 선생님 목록 조회
export const getAllTeachers = async (_: Request, res: Response): Promise<void> => {
  const teachers = await svc.getAllTeachers();
  res.json({
    success: true,
    data: teachers,
  });
};

// 특정 선생님 조회
export const getTeacherById = async (req: Request, res: Response): Promise<void> => {
  const teacher = await svc.getTeacherById(req.params.id);

  if (!teacher) {
    const error = new Error("Teacher not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: teacher,
  });
};

// 사용자 ID로 선생님 조회
export const getTeacherByUserId = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.userId;
  const teacher = await svc.getTeacherByUserId(userId);

  if (!teacher) {
    const error = new Error("Teacher not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: teacher,
  });
};

// 선생님 정보 업데이트
export const updateTeacher = async (req: Request, res: Response): Promise<void> => {
  const teacher = await svc.updateTeacher(req.params.id, req.body);
  res.json({
    success: true,
    message: "Teacher updated successfully",
    data: teacher,
  });
};

// 선생님 삭제
export const deleteTeacher = async (req: Request, res: Response): Promise<void> => {
  await svc.deleteTeacher(req.params.id);
  res.json({
    success: true,
    message: "Teacher deleted successfully",
  });
};

// 필터로 선생님 검색
export const getTeachersByFilter = async (req: Request, res: Response): Promise<void> => {
  // route에서 검증된 query parameter 사용
  const filter = (req as any).validatedQuery;
  const teachers = await svc.getTeachersByFilter(filter);
  res.json({
    success: true,
    data: teachers,
  });
};

// 선생님과 사용자 정보 함께 조회
export const getTeacherWithUser = async (req: Request, res: Response): Promise<void> => {
  const teacher = await svc.getTeacherWithUser(req.params.id);

  if (!teacher) {
    const error = new Error("Teacher not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: teacher,
  });
};

// 선생님과 과목 정보 함께 조회 (다대다 관계)
export const getTeacherWithSubjects = async (req: Request, res: Response): Promise<void> => {
  const teacher = await svc.getTeacherWithSubjects(req.params.id);

  if (!teacher) {
    const error = new Error("Teacher not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: teacher,
  });
};

// 선생님과 반 정보 함께 조회
export const getTeacherWithClass = async (req: Request, res: Response): Promise<void> => {
  const teacher = await svc.getTeacherWithClass(req.params.id);

  if (!teacher) {
    const error = new Error("Teacher not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: teacher,
  });
};

// 선생님에게 과목 할당 (다대다 관계)
export const assignSubjectToTeacher = async (req: Request, res: Response): Promise<void> => {
  const {teacherId, subjectId, isPrimary} = req.body;

  await svc.assignSubjectToTeacher(teacherId, subjectId, isPrimary || false);
  res.json({
    success: true,
    message: "Subject assigned to teacher successfully",
  });
};

// 선생님에서 과목 제거 (다대다 관계)
export const removeSubjectFromTeacher = async (req: Request, res: Response): Promise<void> => {
  const {teacherId, subjectId} = req.body;

  await svc.removeSubjectFromTeacher(teacherId, subjectId);
  res.json({
    success: true,
    message: "Subject removed from teacher successfully",
  });
};

// 사용자 ID로 선생님 존재 여부 확인
export const checkTeacherExists = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.userId;
  const exists = await svc.checkTeacherExists(userId);
  res.json({
    success: true,
    data: {
      user_id: userId,
      exists,
      message: exists ? "Teacher profile exists" : "Teacher profile not found",
    },
  });
};
