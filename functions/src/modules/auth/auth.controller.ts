import {Request, Response} from "express";
import * as svc from "./auth.service";

// 회원가입
export const register = async (req: Request, res: Response): Promise<void> => {
  const registerResponse = await svc.register(req.body);
  res.status(201).json({
    message: "Registration successful",
    ...registerResponse,
  });
};

// 로그인
export const login = async (req: Request, res: Response): Promise<void> => {
  const loginResponse = await svc.login(req.body);
  res.json({
    message: "Login successful",
    ...loginResponse,
  });
};

// 로그아웃
export const logout = async (req: Request, res: Response): Promise<void> => {
  await svc.logout(req.params.id);
  res.json({
    message: "Logout successful",
  });
};

// 비밀번호 변경
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  await svc.changePassword(req.params.id, req.body);
  res.json({
    message: "Password changed successfully",
  });
};

// 비밀번호 재설정 요청
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  await svc.requestPasswordReset(req.body.email);
  res.json({
    message: "Password reset email sent (if email exists)",
  });
};

// 비밀번호 재설정 확인
export const confirmPasswordReset = async (req: Request, res: Response): Promise<void> => {
  await svc.confirmPasswordReset(req.body.token, req.body.newPassword);
  res.json({
    message: "Password reset successfully",
  });
};

// 토큰 검증
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  const result = await svc.verifyToken(req.body.token);
  res.json(result);
};

// 토큰 갱신
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const result = await svc.refreshToken(req.body.refreshToken);
  res.json({
    message: "Token refreshed successfully",
    ...result,
  });
};
