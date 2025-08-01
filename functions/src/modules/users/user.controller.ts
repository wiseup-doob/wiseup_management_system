import {Request, Response} from "express";
import * as svc from "./user.service";

// 사용자 생성
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const user = await svc.createUser(req.body);
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
};

// 전체 사용자 목록 조회
export const getAllUsers = async (_: Request, res: Response): Promise<void> => {
  const users = await svc.getAllUsers();
  res.json(users);
};

// 특정 사용자 조회
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const user = await svc.getUserById(req.params.id);

  if (!user) {
    const error = new Error("User not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json(user);
};

// 이메일로 사용자 조회
export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
  const email = req.params.email;
  const user = await svc.getUserByEmail(email);

  if (!user) {
    const error = new Error("User not found")
    ;(error as any).status = 404;
    throw error;
  }

  res.json(user);
};

// 사용자 정보 업데이트
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const user = await svc.updateUser(req.params.id, req.body);
  res.json({
    message: "User updated successfully",
    user,
  });
};

// 사용자 삭제
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  await svc.deleteUser(req.params.id);
  res.json({
    message: "User deleted successfully",
  });
};

// 필터로 사용자 검색
export const getUsersByFilter = async (req: Request, res: Response): Promise<void> => {
  // route에서 검증된 query parameter 사용
  const filter = (req as any).validatedQuery;
  const users = await svc.getUsersByFilter(filter);
  res.json(users);
};

// 이메일 중복 체크
export const checkEmailAvailability = async (req: Request, res: Response): Promise<void> => {
  const email = req.params.email;
  const exists = await svc.checkEmailExists(email);
  res.json({
    email,
    available: !exists,
    message: exists ? "Email already exists" : "Email is available",
  });
};

// 전화번호 중복 체크
export const checkPhoneAvailability = async (req: Request, res: Response): Promise<void> => {
  const phone = req.params.phone;
  const exists = await svc.checkPhoneExists(phone);
  res.json({
    phone,
    available: !exists,
    message: exists ? "Phone number already exists" : "Phone number is available",
  });
};
