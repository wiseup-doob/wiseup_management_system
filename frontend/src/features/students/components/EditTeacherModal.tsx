import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import { Button } from '../../../components/buttons/Button';
import { Label } from '../../../components/labels/Label';
import type { Teacher } from '@shared/types';
import './AddTeacherModal.css'; // 기존 스타일 재사용

interface TeacherFormData {
  name: string;
  subjects: string[];
  email: string;
  phone: string;
}

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeacherUpdated: (teacher: Teacher) => void;
  teacher: Teacher;
}

export const EditTeacherModal: React.FC<EditTeacherModalProps> = ({
  isOpen,
  onClose,
  onTeacherUpdated,
  teacher
}) => {
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    subjects: [],
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  // 과목 옵션
  const subjectOptions = [
    'mathematics', 'english', 'korean', 'science', 'social', 'art', 'music', 'pe', 'other'
  ];

  const subjectLabels: Record<string, string> = {
    mathematics: '수학',
    english: '영어',
    korean: '국어',
    science: '과학',
    social: '사회',
    art: '미술',
    music: '음악',
    pe: '체육',
    other: '기타'
  };

  // 폼 초기화 - 교사 데이터로 채우기
  useEffect(() => {
    if (teacher && isOpen) {
      const initialData = {
        name: teacher.name,
        subjects: teacher.subjects || [],
        email: teacher.email || '',
        phone: teacher.phone || ''
      };
      setFormData(initialData);
      setError('');
      setHasChanges(false);
    }
  }, [teacher, isOpen]);

  // 변경사항 감지
  useEffect(() => {
    if (!teacher) return;

    const subjectsChanged =
      JSON.stringify([...formData.subjects].sort()) !==
      JSON.stringify([...(teacher.subjects || [])].sort());

    const changed =
      formData.name !== teacher.name ||
      subjectsChanged ||
      formData.email !== (teacher.email || '') ||
      formData.phone !== (teacher.phone || '');

    setHasChanges(changed);
  }, [formData, teacher]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('교사 이름을 입력해주세요.');
      return;
    }

    if (formData.subjects.length === 0) {
      setError('최소 하나의 과목을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const teacherData = {
        name: formData.name.trim(),
        subjects: formData.subjects,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined
      };

      const response = await apiService.updateTeacher(teacher.id, teacherData);

      if (response.success && response.data) {
        setIsLoading(false);
        onTeacherUpdated(response.data);
        return;
      } else {
        setError(response.message || '교사 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('교사 수정 실패:', error);
      setError('교사 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-teacher-modal-overlay">
      <div className="add-teacher-modal">
        <div className="modal-header">
          <h2>교사 정보 수정</h2>
          <button
            className="close-button"
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="form-group">
              <Label htmlFor="teacherName">교사 이름 *</Label>
              <input
                type="text"
                id="teacherName"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="교사 이름을 입력하세요"
                className="teacher-input"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <Label>담당 과목 *</Label>
              <div className="subjects-grid">
                {subjectOptions.map(subject => (
                  <label key={subject} className="subject-item">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleSubjectChange(subject)}
                      disabled={isLoading}
                    />
                    <span>{subjectLabels[subject]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="teacherEmail">이메일</Label>
              <input
                type="email"
                id="teacherEmail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="이메일을 입력하세요 (선택사항)"
                className="teacher-input"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <Label htmlFor="teacherPhone">전화번호</Label>
              <input
                type="tel"
                id="teacherPhone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="전화번호를 입력하세요 (선택사항)"
                className="teacher-input"
                disabled={isLoading}
              />
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
              disabled={isLoading || !formData.name.trim() || formData.subjects.length === 0 || !hasChanges}
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

export default EditTeacherModal;
