// Pages
export { default as StudentsPage } from './pages/StudentsPage';

// Types
export type {
  Student,
  Grade,
  StudentStatus,
  StudentContactInfo,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentSearchParams,
  StudentStatistics,
  StudentFormData,
  StudentsState
} from './types/students.types';

// Redux Actions
export {
  fetchStudents,
  createStudentAsync,
  updateStudentAsync,
  deleteStudentAsync,
  searchStudentsAsync,
  fetchStudentById,
  fetchStudentStatistics,
  setSelectedStudent,
  setSearchTerm,
  setFilter,
  clearError,
  clearLoading
} from './slice/studentsSlice';

// Services
export {
  createStudent,
  getAllStudents,
  getStudentById,
  searchStudents,
  updateStudent,
  deleteStudent,
  getStudentStatistics,
  getStudentCountByGrade
} from './services/studentService';
