/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { initializeFirebase } from './config/firebase';
import { studentRoutes } from './routes/student';
import { authRoutes } from './routes/auth';

// Firebase 초기화
initializeFirebase();

// 학생 관련 함수들
export const initializeStudents = studentRoutes.initializeStudents;
export const getStudents = studentRoutes.getStudents;
export const getStudentById = studentRoutes.getStudentById;

// 인증 관련 함수들
export const initializeAdmin = authRoutes.initializeAdmin;
export const login = authRoutes.login;
export const register = authRoutes.register;
export const logout = authRoutes.logout;
export const refreshToken = authRoutes.refreshToken;
export const getCurrentUser = authRoutes.getCurrentUser;
export const verifyToken = authRoutes.verifyToken;

// 기본 테스트 함수
export const helloWorld = studentRoutes.getStudents; // 임시로 getStudents를 사용
