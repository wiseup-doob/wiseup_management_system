import { Request, Response } from "express";
import {
  assignUserRole,
  getUserRoles,
  removeUserRole,
  hasRole,
  getUserRolesByFilter,
  getUserWithRoles,
  getRoleWithUsers,
  checkUserExists,
  checkRoleExists,
} from "./user_roles.service";
import { AssignUserRoleRequest, UserRoleFilter } from "./user_roles.types";

// 사용자에게 역할 할당
export async function assignUserRoleController(req: Request, res: Response): Promise<Response> {
  try {
    const data: AssignUserRoleRequest = req.body;

    // 사용자 ID 유효성 체크
    const userExists = await checkUserExists(data.user_id);
    if (!userExists) {
      return res.status(400).json({
        success: false,
        message: "존재하지 않는 사용자 ID입니다",
      });
    }

    // 역할 ID 유효성 체크
    const roleExists = await checkRoleExists(data.role_id);
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        message: "존재하지 않는 역할 ID입니다",
      });
    }

    // 이미 할당된 역할인지 확인
    const alreadyHasRole = await hasRole(data.user_id, data.role_id);
    if (alreadyHasRole) {
      return res.status(400).json({
        success: false,
        message: "이미 할당된 역할입니다",
      });
    }

    const userRole = await assignUserRole(data);
    return res.status(201).json({
      success: true,
      data: userRole,
    });
  } catch (error) {
    console.error("사용자 역할 할당 오류:", error);
    return res.status(500).json({
      success: false,
      message: "사용자 역할 할당 중 오류가 발생했습니다",
    });
  }
}

// 사용자 역할 조회
export async function getUserRolesController(req: Request, res: Response): Promise<Response> {
  try {
    const { userId } = req.params;
    const userRoles = await getUserRoles(userId);

    return res.status(200).json({
      success: true,
      data: userRoles,
      count: userRoles.length,
    });
  } catch (error) {
    console.error("사용자 역할 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "사용자 역할 조회 중 오류가 발생했습니다",
    });
  }
}

// 사용자 역할 삭제
export async function removeUserRoleController(req: Request, res: Response): Promise<Response> {
  try {
    const { userId, roleId } = req.params;
    const removed = await removeUserRole(userId, roleId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "사용자 역할을 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      message: "사용자 역할이 성공적으로 삭제되었습니다",
    });
  } catch (error) {
    console.error("사용자 역할 삭제 오류:", error);
    return res.status(500).json({
      success: false,
      message: "사용자 역할 삭제 중 오류가 발생했습니다",
    });
  }
}

// 사용자가 특정 역할을 가지고 있는지 확인
export async function hasRoleController(req: Request, res: Response): Promise<Response> {
  try {
    const { userId, roleId } = req.params;
    const hasRoleResult = await hasRole(userId, roleId);

    return res.status(200).json({
      success: true,
      data: { hasRole: hasRoleResult },
    });
  } catch (error) {
    console.error("역할 확인 오류:", error);
    return res.status(500).json({
      success: false,
      message: "역할 확인 중 오류가 발생했습니다",
    });
  }
}

// 필터로 사용자 역할 조회
export async function getUserRolesByFilterController(req: Request, res: Response): Promise<Response> {
  try {
    const filter: UserRoleFilter = req.query as any;
    const userRoles = await getUserRolesByFilter(filter);

    return res.status(200).json({
      success: true,
      data: userRoles,
      count: userRoles.length,
    });
  } catch (error) {
    console.error("사용자 역할 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "사용자 역할 조회 중 오류가 발생했습니다",
    });
  }
}

// 사용자와 역할 정보 함께 조회
export async function getUserWithRolesController(req: Request, res: Response): Promise<Response> {
  try {
    const { userId } = req.params;
    const userData = await getUserWithRoles(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("사용자와 역할 정보 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "사용자와 역할 정보 조회 중 오류가 발생했습니다",
    });
  }
}

// 역할과 사용자 정보 함께 조회
export async function getRoleWithUsersController(req: Request, res: Response): Promise<Response> {
  try {
    const { roleId } = req.params;
    const roleData = await getRoleWithUsers(roleId);

    if (!roleData) {
      return res.status(404).json({
        success: false,
        message: "역할을 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      data: roleData,
    });
  } catch (error) {
    console.error("역할과 사용자 정보 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "역할과 사용자 정보 조회 중 오류가 발생했습니다",
    });
  }
}
