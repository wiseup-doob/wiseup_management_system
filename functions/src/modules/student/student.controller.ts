import { Request, Response, NextFunction } from "express";
import {
  createStudent,
  getStudentById,
  getStudentByUserId,
  getStudentWithUser,
  updateStudent,
  deleteStudent,
  getAllStudents,
  getStudentsByFilter,
  createParentStudentRelation,
  getParentsByStudentId,
  getStudentsByParentId,
} from "./student.service";
import { CreateStudentRequest, UpdateStudentRequest, StudentFilter } from "./student.types";

// 학생 생성
export const createStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const studentData: CreateStudentRequest = req.body;
    const student = await createStudent(studentData);

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error: any) {
    next(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 학생 ID로 조회
export const getStudentByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { studentId } = req.params;
    const student = await getStudentById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    next(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 사용자 ID로 학생 조회
export const getStudentByUserIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const student = await getStudentByUserId(userId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    next(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 학생과 사용자 정보 함께 조회
export const getStudentWithUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { studentId } = req.params;
    const studentWithUser = await getStudentWithUser(studentId);

    if (!studentWithUser) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: studentWithUser,
    });
  } catch (error: any) {
    next(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 학생 업데이트
export const updateStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { studentId } = req.params;
    const updateData: UpdateStudentRequest = req.body;
    const updatedStudent = await updateStudent(studentId, updateData);

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error: any) {
    next(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 학생 삭제
export const deleteStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { studentId } = req.params;
    await deleteStudent(studentId);

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error: any) {
    next(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 모든 학생 조회
export const getAllStudentsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const students = await getAllStudents();

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error: any) {
    next(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 필터로 학생 조회
export const getStudentsByFilterController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const filter: StudentFilter = req.query as any;
    const students = await getStudentsByFilter(filter);

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error: any) {
    next(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 부모-학생 관계 생성
export const createParentStudentRelationController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { parent_id, student_id } = req.body;
    const relation = await createParentStudentRelation(parent_id, student_id);

    return res.status(201).json({
      success: true,
      message: "Parent-student relation created successfully",
      data: relation,
    });
  } catch (error: any) {
    next(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 학생의 부모 목록 조회
export const getParentsByStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { studentId } = req.params;
    const parentIds = await getParentsByStudentId(studentId);

    return res.status(200).json({
      success: true,
      data: parentIds,
    });
  } catch (error: any) {
    next(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 부모의 학생 목록 조회
export const getStudentsByParentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { parentId } = req.params;
    const students = await getStudentsByParentId(parentId);

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error: any) {
    next(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
