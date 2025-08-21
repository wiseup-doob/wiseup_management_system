import type { 
  Student, 
  CreateStudentRequest, 
  UpdateStudentRequest, 
  StudentSearchParams,
  StudentStatistics 
} from '../types/students.types';
import { API_CONFIG } from '../../../config/api.config';

// API 기본 URL + 엔드포인트
const API_BASE_URL = `${API_CONFIG.BASE_URL}/api/students`;

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 학생 생성
export const createStudent = async (studentData: CreateStudentRequest): Promise<ApiResponse<Student>> => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '학생 생성에 실패했습니다.');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
};

// 모든 학생 조회
export const getAllStudents = async (): Promise<ApiResponse<Student[]>> => {
  try {
    const response = await fetch(API_BASE_URL);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '학생 목록 조회에 실패했습니다.');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
};

// 특정 학생 조회
export const getStudentById = async (id: string): Promise<ApiResponse<Student>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '학생 조회에 실패했습니다.');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
};

// 학생 검색
export const searchStudents = async (params: StudentSearchParams): Promise<ApiResponse<Student[]>> => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (typeof value === 'object') {
          // 날짜 범위 처리
          if (key.endsWith('Range')) {
            queryParams.append(`${key}.start`, value.start);
            queryParams.append(`${key}.end`, value.end);
          }
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/search?${queryParams.toString()}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '학생 검색에 실패했습니다.');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
};

// 학생 수정
export const updateStudent = async (id: string, studentData: UpdateStudentRequest): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '학생 수정에 실패했습니다.');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
};

// 학생 삭제
export const deleteStudent = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '학생 삭제에 실패했습니다.');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
};

// 학생 통계 조회
export const getStudentStatistics = async (): Promise<ApiResponse<StudentStatistics>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '학생 통계 조회에 실패했습니다.');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
};

// 학년별 학생 수 조회
export const getStudentCountByGrade = async (): Promise<ApiResponse<Record<string, number>>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/count/by-grade`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '학년별 학생 수 조회에 실패했습니다.');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
};
