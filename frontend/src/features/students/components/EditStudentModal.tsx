import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import { Button } from '../../../components/buttons/Button';
import { Label } from '../../../components/labels/Label';
import type { Student, StudentStatus } from '@shared/types';
import type { Grade } from '@shared/types/student.types';
import './EditStudentModal.css';

interface StudentFormData {
  name: string;
  grade: Grade;
  firstAttendanceDate: string;
  lastAttendanceDate: string;
  parentsId: string;
  status: StudentStatus;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: (student: Student) => void;
  student: Student;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  onStudentUpdated,
  student
}) => {
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  // 학년 옵션
  const gradeOptions: Grade[] = [
    '초1', '초2', '초3', '초4', '초5', '초6',
    '중1', '중2', '중3',
    '고1', '고2', '고3',
    'N수'
  ];

  // 상태 옵션
  const statusOptions: StudentStatus[] = ['active', 'inactive'];

  // Firestore Timestamp를 string으로 변환하는 헬퍼 함수
  const convertTimestampToString = (timestamp: any): string => {
    if (!timestamp) return '';
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp instanceof Date) {
      return timestamp.toISOString().split('T')[0];
    }
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString().split('T')[0];
    }
    if (timestamp.seconds !== undefined) {
      return new Date(timestamp.seconds * 1000).toISOString().split('T')[0];
    }
    if (timestamp._seconds !== undefined) {
      return new Date(timestamp._seconds * 1000).toISOString().split('T')[0];
    }
    return '';
  };

  // 폼 초기화 - 학생 데이터로 채우기
  useEffect(() => {
    if (student && isOpen) {
      const initialData = {
        name: student.name,
        grade: student.grade,
        firstAttendanceDate: convertTimestampToString(student.firstAttendanceDate),
        lastAttendanceDate: convertTimestampToString(student.lastAttendanceDate),
        parentsId: student.parentsId || '',
        status: student.status,
        contactInfo: {
          phone: student.contactInfo?.phone || '',
          email: student.contactInfo?.email || '',
          address: student.contactInfo?.address || ''
        }
      };
      setFormData(initialData);
      setError('');
      setHasChanges(false);
    }
  }, [student, isOpen]);

  // 변경사항 감지
  useEffect(() => {
    if (!student) return;

    const changed =
      formData.name !== student.name ||
      formData.grade !== student.grade ||
      formData.firstAttendanceDate !== convertTimestampToString(student.firstAttendanceDate) ||
      formData.lastAttendanceDate !== convertTimestampToString(student.lastAttendanceDate) ||
      formData.parentsId !== (student.parentsId || '') ||
      formData.status !== student.status ||
      formData.contactInfo.phone !== (student.contactInfo?.phone || '') ||
      formData.contactInfo.email !== (student.contactInfo?.email || '') ||
      formData.contactInfo.address !== (student.contactInfo?.address || '');

    setHasChanges(changed);
  }, [formData, student]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
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

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.name.trim()) {
      setError('학생 이름을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await apiService.updateStudent(student.id, {
        name: formData.name.trim(),
        grade: formData.grade,
        firstAttendanceDate: formData.firstAttendanceDate || undefined,
        lastAttendanceDate: formData.lastAttendanceDate || undefined,
        parentsId: formData.parentsId.trim() || undefined,
        status: formData.status,
        contactInfo: {
          phone: formData.contactInfo.phone.trim() || undefined,
          email: formData.contactInfo.email.trim() || undefined,
          address: formData.contactInfo.address.trim() || undefined
        }
      });

      if (response.success && response.data) {
        setIsLoading(false);
        onStudentUpdated(response.data);
        return;
      } else {
        setError(response.message || '학생 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('학생 수정 실패:', error);
      setError('학생 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    if (!isLoading) {
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-student-modal-overlay">
      <div className="edit-student-modal">
        <div className="modal-header">
          <h2>학생 정보 수정</h2>
          <button
            className="close-button"
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>기본 정보</h3>

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="name">학생 이름 *</Label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="학생 이름을 입력하세요"
                    className="student-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="grade">학년 *</Label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    required
                    className="student-input"
                    disabled={isLoading}
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
                  <Label htmlFor="status">상태 *</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="student-input"
                    disabled={isLoading}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status === 'active' ? '재원' : '퇴원'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <Label htmlFor="parentsId">부모 ID</Label>
                  <input
                    type="text"
                    id="parentsId"
                    name="parentsId"
                    value={formData.parentsId}
                    onChange={handleInputChange}
                    placeholder="부모 ID를 입���하세요"
                    className="student-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="firstAttendanceDate">첫 등원일</Label>
                  <input
                    type="date"
                    id="firstAttendanceDate"
                    name="firstAttendanceDate"
                    value={formData.firstAttendanceDate}
                    onChange={handleInputChange}
                    className="student-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="lastAttendanceDate">마지막 등원일</Label>
                  <input
                    type="date"
                    id="lastAttendanceDate"
                    name="lastAttendanceDate"
                    value={formData.lastAttendanceDate}
                    onChange={handleInputChange}
                    className="student-input"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>연락처 정보</h3>

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="contactInfo.phone">전화번호</Label>
                  <input
                    type="tel"
                    id="contactInfo.phone"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                    placeholder="전화번호를 입력하세요"
                    className="student-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="contactInfo.email">이메일</Label>
                  <input
                    type="email"
                    id="contactInfo.email"
                    name="contactInfo.email"
                    value={formData.contactInfo.email}
                    onChange={handleInputChange}
                    placeholder="이메일을 입력하세요"
                    className="student-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <Label htmlFor="contactInfo.address">주소</Label>
                <input
                  type="text"
                  id="contactInfo.address"
                  name="contactInfo.address"
                  value={formData.contactInfo.address}
                  onChange={handleInputChange}
                  placeholder="주소를 입력하세요"
                  className="student-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="cancel-btn"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !formData.name.trim() || !hasChanges}
              className="submit-btn"
            >
              {isLoading ? '수정 중...' : '수정'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
