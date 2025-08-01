import {Request, Response} from "express";
import * as svc from "./subjects.service";

// 과목 생성
export const createSubject = async (req: Request, res: Response): Promise<void> => {
  const subject = await svc.createSubject(req.body);
  res.status(201).json({
    success: true,
    message: "Subject created successfully",
    data: subject,
  });
};

// 전체 과목 목록 조회
export const getAllSubjects = async (_: Request, res: Response): Promise<void> => {
  const subjects = await svc.getAllSubjects();
  res.json({
    success: true,
    data: subjects,
  });
};


// 특정 과목 조회
export const getSubjectById = async (req: Request, res: Response): Promise<void> => {
  const subject = await svc.getSubjectById(req.params.id);

  if (!subject) {
    const error = new Error("Subject not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: subject,
  });
};


// 과목 정보 업데이트
export const updateSubject = async (req: Request, res: Response): Promise<void> => {
  const subject = await svc.updateSubject(req.params.id, req.body);
  res.json({
    success: true,
    message: "Subject updated successfully",
    data: subject,
  });
};

// 과목 삭제
export const deleteSubject = async (req: Request, res: Response): Promise<void> => {
  await svc.deleteSubject(req.params.id);
  res.json({
    success: true,
    message: "Subject deleted successfully",
  });
};

// 필터로 과목 검색
export const getSubjectsByFilter = async (req: Request, res: Response): Promise<void> => {
  // route에서 검증된 query parameter 사용
  const filter = (req as any).validatedQuery;
  const subjects = await svc.getSubjectsByFilter(filter);
  res.json({
    success: true,
    data: subjects,
  });
};

// 과목과 선생님 정보 함께 조회
export const getSubjectWithTeachers = async (req: Request, res: Response): Promise<void> => {
  const subject = await svc.getSubjectWithTeachers(req.params.id);

  if (!subject) {
    const error = new Error("Subject not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: subject,
  });
};

// 과목과 반 정보 함께 조회
export const getSubjectWithClasses = async (req: Request, res: Response): Promise<void> => {
  const subject = await svc.getSubjectWithClasses(req.params.id);

  if (!subject) {
    const error = new Error("Subject not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json({
    success: true,
    data: subject,
  });
};

// 과목 이름으로 과목 존재 여부 확인
export const checkSubjectExists = async (req: Request, res: Response): Promise<void> => {
  const subjectName = req.params.name;
  const exists = await svc.checkSubjectExists(subjectName);
  res.json({
    success: true,
    data: {
      subject_name: subjectName,
      exists,
      message: exists ? "Subject exists" : "Subject not found",
    },
  });
};
