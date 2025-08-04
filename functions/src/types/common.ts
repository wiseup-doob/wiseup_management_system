export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
} 