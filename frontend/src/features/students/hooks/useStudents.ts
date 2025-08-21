import { useCallback } from 'react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { 
  createStudentAsync,
  updateStudentAsync,
  deleteStudentAsync,
  setSelectedStudent, 
  setSearchTerm, 
  setFilter,
  fetchStudents
} from '../slice/studentsSlice';
import type { Student, CreateStudentRequest, UpdateStudentRequest } from '../types/students.types';

export const useStudents = () => {
  const dispatch = useAppDispatch();
  const { 
    students, 
    selectedStudent, 
    searchTerm, 
    filters, 
    isLoading, 
    error 
  } = useAppSelector(state => state.students);

  const handleAddStudent = useCallback(async (studentData: CreateStudentRequest) => {
    try {
      await dispatch(createStudentAsync(studentData)).unwrap();
      dispatch(fetchStudents()); // 목록 새로고침
    } catch (error) {
      console.error('학생 생성 실패:', error);
    }
  }, [dispatch]);

  const handleUpdateStudent = useCallback(async (id: string, studentData: UpdateStudentRequest) => {
    try {
      await dispatch(updateStudentAsync({ id, studentData })).unwrap();
      dispatch(fetchStudents()); // 목록 새로고침
    } catch (error) {
      console.error('학생 수정 실패:', error);
    }
  }, [dispatch]);

  const handleDeleteStudent = useCallback(async (studentId: string) => {
    try {
      await dispatch(deleteStudentAsync(studentId)).unwrap();
      dispatch(fetchStudents()); // 목록 새로고침
    } catch (error) {
      console.error('학생 삭제 실패:', error);
    }
  }, [dispatch]);

  const handleSelectStudent = useCallback((student: Student | null) => {
    dispatch(setSelectedStudent(student));
  }, [dispatch]);

  const handleSearchChange = useCallback((value: string) => {
    dispatch(setSearchTerm(value));
  }, [dispatch]);

  const handleFilterChange = useCallback((key: keyof typeof filters, value: string) => {
    dispatch(setFilter({ key, value }));
  }, [dispatch, filters]);

  return {
    students,
    selectedStudent,
    searchTerm,
    filters,
    isLoading,
    error,
    handleAddStudent,
    handleUpdateStudent,
    handleDeleteStudent,
    handleSelectStudent,
    handleSearchChange,
    handleFilterChange
  };
}; 