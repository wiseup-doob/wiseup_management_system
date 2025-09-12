import React, { useState, useEffect, useRef, useCallback } from 'react';
import './StudentsPage.css';
import { BaseWidget } from '../../../components/base/BaseWidget';
import { Button } from '../../../components/buttons/Button';
import { Grid } from '../../../components/Layout/Grid';
import { Label } from '../../../components/labels/Label';
import { SearchInput } from '../../../components/SearchInput/SearchInput';
import { useStudents } from '../hooks/useStudents';
import AddTeacherModal from '../components/AddTeacherModal';
import { AddClassroomModal } from '../components/AddClassroomModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import type { BaseWidgetProps } from '../../../types/components';
import type {  
  StudentStatus, 
  StudentFormData, 
  StudentContactInfo 
} from '../types/students.types';
import type {
  StudentDependencies,
  TeacherDependencies,
  ClassroomDependencies
} from '@shared/types';
import type { Grade } from '@shared/types/student.types';
import { createStudentAsync, fetchStudents, setSearchTerm, setFilter, deleteStudentAsync, searchStudentsAsync } from '../slice/studentsSlice';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { apiService } from '../../../services/api';

function StudentsPage() {
  const dispatch = useAppDispatch();
  const { 
    students, 
    searchTerm, 
    filters, 
    isLoading, 
    error 
  } = useAppSelector((state) => state.students);

  // 학생 생성 폼 상태
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    grade: '초1',
    firstAttendanceDate: '',
    lastAttendanceDate: '',
    parentsId: '',
    status: 'active',
    contactInfo: {
      phone: '',
      email: '',
      address: ''
    }
  });

  // 교사 추가 모달 상태
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  
  // 교사 목록 상태
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  
  // 강의실 목록 상태
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);
  const [showAddClassroomModal, setShowAddClassroomModal] = useState(false);

  // 삭제 확인 모달 상태
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: string;
    itemName: string;
    itemType: 'student' | 'teacher' | 'classroom';
  }>({
    isOpen: false,
    itemId: '',
    itemName: '',
    itemType: 'student'
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // 학생 의존성 정보 상태
  const [studentDependencies, setStudentDependencies] = useState<StudentDependencies | null>(null);

  // 교사 의존성 정보 상태
  const [teacherDependencies, setTeacherDependencies] = useState<TeacherDependencies | null>(null);

  // 강의실 의존성 정보 상태
  const [classroomDependencies, setClassroomDependencies] = useState<ClassroomDependencies | null>(null);

  // 디바운싱을 위한 ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 학년 옵션
  const gradeOptions: Grade[] = [
    '초1', '초2', '초3', '초4', '초5', '초6',
    '중1', '중2', '중3',
    '고1', '고2', '고3',
    'N수'
  ];

  // 상태 옵션
  const statusOptions: StudentStatus[] = ['active', 'inactive'];

  // 컴포넌트 마운트 시 학생 목록, 교사 목록, 강의실 목록 가져오기
  useEffect(() => {
    dispatch(fetchStudents());
    loadTeachers();
    loadClassrooms();
  }, [dispatch]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 교사 목록 로드
  const loadTeachers = async () => {
    try {
      setIsLoadingTeachers(true);
      const response = await apiService.getTeachers();
      if (response.success && response.data) {
        setTeachers(response.data);
      }
    } catch (error) {
      console.error('교사 목록 로드 실패:', error);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  // 강의실 목록 로드
  const loadClassrooms = async () => {
    try {
      setIsLoadingClassrooms(true);
      const response = await apiService.getClassrooms();
      if (response.success && response.data) {
        setClassrooms(response.data);
      }
    } catch (error) {
      console.error('강의실 목록 로드 실패:', error);
    } finally {
      setIsLoadingClassrooms(false);
    }
  };

  // 검색어 변경 핸들러 (디바운싱 적용)
  const handleSearchChange = useCallback((value: string) => {
    dispatch(setSearchTerm(value));
    
    // 기존 타이머 클리어
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // 빈 검색어인 경우 전체 목록 로드
    if (!value.trim()) {
      dispatch(fetchStudents());
      return;
    }
    
    // 디바운싱 적용 (300ms)
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(searchStudentsAsync({ name: value.trim() }));
    }, 300);
  }, [dispatch]);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((key: keyof typeof filters, value: string) => {
    dispatch(setFilter({ key, value }));
    
    // 필터 변경 시 검색 실행
    const searchParams: any = {
      name: searchTerm || undefined,
      grade: key === 'grade' ? (value as Grade) || undefined : filters.grade || undefined,
    };
    
    // 빈 필터인 경우 전체 목록 로드
    const hasActiveFilters = Object.values(searchParams).some(v => v !== undefined);
    
    if (hasActiveFilters) {
      dispatch(searchStudentsAsync(searchParams));
    } else {
      dispatch(fetchStudents());
    }
  }, [dispatch, searchTerm, filters]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1] as keyof StudentContactInfo;
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo!,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 교사 추가 모달 열기
  const handleOpenAddTeacher = () => {
    setShowAddTeacherModal(true);
  };

  // 교사 추가 완료
  const handleTeacherAdded = (teacher: any) => {
    console.log('교사 추가 완료:', teacher);
    // 교사 목록 새로고침
    loadTeachers();
  };

  // 강의실 추가 모달 열기
  const handleOpenAddClassroom = () => {
    setShowAddClassroomModal(true);
  };

  // 강의실 추가 완료
  const handleClassroomAdded = (classroom: any) => {
    console.log('강의실 추가 완료:', classroom);
    // 강의실 목록 새로고침
    loadClassrooms();
  };

  // 삭제 모달 열기
  const handleOpenDeleteModal = async (itemId: string, itemName: string, itemType: 'student' | 'teacher' | 'classroom') => {
    // 학생인 경우 의존성 정보 미리 확인
    if (itemType === 'student') {
      try {
        const response = await apiService.getStudentDependencies(itemId);
        if (response.success && response.data) {
          setStudentDependencies(response.data);
        }
      } catch (error) {
        console.error('학생 의존성 확인 실패:', error);
        // 에러가 발생해도 모달은 열기
        setStudentDependencies(null);
      }
      setTeacherDependencies(null);
    } 
    // 교사인 경우 의존성 정보 미리 확인
    else if (itemType === 'teacher') {
      try {
        const response = await apiService.getTeacherDependencies(itemId);
        if (response.success && response.data) {
          setTeacherDependencies(response.data);
        }
      } catch (error) {
        console.error('교사 의존성 확인 실패:', error);
        // 에러가 발생해도 모달은 열기
        setTeacherDependencies(null);
      }
      setStudentDependencies(null);
    } 
    // 강의실인 경우 의존성 정보 미리 확인
    else if (itemType === 'classroom') {
      try {
        const response = await apiService.getClassroomDependencies(itemId);
        if (response.success && response.data) {
          setClassroomDependencies(response.data);
        }
      } catch (error) {
        console.error('강의실 의존성 확인 실패:', error);
        // 에러가 발생해도 모달은 열기
        setClassroomDependencies(null);
      }
      setStudentDependencies(null);
      setTeacherDependencies(null);
    }

    setDeleteModal({
      isOpen: true,
      itemId,
      itemName,
      itemType
    });
  };

  // 삭제 모달 닫기
  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      itemId: '',
      itemName: '',
      itemType: 'student'
    });
    setIsDeleting(false);
    // 의존성 정보 초기화
    setStudentDependencies(null);
    setTeacherDependencies(null);
    setClassroomDependencies(null);
  };

  // 삭제 실행
  const handleConfirmDelete = async () => {
    const { itemId, itemType } = deleteModal;
    
    try {
      setIsDeleting(true);
      
      switch (itemType) {
        case 'student':
          // 학생인 경우 계층적 삭제 API 사용
          const studentResponse = await apiService.deleteStudentHierarchically(itemId);
          if (studentResponse.success) {
            console.log('학생 계층적 삭제 완료:', studentResponse.data);
          } else {
            throw new Error('학생 계층적 삭제 실패');
          }
          break;
        case 'teacher':
          // 교사인 경우 계층적 삭제 API 사용
          const teacherResponse = await apiService.deleteTeacherHierarchically(itemId);
          if (teacherResponse.success) {
            console.log('교사 계층적 삭제 완료:', teacherResponse.data);
          } else {
            throw new Error('교사 계층적 삭제 실패');
          }
          break;
        case 'classroom':
          // 강의실인 경우 계층적 삭제 API 사용
          const classroomResponse = await apiService.deleteClassroomHierarchically(itemId);
          if (classroomResponse.success) {
            console.log('강의실 계층적 삭제 완료:', classroomResponse.data);
          } else {
            throw new Error('강의실 계층적 삭제 실패');
          }
          break;
      }
      
      // 삭제 성공 후 목록 새로고침
      switch (itemType) {
        case 'student':
          dispatch(fetchStudents());
          break;
        case 'teacher':
          loadTeachers();
          break;
        case 'classroom':
          loadClassrooms();
          break;
      }
      
      handleCloseDeleteModal();
    } catch (error) {
      console.error('삭제 실패:', error);
      // 에러 처리 (필요시 사용자에게 알림)
    } finally {
      setIsDeleting(false);
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 학생 생성 API 호출 (Redux 액션 사용)
      const result = await dispatch(createStudentAsync(formData)).unwrap();
      
      // 성공 시 폼 초기화 및 숨김
      setFormData({
        name: '',
        grade: '초1',
        firstAttendanceDate: '',
        lastAttendanceDate: '',
        parentsId: '',
        status: 'active',
        contactInfo: {
          phone: '',
          email: '',
          address: ''
        }
      });
      setShowCreateForm(false);
      
      // 학생 목록 새로고침
      dispatch(fetchStudents());
    } catch (error) {
      console.error('학생 생성 실패:', error);
    }
  };

  // 폼 취소 핸들러
  const handleCancel = () => {
    setShowCreateForm(false);
    setFormData({
      name: '',
      grade: '초1',
      firstAttendanceDate: '',
      lastAttendanceDate: '',
      parentsId: '',
      status: 'active',
      contactInfo: {
        phone: '',
        email: '',
        address: ''
      }
    });
  };

  return (
    <div className="students-page-container">
      <BaseWidget className="students-page">
        <div className="page-header">
          <Label 
            variant="heading" 
            size="large" 
            className="page-title"
          >
            학생 관리
          </Label>
          
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="create-student-btn"
          >
            {showCreateForm ? '취소' : '새 학생 등록'}
          </Button>
        </div>

        {/* 학생 생성 폼 */}
        {showCreateForm && (
          <div className="create-student-section">
            <form onSubmit={handleSubmit} className="create-student-form">
              <div className="form-section">
                <h3>기본 정보</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">학생 이름 *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="학생 이름을 입력하세요"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="grade">학년 *</label>
                    <select
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      required
                    >
                      {gradeOptions.map(grade => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="status">상태 *</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status === 'active' ? '재원' : '퇴원'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="parentsId">부모 ID</label>
                    <input
                      type="text"
                      id="parentsId"
                      name="parentsId"
                      value={formData.parentsId}
                      onChange={handleInputChange}
                      placeholder="부모 ID를 입력하세요"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstAttendanceDate">첫 등원일</label>
                    <input
                      type="date"
                      id="firstAttendanceDate"
                      name="firstAttendanceDate"
                      value={formData.firstAttendanceDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastAttendanceDate">마지막 등원일</label>
                    <input
                      type="date"
                      id="lastAttendanceDate"
                      name="lastAttendanceDate"
                      value={formData.lastAttendanceDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>연락처 정보</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contactInfo.phone">전화번호</label>
                    <input
                      type="tel"
                      id="contactInfo.phone"
                      name="contactInfo.phone"
                      value={formData.contactInfo?.phone || ''}
                      onChange={handleInputChange}
                      placeholder="전화번호를 입력하세요"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactInfo.email">이메일</label>
                    <input
                      type="email"
                      id="contactInfo.email"
                      name="contactInfo.email"
                      value={formData.contactInfo?.email || ''}
                      onChange={handleInputChange}
                      placeholder="이메일을 입력하세요"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="contactInfo.address">주소</label>
                  <input
                    type="text"
                    id="contactInfo.address"
                    name="contactInfo.address"
                    value={formData.contactInfo?.address || ''}
                    onChange={handleInputChange}
                    placeholder="주소를 입력하세요"
                  />
                </div>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <Button 
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  취소
                </Button>
                <Button 
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? '등록 중...' : '학생 등록'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 학생 목록 섹션 */}
        <div className="students-list-section">
          <div className="search-filters">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="학생 검색..."
            />
            
            <div className="filter-controls">
              <select
                value={filters.grade}
                onChange={(e) => handleFilterChange('grade', e.target.value)}
                className="filter-select"
              >
                <option value="">전체 학년</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="students-grid">
            {isLoading ? (
              <p>학생 목록을 불러오는 중...</p>
            ) : students && students.length > 0 ? (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>학년</th>
                    <th>전화번호</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.grade}</td>
                      <td>{student.contactInfo?.phone || '-'}</td>
                      <td>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleOpenDeleteModal(student.id, student.name, 'student')}
                          className="delete-btn"
                        >
                          삭제
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-results">
                <p>등록된 학생이 없습니다.</p>
                {(searchTerm || Object.values(filters).some(f => f)) && (
                  <Button
                    onClick={() => {
                      dispatch(setSearchTerm(''));
                      dispatch(setFilter({ key: 'grade', value: '' }));
                      dispatch(fetchStudents());
                    }}
                    className="clear-filters-btn"
                  >
                    필터 초기화
                  </Button>
                )}
              </div>
            )}
            <p className="students-count">등록된 학생: {students?.length || 0}명</p>
          </div>
        </div>

        {/* 교사 목록 섹션 */}
        <div className="teachers-section">
          <div className="section-header">
            <h3>교사 관리</h3>
            <Button
              type="button"
              variant="primary"
              onClick={handleOpenAddTeacher}
              className="add-teacher-btn"
            >
              + 새 교사 추가
            </Button>
          </div>

          <div className="teachers-grid">
            {isLoadingTeachers ? (
              <p>교사 목록을 불러오는 중...</p>
            ) : teachers && teachers.length > 0 ? (
              <div className="teachers-list">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="teacher-card">
                    <div className="teacher-header">
                      <h4>{teacher.name}</h4>
                      <div className="teacher-status">
                        {teacher.isActive ? '활성' : '비활성'}
                      </div>
                    </div>
                    <div className="teacher-subjects">
                      <strong>담당 과목:</strong>
                      <div className="subjects-tags">
                        {teacher.subjects?.map((subject: string) => (
                          <span key={subject} className="subject-tag">
                            {subject === 'mathematics' ? '수학' :
                             subject === 'english' ? '영어' :
                             subject === 'korean' ? '국어' :
                             subject === 'science' ? '과학' :
                             subject === 'social' ? '사회' :
                             subject === 'art' ? '미술' :
                             subject === 'music' ? '음악' :
                             subject === 'pe' ? '체육' :
                             subject === 'other' ? '기타' : subject}
                          </span>
                        ))}
                      </div>
                    </div>
                    {teacher.email && (
                      <p className="teacher-email">
                        <strong>이메일:</strong> {teacher.email}
                      </p>
                    )}
                    {teacher.phone && (
                      <p className="teacher-phone">
                        <strong>전화번호:</strong> {teacher.phone}
                      </p>
                    )}
                    <div className="teacher-meta">
                      <small>등록일: {teacher.createdAt ? new Date(teacher.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</small>
                    </div>
                    <div className="teacher-actions">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => handleOpenDeleteModal(teacher.id, teacher.name, 'teacher')}
                        className="delete-btn"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-teachers">등록된 교사가 없습니다.</p>
            )}
            <p className="teachers-count">등록된 교사: {teachers?.length || 0}명</p>
          </div>
        </div>

        {/* 강의실 목록 섹션 */}
        <div className="classrooms-section">
          <div className="section-header">
            <h3>강의실 관리</h3>
            <Button
              type="button"
              variant="primary"
              onClick={handleOpenAddClassroom}
              className="add-classroom-btn"
            >
              + 새 강의실 추가
            </Button>
          </div>

          <div className="classrooms-grid">
            {isLoadingClassrooms ? (
              <p>강의실 목록을 불러오는 중...</p>
            ) : classrooms && classrooms.length > 0 ? (
              <div className="classrooms-list">
                {classrooms.map((classroom) => (
                  <div key={classroom.id} className="classroom-card">
                    <div className="classroom-header">
                      <h4>{classroom.name}</h4>
                      <div className="classroom-status">
                        {classroom.isActive ? '활성' : '비활성'}
                      </div>
                    </div>
                    <div className="classroom-capacity">
                      <strong>수용 인원:</strong> {classroom.capacity}명
                    </div>
                    {classroom.location && (
                      <div className="classroom-location">
                        <strong>위치:</strong> {classroom.location}
                      </div>
                    )}
                    {classroom.description && (
                      <div className="classroom-description">
                        <strong>설명:</strong> {classroom.description}
                      </div>
                    )}
                    <div className="classroom-meta">
                      <small>등록일: {classroom.createdAt ? new Date(classroom.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</small>
                    </div>
                    <div className="classroom-actions">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => handleOpenDeleteModal(classroom.id, classroom.name, 'classroom')}
                        className="delete-btn"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-classrooms">등록된 강의실이 없습니다.</p>
            )}
            <p className="classrooms-count">등록된 강의실: {classrooms?.length || 0}개</p>
          </div>
        </div>
      </BaseWidget>

      {/* 교사 추가 모달 */}
      {showAddTeacherModal && (
        <AddTeacherModal
          isOpen={showAddTeacherModal}
          onClose={() => setShowAddTeacherModal(false)}
          onTeacherAdded={handleTeacherAdded}
        />
      )}

      {/* 강의실 추가 모달 */}
      {showAddClassroomModal && (
        <AddClassroomModal
          isOpen={showAddClassroomModal}
          onClose={() => setShowAddClassroomModal(false)}
          onClassroomAdded={handleClassroomAdded}
        />
      )}

      {/* 삭제 확인 모달 */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
        isLoading={isDeleting}
        studentDependencies={studentDependencies}
        teacherDependencies={teacherDependencies}
        classroomDependencies={classroomDependencies}
      />
    </div>
  );
}

export default StudentsPage; 