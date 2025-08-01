import { Request, Response } from "express";
import {
  createClass,
  getClassById,
  updateClass,
  deleteClass,
  getClassesByFilter,
  getAllClasses,
  getClassWithTeacher,
  getClassWithSubject,
  getClassWithStudents,
  getClassWithDetails,
  checkClassNameExists,
  checkSubjectExists
} from "./class.service";
import { CreateClassRequest, UpdateClassRequest, ClassFilter } from "./class.types";

// 반 생성
export async function createClassController(req: Request, res: Response): Promise<Response> {
  try {
    const data: CreateClassRequest = req.body;

    // 반 이름 중복 체크
    const nameExists = await checkClassNameExists(data.class_name);
    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: "이미 존재하는 반 이름입니다",
      });
    }

    // 과목 ID 유효성 체크
    const subjectExists = await checkSubjectExists(data.subject_id);
    if (!subjectExists) {
      return res.status(400).json({
        success: false,
        message: "존재하지 않는 과목 ID입니다",
      });
    }

    // (선택) 선생님 ID 유효성 체크
    // if ((data as any).teacher_id) {
    //   const teacherExists = await checkTeacherExists((data as any).teacher_id);
    //   if (!teacherExists) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "존재하지 않는 선생님 ID입니다",
    //     });
    //   }
    // }

    const newClass = await createClass(data);
    return res.status(201).json({
      success: true,
      data: newClass,
    });
  } catch (error) {
    console.error("반 생성 오류:", error);
    return res.status(500).json({
      success: false,
      message: "반 생성 중 오류가 발생했습니다",
    });
  }
}

// 반 ID로 반 조회
export async function getClassByIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const classData = await getClassById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "반을 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error("반 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "반 조회 중 오류가 발생했습니다",
    });
  }
}

// 반 업데이트
export async function updateClassController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const data: UpdateClassRequest = req.body;

    // 반 이름 중복 체크 (자신 제외)
    if (data.class_name) {
      const nameExists = await checkClassNameExists(data.class_name, id);
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: "이미 존재하는 반 이름입니다",
        });
      }
    }

    // 과목 ID 유효성 체크
    if (data.subject_id) {
      const subjectExists = await checkSubjectExists(data.subject_id);
      if (!subjectExists) {
        return res.status(400).json({
          success: false,
          message: "존재하지 않는 과목 ID입니다",
        });
      }
    }

    // (선택) 선생님 ID 유효성 체크
    // if ((data as any).teacher_id) {
    //   const teacherExists = await checkTeacherExists((data as any).teacher_id);
    //   if (!teacherExists) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "존재하지 않는 선생님 ID입니다",
    //     });
    //   }
    // }

    const updatedClass = await updateClass(id, data);

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "반을 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedClass,
    });
  } catch (error) {
    console.error("반 업데이트 오류:", error);
    return res.status(500).json({
      success: false,
      message: "반 업데이트 중 오류가 발생했습니다",
    });
  }
}

// 반 삭제
export async function deleteClassController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const deleted = await deleteClass(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "반을 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      message: "반이 성공적으로 삭제되었습니다",
    });
  } catch (error) {
    console.error("반 삭제 오류:", error);
    return res.status(500).json({
      success: false,
      message: "반 삭제 중 오류가 발생했습니다",
    });
  }
}

// 필터로 반 조회
export async function getClassesByFilterController(req: Request, res: Response): Promise<Response> {
  try {
    const filter: ClassFilter = req.query as any;
    const classes = await getClassesByFilter(filter);

    return res.status(200).json({
      success: true,
      data: classes,
      count: classes.length,
    });
  } catch (error) {
    console.error("반 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "반 조회 중 오류가 발생했습니다",
    });
  }
}

// 모든 반 조회
export async function getAllClassesController(req: Request, res: Response): Promise<Response> {
  try {
    const classes = await getAllClasses();

    return res.status(200).json({
      success: true,
      data: classes,
      count: classes.length,
    });
  } catch (error) {
    console.error("모든 반 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "반 조회 중 오류가 발생했습니다",
    });
  }
}

// 반과 선생님 정보 함께 조회
export async function getClassWithTeacherController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const classData = await getClassWithTeacher(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "반을 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error("반과 선생님 정보 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "반과 선생님 정보 조회 중 오류가 발생했습니다",
    });
  }
}

// 반과 과목 정보 함께 조회
export async function getClassWithSubjectController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const classData = await getClassWithSubject(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "반을 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error("반과 과목 정보 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "반과 과목 정보 조회 중 오류가 발생했습니다",
    });
  }
}

// 반과 학생 정보 함께 조회
export async function getClassWithStudentsController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const classData = await getClassWithStudents(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "반을 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error("반과 학생 정보 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "반과 학생 정보 조회 중 오류가 발생했습니다",
    });
  }
}

// 반과 모든 관련 정보 함께 조회
export async function getClassWithDetailsController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const classData = await getClassWithDetails(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "반을 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error("반과 모든 정보 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "반과 모든 정보 조회 중 오류가 발생했습니다",
    });
  }
}

// 반 이름 중복 체크
export async function checkClassNameExistsController(req: Request, res: Response): Promise<Response> {
  try {
    const { name } = req.params;
    const exists = await checkClassNameExists(name);

    return res.status(200).json({
      success: true,
      data: { exists },
    });
  } catch (error) {
    console.error("반 이름 중복 체크 오류:", error);
    return res.status(500).json({
      success: false,
      message: "반 이름 중복 체크 중 오류가 발생했습니다",
    });
  }
}
