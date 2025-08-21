import React, { useState } from 'react';
import { apiService } from '../../../services/api';
import { Button } from '../../../components/buttons/Button';
import { Label } from '../../../components/labels/Label';
import './AddClassroomModal.css';

interface ClassroomFormData {
  name: string;
  capacity: number;
  location: string;
  description: string;
}

interface AddClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassroomAdded: (classroom: any) => void;
}

export const AddClassroomModal: React.FC<AddClassroomModalProps> = ({
  isOpen,
  onClose,
  onClassroomAdded
}) => {
  const [formData, setFormData] = useState<ClassroomFormData>({
    name: '',
    capacity: 20,
    location: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 폼 데이터 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.name.trim()) {
      setError('강의실명을 입력해주세요.');
      return;
    }

    if (formData.capacity <= 0) {
      setError('수용 인원은 1명 이상이어야 합니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await apiService.createClassroom({
        name: formData.name.trim(),
        capacity: formData.capacity,
        location: formData.location.trim() || undefined,
        description: formData.description.trim() || undefined
      });

      if (response.success && response.data) {
        onClassroomAdded(response.data);
        onClose();
        // 폼 초기화
        setFormData({
          name: '',
          capacity: 20,
          location: '',
          description: ''
        });
      } else {
        setError(response.message || '강의실 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('강의실 생성 오류:', error);
      setError('강의실 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>새 강의실 추가</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="classroom-form">
          <div className="form-group">
            <Label htmlFor="name" variant="default" size="medium">
              강의실명 *
            </Label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="예: 101호, A강의실"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="capacity" variant="default" size="medium">
              수용 인원 *
            </Label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              min="1"
              max="100"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="location" variant="default" size="medium">
              위치
            </Label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="예: 1층, 2층 동쪽"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="description" variant="default" size="medium">
              설명
            </Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="강의실에 대한 추가 설명"
              rows={3}
              className="form-textarea"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="cancel-btn"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? '추가 중...' : '강의실 추가'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
