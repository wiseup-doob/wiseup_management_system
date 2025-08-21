import React, { useState } from 'react'
import './TimeInputForm.css'
import { Button } from '../../../components/buttons/Button'
import { Label } from '../../../components/labels/Label'

export interface TimeSlot {
  id: string
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  startTime: string
  endTime: string
}

interface TimeInputFormProps {
  onTimeSlotAdd: (timeSlot: TimeSlot) => void
  onTimeSlotUpdate?: (timeSlot: TimeSlot) => void
  initialTimeSlot?: TimeSlot
  isEditing?: boolean
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: '월요일' },
  { value: 'tuesday', label: '화요일' },
  { value: 'wednesday', label: '수요일' },
  { value: 'thursday', label: '목요일' },
  { value: 'friday', label: '금요일' },
  { value: 'saturday', label: '토요일' },
  { value: 'sunday', label: '일요일' }
]

const TIME_OPTIONS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00'
]

export const TimeInputForm: React.FC<TimeInputFormProps> = ({
  onTimeSlotAdd,
  onTimeSlotUpdate,
  initialTimeSlot,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<Omit<TimeSlot, 'id'>>({
    dayOfWeek: initialTimeSlot?.dayOfWeek || 'monday',
    startTime: initialTimeSlot?.startTime || '09:00',
    endTime: initialTimeSlot?.endTime || '10:00'
  })

  const [errors, setErrors] = useState<{
    dayOfWeek?: string
    startTime?: string
    endTime?: string
    general?: string
  }>({})

  // 시간 유효성 검증
  const validateTimeSlot = (): boolean => {
    const newErrors: typeof errors = {}

    // 시작 시간과 종료 시간 비교
    if (formData.startTime >= formData.endTime) {
      newErrors.endTime = '종료 시간은 시작 시간보다 늦어야 합니다.'
    }

    // 최소 수업 시간 (30분)
    const startMinutes = parseInt(formData.startTime.split(':')[1])
    const endMinutes = parseInt(formData.endTime.split(':')[1])
    const startHour = parseInt(formData.startTime.split(':')[0])
    const endHour = parseInt(formData.endTime.split(':')[0])
    
    const totalMinutes = (endHour * 60 + endMinutes) - (startHour * 60 + startMinutes)
    if (totalMinutes < 30) {
      newErrors.endTime = '수업 시간은 최소 30분 이상이어야 합니다.'
    }

    // 최대 수업 시간 (4시간)
    if (totalMinutes > 240) {
      newErrors.endTime = '수업 시간은 최대 4시간을 초과할 수 없습니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateTimeSlot()) {
      return
    }

    const timeSlot: TimeSlot = {
      id: initialTimeSlot?.id || `ts_${Date.now()}`,
      ...formData
    }

    if (isEditing && onTimeSlotUpdate) {
      onTimeSlotUpdate(timeSlot)
    } else {
      onTimeSlotAdd(timeSlot)
    }

    // 편집 모드가 아닌 경우 폼 초기화
    if (!isEditing) {
      setFormData({
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '10:00'
      })
    }
  }

  // 입력 필드 변경 처리
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 에러 메시지 초기화
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // 취소 처리
  const handleCancel = () => {
    if (initialTimeSlot && isEditing) {
      setFormData({
        dayOfWeek: initialTimeSlot.dayOfWeek,
        startTime: initialTimeSlot.startTime,
        endTime: initialTimeSlot.endTime
      })
    } else {
      setFormData({
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '10:00'
      })
    }
    setErrors({})
  }

  return (
    <div className="time-input-form">
      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <Label variant="heading" size="small">
            {isEditing ? '시간 수정' : '새 시간 추가'}
          </Label>
        </div>

        <div className="form-body">
          {/* 요일 선택 */}
          <div className="form-group">
            <Label variant="secondary" size="small" className="form-label">
              요일
            </Label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => handleInputChange('dayOfWeek', e.target.value)}
              className={`form-select ${errors.dayOfWeek ? 'error' : ''}`}
            >
              {DAYS_OF_WEEK.map(day => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
            {errors.dayOfWeek && (
              <span className="error-message">{errors.dayOfWeek}</span>
            )}
          </div>

          {/* 시작 시간 */}
          <div className="form-group">
            <Label variant="secondary" size="small" className="form-label">
              시작 시간
            </Label>
            <select
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className={`form-select ${errors.startTime ? 'error' : ''}`}
            >
              {TIME_OPTIONS.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.startTime && (
              <span className="error-message">{errors.startTime}</span>
            )}
          </div>

          {/* 종료 시간 */}
          <div className="form-group">
            <Label variant="secondary" size="small" className="form-label">
              종료 시간
            </Label>
            <select
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className={`form-select ${errors.endTime ? 'error' : ''}`}
            >
              {TIME_OPTIONS.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.endTime && (
              <span className="error-message">{errors.endTime}</span>
            )}
          </div>

          {/* 일반 에러 메시지 */}
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
        </div>

        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            className="submit-btn"
          >
            {isEditing ? '수정' : '추가'}
          </Button>
          
          {isEditing && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="cancel-btn"
            >
              취소
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
