import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  Student, 
  StudentsState, 
  CreateStudentRequest, 
  UpdateStudentRequest,
  StudentSearchParams 
} from '../types/students.types';
import { 
  getAllStudents, 
  createStudent, 
  updateStudent as updateStudentAPI, 
  deleteStudent as deleteStudentAPI,
  searchStudents,
  getStudentById,
  getStudentStatistics
} from '../services/studentService';

// 비동기 액션: 모든 학생 조회
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllStudents();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || '학생 목록 조회에 실패했습니다.');
      }
    } catch (error) {
      return rejectWithValue('학생 목록 조회 중 오류가 발생했습니다.');
    }
  }
);

// 비동기 액션: 학생 생성
export const createStudentAsync = createAsyncThunk(
  'students/createStudent',
  async (studentData: CreateStudentRequest, { rejectWithValue }) => {
    try {
      const response = await createStudent(studentData);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || '학생 생성에 실패했습니다.');
      }
    } catch (error) {
      return rejectWithValue('학생 생성 중 오류가 발생했습니다.');
    }
  }
);

// 비동기 액션: 학생 수정
export const updateStudentAsync = createAsyncThunk(
  'students/updateStudent',
  async ({ id, studentData }: { id: string; studentData: UpdateStudentRequest }, { rejectWithValue }) => {
    try {
      const response = await updateStudentAPI(id, studentData);
      if (response.success) {
        return { id, ...studentData };
      } else {
        return rejectWithValue(response.error || '학생 수정에 실패했습니다.');
      }
    } catch (error) {
      return rejectWithValue('학생 수정 중 오류가 발생했습니다.');
    }
  }
);

// 비동기 액션: 학생 삭제
export const deleteStudentAsync = createAsyncThunk(
  'students/deleteStudent',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await deleteStudentAPI(id);
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.error || '학생 삭제에 실패했습니다.');
      }
    } catch (error) {
      return rejectWithValue('학생 삭제 중 오류가 발생했습니다.');
    }
  }
);

// 비동기 액션: 학생 검색
export const searchStudentsAsync = createAsyncThunk(
  'students/searchStudents',
  async (searchParams: StudentSearchParams, { rejectWithValue }) => {
    try {
      const response = await searchStudents(searchParams);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || '학생 검색에 실패했습니다.');
      }
    } catch (error) {
      return rejectWithValue('학생 검색 중 오류가 발생했습니다.');
    }
  }
);

// 비동기 액션: 특정 학생 조회
export const fetchStudentById = createAsyncThunk(
  'students/fetchStudentById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getStudentById(id);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || '학생 조회에 실패했습니다.');
      }
    } catch (error) {
      return rejectWithValue('학생 조회 중 오류가 발생했습니다.');
    }
  }
);

// 비동기 액션: 학생 통계 조회
export const fetchStudentStatistics = createAsyncThunk(
  'students/fetchStudentStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getStudentStatistics();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || '학생 통계 조회에 실패했습니다.');
      }
    } catch (error) {
      return rejectWithValue('학생 통계 조회 중 오류가 발생했습니다.');
    }
  }
);

const initialState: StudentsState = {
  students: [],
  selectedStudent: null,
  searchTerm: '',
  isLoading: false,
  error: null,
  filters: {
    grade: '',
    status: ''
  }
};

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    // 선택된 학생 설정
    setSelectedStudent: (state, action: PayloadAction<Student | null>) => {
      state.selectedStudent = action.payload;
    },
    
    // 검색어 설정
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    
    // 필터 설정
    setFilter: (state, action: PayloadAction<{ key: keyof StudentsState['filters']; value: string }>) => {
      const { key, value } = action.payload;
      if (key === 'grade' || key === 'status') {
        state.filters[key] = value as any;
      }
    },
    
    // 에러 초기화
    clearError: (state) => {
      state.error = null;
    },
    
    // 로딩 상태 초기화
    clearLoading: (state) => {
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    // fetchStudents
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload;
        state.error = null;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createStudent
    builder
      .addCase(createStudentAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStudentAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students.push(action.payload);
        state.error = null;
      })
      .addCase(createStudentAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateStudent
    builder
      .addCase(updateStudentAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateStudentAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.students.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = { ...state.students[index], ...action.payload };
        }
        state.error = null;
      })
      .addCase(updateStudentAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // deleteStudent
    builder
      .addCase(deleteStudentAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteStudentAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = state.students.filter(s => s.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteStudentAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // searchStudents
    builder
      .addCase(searchStudentsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchStudentsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload;
        state.error = null;
      })
      .addCase(searchStudentsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchStudentById
    builder
      .addCase(fetchStudentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedStudent = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchStudentStatistics
    builder
      .addCase(fetchStudentStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentStatistics.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchStudentStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setSelectedStudent,
  setSearchTerm,
  setFilter,
  clearError,
  clearLoading
} = studentsSlice.actions;

export default studentsSlice.reducer; 