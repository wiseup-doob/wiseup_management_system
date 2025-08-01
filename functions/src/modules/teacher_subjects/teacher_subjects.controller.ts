import {Request, Response} from "express";
import * as svc from "./teacher_subjects.service";

// 선생님-과목 관계 생성
export const createTeacherSubject = async (req: Request, res: Response): Promise<void> => {
  const teacherSubject = await svc.createTeacherSubject(req.body);
  res.status(201).json({
    success: true,
    message: "Teacher-subject relationship created successfully",
    data: teacherSubject,
  });
};

// 선생님-과목 관계 조회
export const getTeacherSubject = async (req: Request, res: Response): Promise<void> => {
  const {teacherId, subjectId} = req.params;
  const teacherSubject = await svc.getTeacherSubject(teacherId, subjectId);

  if (!teacherSubject) {
    const error = new Error("Teacher-subject relationship not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: teacherSubject,
  });
};

// 선생님의 모든 과목 관계 조회
export const getTeacherSubjects = async (req: Request, res: Response): Promise<void> => {
  const {teacherId} = req.params;
  const teacherSubjects = await svc.getTeacherSubjects(teacherId);

  res.json({
    success: true,
    data: teacherSubjects,
  });
};

// 과목의 모든 선생님 관계 조회
export const getSubjectTeachers = async (req: Request, res: Response): Promise<void> => {
  const {subjectId} = req.params;
  const subjectTeachers = await svc.getSubjectTeachers(subjectId);

  res.json({
    success: true,
    data: subjectTeachers,
  });
};

// 선생님-과목 관계 업데이트
export const updateTeacherSubject = async (req: Request, res: Response): Promise<void> => {
  const {teacherId, subjectId} = req.params;
  const teacherSubject = await svc.updateTeacherSubject(teacherId, subjectId, req.body);

  if (!teacherSubject) {
    const error = new Error("Teacher-subject relationship not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    message: "Teacher-subject relationship updated successfully",
    data: teacherSubject,
  });
};

// 선생님-과목 관계 삭제
export const deleteTeacherSubject = async (req: Request, res: Response): Promise<void> => {
  const {teacherId, subjectId} = req.params;
  const deleted = await svc.deleteTeacherSubject(teacherId, subjectId);

  if (!deleted) {
    const error = new Error("Teacher-subject relationship not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    message: "Teacher-subject relationship deleted successfully",
  });
};

// 필터로 선생님-과목 관계 조회
export const getTeacherSubjectsByFilter = async (req: Request, res: Response): Promise<void> => {
  const filter = (req as any).validatedQuery;
  const teacherSubjects = await svc.getTeacherSubjectsByFilter(filter);

  res.json({
    success: true,
    data: teacherSubjects,
  });
};

// 선생님-과목 관계와 상세 정보 함께 조회
export const getTeacherSubjectWithDetails = async (req: Request, res: Response): Promise<void> => {
  const {teacherId, subjectId} = req.params;
  const teacherSubject = await svc.getTeacherSubjectWithDetails(teacherId, subjectId);

  if (!teacherSubject) {
    const error = new Error("Teacher-subject relationship not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: teacherSubject,
  });
};
