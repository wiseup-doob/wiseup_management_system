import React, { useState } from 'react';
import { apiService } from '../../../services/api';
import { Button } from '../../../components/buttons/Button';
import { Label } from '../../../components/labels/Label';
import './AddTeacherModal.css';

interface TeacherFormData {
  name: string;
  subjects: string[];
  email: string;
  phone: string;
}

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeacherAdded: (teacher: any) => void;
}

export const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  isOpen,
  onClose,
  onTeacherAdded
}) => {
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    subjects: [],
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

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

      const response = await apiService.createTeacher(teacherData);
      
      if (response.success && response.data) {
        // 성공 시 콜백 호출
        onTeacherAdded(response.data);
        handleClose();
      } else {
        setError(response.message || '교사 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('교사 추가 실패:', error);
      setError('교사 추가 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      setFormData({
        name: '',
        subjects: [],
        email: '',
        phone: ''
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-teacher-modal-overlay">
      <div className="add-teacher-modal">
        <div className="modal-header">
          <h2>새 교사 추가</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="modal-content">
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
                disabled={isLoading || !formData.name.trim() || formData.subjects.length === 0}
                className="submit-btn"
              >
                {isLoading ? '추가 중...' : '교사 추가'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTeacherModal;
