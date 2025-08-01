import { Request, Response } from "express";
import {
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  getAllRoles,
  getRolesByFilter,
} from "./roles.service";
import { CreateRoleRequest, UpdateRoleRequest, RoleFilter } from "./roles.types";

// 역할 생성
export async function createRoleController(req: Request, res: Response): Promise<Response> {
  try {
    const data: CreateRoleRequest = req.body;
    const role = await createRole(data);

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    console.error("역할 생성 오류:", error);
    return res.status(500).json({
      success: false,
      message: "역할 생성 중 오류가 발생했습니다",
    });
  }
}

// 역할 ID로 조회
export async function getRoleByIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const role = await getRoleById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "역할을 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error("역할 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "역할 조회 중 오류가 발생했습니다",
    });
  }
}

// 역할 업데이트
export async function updateRoleController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const data: UpdateRoleRequest = req.body;
    const updatedRole = await updateRole(id, data);

    if (!updatedRole) {
      return res.status(404).json({
        success: false,
        message: "역할을 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      message: "역할이 성공적으로 업데이트되었습니다",
      data: updatedRole,
    });
  } catch (error) {
    console.error("역할 업데이트 오류:", error);
    return res.status(500).json({
      success: false,
      message: "역할 업데이트 중 오류가 발생했습니다",
    });
  }
}

// 역할 삭제
export async function deleteRoleController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const deleted = await deleteRole(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "역할을 찾을 수 없습니다",
      });
    }

    return res.status(200).json({
      success: true,
      message: "역할이 성공적으로 삭제되었습니다",
    });
  } catch (error) {
    console.error("역할 삭제 오류:", error);
    return res.status(500).json({
      success: false,
      message: "역할 삭제 중 오류가 발생했습니다",
    });
  }
}

// 모든 역할 조회
export async function getAllRolesController(req: Request, res: Response): Promise<Response> {
  try {
    const roles = await getAllRoles();

    return res.status(200).json({
      success: true,
      data: roles,
      count: roles.length,
    });
  } catch (error) {
    console.error("모든 역할 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "역할 조회 중 오류가 발생했습니다",
    });
  }
}

// 필터로 역할 조회
export async function getRolesByFilterController(req: Request, res: Response): Promise<Response> {
  try {
    const filter: RoleFilter = req.query as any;
    const roles = await getRolesByFilter(filter);

    return res.status(200).json({
      success: true,
      data: roles,
      count: roles.length,
    });
  } catch (error) {
    console.error("역할 조회 오류:", error);
    return res.status(500).json({
      success: false,
      message: "역할 조회 중 오류가 발생했습니다",
    });
  }
}
