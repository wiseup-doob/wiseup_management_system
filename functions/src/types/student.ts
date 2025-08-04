import { BaseEntity } from './common';

export interface Student extends BaseEntity {
  name: string;
  seatNumber: number;
  grade: string;
  className: string;
  status: "active" | "inactive";
}

export interface CreateStudentRequest {
  name: string;
  seatNumber: number;
  grade: string;
  className: string;
  status?: "active" | "inactive";
}

export interface UpdateStudentRequest {
  name?: string;
  seatNumber?: number;
  grade?: string;
  className?: string;
  status?: "active" | "inactive";
} 