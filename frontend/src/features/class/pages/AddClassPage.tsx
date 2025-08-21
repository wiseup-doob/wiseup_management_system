import React, { useState, useEffect } from 'react'
import './AddClassPage.css'
import { apiService } from '../../../services/api'
import { adaptClassToCreateRequest } from '../../../utils/classAdapter'

interface AddClassPageProps {
  isOpen: boolean
  onClose: () => void
  onClassCreated?: () => void  // 수업 생성 후 콜백
}

const AddClassPage: React.FC<AddClassPageProps> = ({ isOpen, onClose, onClassCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    // Course 정보 직접 입력
    subject: 'mathematics' as const,
    difficulty: 'intermediate' as const,
    // 수업 정보
    teacherId: '',
    classroomId: '',
    description: '',
    notes: ''
  })
  
  // 일정 정보를 위한 상태 추가
  const [schedules, setSchedules] = useState<Array<{
    id: string
    dayOfWeek: string
    startTime: string
    endTime: string
  }>>([])

  // 알림창 상태 추가
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // 폼 검증 상태 추가
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 백엔드 데이터 상태 추가
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([])
  const [classrooms, setClassrooms] = useState<Array<{ id: string; name: string }>>([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  // 백엔드에서 데이터 로드 (실제 API 호출)
  useEffect(() => {
    if (!isOpen) return
    
    const loadData = async () => {
      setIsLoadingData(true)
      try {
        // 실제 API 호출로 교체
        const [teachersResponse, classroomsResponse] = await Promise.all([
          apiService.getTeachers(),
          apiService.getClassrooms()
        ])
        
        // 응답 데이터 설정
        if (teachersResponse.success && teachersResponse.data) {
          setTeachers(teachersResponse.data.map(teacher => ({
            id: teacher.id,
            name: teacher.name
          })))
        }
        
        if (classroomsResponse.success && classroomsResponse.data) {
          setClassrooms(classroomsResponse.data.map(classroom => ({
            id: classroom.id,
            name: classroom.name
          })))
        }
      } catch (error) {
        console.error('데이터 로딩 실패:', error)
        setErrorMessage('데이터를 불러오는데 실패했습니다. 다시 시도해주세요.')
        setShowErrorAlert(true)
      } finally {
        setIsLoadingData(false)
      }
    }
    
    loadData()
  }, [isOpen])

  // 모달이 닫힐 때 폼 상태 정리
  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫힐 때 모든 상태 초기화
      resetForm()
      setShowSuccessAlert(false)
      setShowErrorAlert(false)
      setErrorMessage('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  // 필드 터치 처리
  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    validateField(fieldName, formData[fieldName as keyof typeof formData])
  }

  // 개별 필드 검증
  const validateField = (fieldName: string, value: string) => {
    let fieldError = ''

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          fieldError = '수업명은 필수입니다.'
        } else if (value.trim().length < 2) {
          fieldError = '수업명은 2자 이상이어야 합니다.'
        } else if (value.trim().length > 50) {
          fieldError = '수업명은 50자 이하여야 합니다.'
        }
        break


      case 'subject':
        if (!value.trim()) {
          fieldError = '과목을 선택해주세요.'
        }
        break

      case 'teacherId':
        if (!value.trim()) {
          fieldError = '담당 교사를 선택해주세요.'
        }
        break

      case 'classroomId':
        if (!value.trim()) {
          fieldError = '강의실을 선택해주세요.'
        }
        break



      default:
        break
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldError
    }))

    return fieldError
  }

  // 일정 데이터 검증
  const validateSchedules = () => {
    if (schedules.length === 0) {
      return '최소 하나의 수업 일정을 추가해야 합니다.'
    }

    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i]
      
      if (!schedule.dayOfWeek) {
        return `${i + 1}번째 일정의 요일을 선택해주세요.`
      }
      
      if (!schedule.startTime) {
        return `${i + 1}번째 일정의 시작 시간을 입력해주세요.`
      }
      
      if (!schedule.endTime) {
        return `${i + 1}번째 일정의 종료 시간을 입력해주세요.`
      }

      // 시작 시간이 종료 시간보다 늦은 경우
      if (schedule.startTime >= schedule.endTime) {
        return `${i + 1}번째 일정의 시작 시간은 종료 시간보다 빨라야 합니다.`
      }

      // 시간 중복 검사
      for (let j = i + 1; j < schedules.length; j++) {
        const otherSchedule = schedules[j]
        if (schedule.dayOfWeek === otherSchedule.dayOfWeek) {
          // 같은 요일에 시간이 겹치는지 검사
          if (
            (schedule.startTime < otherSchedule.endTime && schedule.endTime > otherSchedule.startTime)
          ) {
            return `${i + 1}번째와 ${j + 1}번째 일정의 시간이 겹칩니다.`
          }
        }
      }
    }

    return ''
  }

  // 전체 폼 검증
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 각 필드 검증
    Object.keys(formData).forEach(fieldName => {
      const fieldError = validateField(fieldName, formData[fieldName as keyof typeof formData])
      if (fieldError) {
        newErrors[fieldName] = fieldError
      }
    })

    // 일정 검증
    const scheduleError = validateSchedules()
    if (scheduleError) {
      newErrors.schedules = scheduleError
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // 실시간 검증 (필드가 터치된 경우에만)
    if (touched[name]) {
      validateField(name, value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 제출 중 상태 설정
    setIsSubmitting(true)
    
    // 모든 필드를 터치된 상태로 설정
    const allFields = Object.keys(formData)
    setTouched(prev => {
      const newTouched = { ...prev }
      allFields.forEach(field => {
        newTouched[field] = true
      })
      return newTouched
    })
    
    // 폼 검증
    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }
    
    try {
      // 폼 데이터를 백엔드 형식으로 변환
      const classFormData = {
        name: formData.name,
        // Course 정보 직접 사용
        courseName: formData.name, // 수업명을 강의명으로도 사용
        subject: formData.subject,
        difficulty: formData.difficulty,
        teacherName: teachers.find(t => t.id === formData.teacherId)?.name || '',
        maxStudents: 20, // 항상 20명으로 고정
        roomNumber: classrooms.find(c => c.id === formData.classroomId)?.name || '',
        schedule: schedules.map(s => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`).join(', '),
        description: formData.description,
        notes: formData.notes
      }

      // 백엔드 형식으로 변환 (Course 정보 포함)
      const createRequest = {
        ...classFormData,
        teacherId: formData.teacherId,
        classroomId: formData.classroomId,
        schedule: schedules
      }

      console.log('수업 추가 요청:', createRequest)
      
      // 새로운 API 호출: Course와 ClassSection을 한번에 생성
      const response = await apiService.createClassWithCourse(createRequest)
      
      if (response.success && response.data) {
        // 성공 시 폼 초기화
        resetForm()
        
        // 성공 시 알림창 표시
        setShowSuccessAlert(true)
        
        // 콜백 호출 (부모 컴포넌트에 알림) - 즉시 호출
        if (onClassCreated) {
          onClassCreated()
        }
        
        // 2초 후 알림창 자동 숨김 및 모달 닫기
        setTimeout(() => {
          setShowSuccessAlert(false)
          onClose()
        }, 2000)
      } else {
        // API 응답은 성공했지만 데이터가 없는 경우
        throw new Error(response.message || '수업 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('수업 추가 실패:', error)
      
      // 에러 메시지 설정
      const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      setErrorMessage(errorMsg)
      setShowErrorAlert(true)
      
      // 5초 후 에러 알림창 자동 숨김
      setTimeout(() => {
        setShowErrorAlert(false)
        setErrorMessage('')
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 폼 초기화 함수
  const resetForm = () => {
    setFormData({
      name: '',
      subject: 'mathematics' as const,
      difficulty: 'intermediate' as const,
      teacherId: '',
      classroomId: '',
      description: '',
      notes: ''
    })
    setSchedules([])
    setErrors({})
    setTouched({})
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 성공 알림창 */}
        {showSuccessAlert && (
          <div className="success-alert">
            <div className="success-alert-content">
              <div className="success-icon">✓</div>
              <div className="success-message">
                <h3>수업 추가 완료!</h3>
                <p>새로운 수업이 성공적으로 생성되었습니다.</p>
              </div>
            </div>
          </div>
        )}

        {/* 에러 알림창 */}
        {showErrorAlert && (
          <div className="error-alert">
            <div className="error-alert-content">
              <div className="error-icon">✕</div>
              <div className="error-message">
                <h3>수업 추가 실패</h3>
                <p>{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="add-class-page">
          <div className="add-class-header">
            <h1>수업 추가</h1>
            <p>새로운 수업을 생성합니다.</p>
            <button className="close-button" onClick={handleCancel}>
              ✕
            </button>
          </div>

          <div className="add-class-content">
            <form onSubmit={handleSubmit} className="add-class-form">
              {/* 기본 정보 섹션 */}
              <div className="form-section">
                <h2>기본 정보</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">수업명 *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('name')}
                      placeholder="예: 2024년 봄학기 수학 A반, 오전 영어 회화반"
                      className={touched.name && errors.name ? 'error' : ''}
                      required
                      disabled={isSubmitting}
                    />
                    {touched.name && errors.name && (
                      <div className="error-message">{errors.name}</div>
                    )}
                  </div>

                  
                  <div className="form-group">
                    <label htmlFor="subject">과목 *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('subject')}
                      className={touched.subject && errors.subject ? 'error' : ''}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="mathematics">수학</option>
                      <option value="english">영어</option>
                      <option value="korean">국어</option>
                      <option value="other">기타</option>
                    </select>
                    {touched.subject && errors.subject && (
                      <div className="error-message">{errors.subject}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="difficulty">난이도</label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('difficulty')}
                      className={touched.difficulty && errors.difficulty ? 'error' : ''}
                      disabled={isSubmitting}
                    >
                      <option value="beginner">초급</option>
                      <option value="intermediate">중급</option>
                      <option value="advanced">고급</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="teacherId">담당 교사 선택 *</label>
                    {isLoadingData ? (
                      <div className="skeleton-select">로딩 중...</div>
                    ) : (
                      <select
                        id="teacherId"
                        name="teacherId"
                        value={formData.teacherId}
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur('teacherId')}
                        className={touched.teacherId && errors.teacherId ? 'error' : ''}
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">교사를 선택하세요</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {touched.teacherId && errors.teacherId && (
                      <div className="error-message">{errors.teacherId}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="classroomId">강의실 선택 *</label>
                    {isLoadingData ? (
                      <div className="skeleton-select">로딩 중...</div>
                    ) : (
                      <select
                        id="classroomId"
                        name="classroomId"
                        value={formData.classroomId}
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur('classroomId')}
                        className={touched.classroomId && errors.classroomId ? 'error' : ''}
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">강의실을 선택하세요</option>
                        {classrooms.map(classroom => (
                          <option key={classroom.id} value={classroom.id}>
                            {classroom.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {touched.classroomId && errors.classroomId && (
                      <div className="error-message">{errors.classroomId}</div>
                    )}
                  </div>
                </div>


              </div>

              {/* 요일/시간대 추가 섹션 */}
              <div className="form-section">
                <div className="schedule-section">
                  <div className="schedule-header">
                    <h3>수업 일정</h3>
                    <button 
                      type="button" 
                      className="btn-add-schedule"
                      onClick={() => {
                        const newSchedule = {
                          id: Date.now().toString(),
                          dayOfWeek: '',
                          startTime: '',
                          endTime: ''
                        }
                        setSchedules([...schedules, newSchedule])
                      }}
                      disabled={isSubmitting}
                    >
                      + 일정 추가
                    </button>
                  </div>
                  
                  {/* 일정 에러 메시지 */}
                  {errors.schedules && (
                    <div className="error-message schedule-error">
                      {errors.schedules}
                    </div>
                  )}
                  
                  {schedules.length === 0 ? (
                    <div className="no-schedules">
                      <p>추가된 수업 일정이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="schedules-list">
                      {schedules.map((schedule, index) => (
                        <div key={schedule.id} className="schedule-item">
                          <div className="schedule-inputs">
                            <div className="form-group">
                              <label>요일 *</label>
                              <select
                                value={schedule.dayOfWeek}
                                onChange={(e) => {
                                  const updatedSchedules = schedules.map((s, i) => 
                                    i === index ? { ...s, dayOfWeek: e.target.value } : s
                                  )
                                  setSchedules(updatedSchedules)
                                }}
                                required
                                disabled={isSubmitting}
                              >
                                <option value="">요일 선택</option>
                                <option value="monday">월요일</option>
                                <option value="tuesday">화요일</option>
                                <option value="wednesday">수요일</option>
                                <option value="thursday">목요일</option>
                                <option value="friday">금요일</option>
                                <option value="saturday">토요일</option>
                                <option value="sunday">일요일</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>시작 시간 *</label>
                              <input
                                type="time"
                                value={schedule.startTime}
                                onChange={(e) => {
                                  const updatedSchedules = schedules.map((s, i) => 
                                    i === index ? { ...s, startTime: e.target.value } : s
                                  )
                                  setSchedules(updatedSchedules)
                                }}
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="form-group">
                              <label>종료 시간 *</label>
                              <input
                                type="time"
                                value={schedule.endTime}
                                onChange={(e) => {
                                  const updatedSchedules = schedules.map((s, i) => 
                                    i === index ? { ...s, endTime: e.target.value } : s
                                  )
                                  setSchedules(updatedSchedules)
                                }}
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-remove-schedule"
                            onClick={() => {
                              const updatedSchedules = schedules.filter((_, i) => i !== index)
                              setSchedules(updatedSchedules)
                            }}
                            disabled={isSubmitting}
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 추가 정보 섹션 */}
              <div className="form-section">
                <h2>추가 정보</h2>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="description">수업 설명</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="수업에 대한 설명을 입력하세요"
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="notes">메모</label>
                    <textarea
                      id="description"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="추가 메모를 입력하세요"
                      rows={2}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* 버튼 섹션 */}
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  className="btn-cancel"
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '추가 중...' : '수업 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddClassPage
