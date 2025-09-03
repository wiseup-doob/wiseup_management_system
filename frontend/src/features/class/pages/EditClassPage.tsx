import React, { useState, useEffect } from 'react'
import './EditClassPage.css'
import { apiService } from '../../../services/api'
import { adaptClassToUpdateRequest } from '../../../utils/classAdapter'
import type { ClassSection } from '@shared/types/class-section.types'
import type { Class } from '../types/class.types'

interface EditClassPageProps {
  isOpen: boolean
  onClose: () => void
  classData: ClassSection | null  // 편집할 수업 데이터
  onClassUpdated?: () => void  // 수업 수정 후 콜백
}

const EditClassPage: React.FC<EditClassPageProps> = ({ 
  isOpen, 
  onClose, 
  classData, 
  onClassUpdated 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    courseId: '',
    teacherId: '',
    classroomId: '',
    maxStudents: '',
    description: '',
    // AddClassPage와 동일한 구조로 추가
    subject: 'mathematics' as const,
    difficulty: 'intermediate' as const,
    // 색상 필드 추가
    color: classData?.color || '#3498db'
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
  const [courses, setCourses] = useState<Array<{ id: string; name: string; subject: string; difficulty: string }>>([])
  const [classrooms, setClassrooms] = useState<Array<{ id: string; name: string }>>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  
  // 현재 수업의 Course 정보 상태
  const [currentCourse, setCurrentCourse] = useState<{ subject: string; difficulty: string } | null>(null)
  
  // 색상 선택 관련 상태
  const [useColorPalette, setUseColorPalette] = useState(false)
  const [selectedPaletteColor, setSelectedPaletteColor] = useState('')
  const [customColor, setCustomColor] = useState('')
  const [availableColors, setAvailableColors] = useState<Array<{ code: string; name: string }>>([])
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false)

  // 색상 팔레트 로드 및 기존 색상 상태 설정
  useEffect(() => {
    const loadColorPalette = async () => {
      try {
        const response = await apiService.getColorPalette()
        if (response.success && response.data) {
          setAvailableColors(response.data)
          
          // 기존 색상이 로드된 후 색상 상태 설정
          if (classData?.color && response.data.length > 0) {
            const existingColor = classData.color
            const isColorInPalette = response.data.some(color => color.code === existingColor)
            
            if (isColorInPalette) {
              // 색상 팔레트에 있는 색상인 경우
              setUseColorPalette(true)
              setSelectedPaletteColor(existingColor)
              setCustomColor(existingColor)
            } else {
              // 색상 팔레트에 없는 색상인 경우
              setUseColorPalette(false)
              setSelectedPaletteColor('')
              setCustomColor(existingColor)
            }
          }
        } else {
          setAvailableColors([])
        }
      } catch (error) {
        setAvailableColors([])
      }
    }
    
    loadColorPalette()
  }, [classData?.color])

  // 백엔드에서 데이터 로드 (실제 API 호출)
  useEffect(() => {
    if (!isOpen) return
    
    const loadData = async () => {
      setIsLoadingData(true)
      try {
        // 실제 API 호출로 교체
        const [teachersResponse, coursesResponse, classroomsResponse] = await Promise.all([
          apiService.getTeachers(),
          apiService.getCourses(),
          apiService.getClassrooms()
        ])
        
        // 응답 데이터 설정
        if (teachersResponse.success && teachersResponse.data) {
          const teacherData = teachersResponse.data.map(teacher => ({
            id: teacher.id,
            name: teacher.name
          }))
          setTeachers(teacherData)
        } else {
          setTeachers([])
        }
        
        if (coursesResponse.success && coursesResponse.data) {
          const courseData = coursesResponse.data.map(course => ({
            id: course.id,
            name: course.name,
            subject: course.subject || '', // subject를 grade로 매핑
            difficulty: course.difficulty || '' // difficulty를 classNumber로 매핑
          }))
          setCourses(courseData)
        } else {
          setCourses([])
        }
        
        if (classroomsResponse.success && classroomsResponse.data) {
          const classroomData = classroomsResponse.data.map(classroom => ({
            id: classroom.id,
            name: classroom.name
          }))
          setClassrooms(classroomData)
        } else {
          setClassrooms([])
        }
      } catch (error) {
        setErrorMessage('데이터를 불러오는데 실패했습니다. 다시 시도해주세요.')
        setShowErrorAlert(true)
      } finally {
        setIsLoadingData(false)
      }
    }
    
    loadData()
  }, [isOpen])

  // 수업 데이터가 변경될 때 기본 폼 데이터 설정
  useEffect(() => {
    if (classData && isOpen) {
      
      // 기본 폼 데이터만 설정 (데이터 로딩 완료 후 상세 초기화)
      setFormData(prev => ({
        ...prev,
        name: classData.name,
        maxStudents: classData.maxStudents.toString(),
        description: classData.description || '',
        // course 정보에서 가져오거나 기본값 사용
        subject: 'mathematics' as const,
        difficulty: 'intermediate' as const
      }))
    }
  }, [classData, isOpen])

  // 데이터 로딩 완료 후 폼 초기화
  useEffect(() => {
    if (classData && isOpen && !isLoadingData && courses.length > 0 && teachers.length > 0 && classrooms.length > 0) {
      
      // 현재 수업의 Course 정보 찾기
      const course = courses.find(c => c.id === classData.courseId)
      if (course) {
        setCurrentCourse({
          subject: course.subject,
          difficulty: course.difficulty
        })
        
        // subject와 difficulty를 폼 데이터에 설정
        setFormData(prev => ({
          ...prev,
          subject: course.subject as any,
          difficulty: course.difficulty as any
        }))
      }
      
      setFormData({
        name: classData.name,
        courseId: classData.courseId,
        teacherId: classData.teacherId,
        classroomId: classData.classroomId,
        maxStudents: classData.maxStudents.toString(),
        description: classData.description || '',
        // Course 정보에서 가져온 값 사용
        subject: course?.subject as any || 'mathematics',
        difficulty: course?.difficulty as any || 'intermediate',
        // 색상 필드 추가
        color: classData.color || '#3498db'
      })
      
      // 일정 데이터 파싱 (ClassSchedule[] → UI 상태용 배열)
      if (classData.schedule) {
        const schedulesFromData = classData.schedule.map((schedule, index) => ({
          id: `schedule-${index}`,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime
        }))
        setSchedules(schedulesFromData)
      } else {
        setSchedules([])
      }
      
      // 데이터 무결성 검증
      validateDataIntegrity(classData)
      
    }
  }, [classData, isOpen, isLoadingData, courses, teachers, classrooms])

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

  // 데이터 무결성 검증 함수
  const validateDataIntegrity = (classData: ClassSection) => {
    const warnings: string[] = []
    
    // Course ID 검증
    const courseExists = courses.find(c => c.id === classData.courseId)
    if (!courseExists) {
      warnings.push(`강의 ID "${classData.courseId}"를 찾을 수 없습니다.`)
    }
    
    // Teacher ID 검증
    const teacherExists = teachers.find(t => t.id === classData.teacherId)
    if (!teacherExists) {
      warnings.push(`교사 ID "${classData.teacherId}"를 찾을 수 없습니다.`)
    }
    
    // Classroom ID 검증
    const classroomExists = classrooms.find(c => c.id === classData.classroomId)
    if (!classroomExists) {
      warnings.push(`강의실 ID "${classData.classroomId}"를 찾을 수 없습니다.`)
    }
    
    if (warnings.length > 0) {
      // 사용자에게 경고 메시지 표시 (선택적)
      // setErrorMessage(`다음 데이터에 문제가 있습니다:\n${warnings.join('\n')}`)
      // setShowErrorAlert(true)
    }
  }

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

      case 'subject':
        if (!value.trim()) {
          fieldError = '과목을 선택해주세요.'
        }
        break

      case 'difficulty':
        if (!value.trim()) {
          fieldError = '난이도를 선택해주세요.'
        }
        break

      case 'color':
        if (!value.trim()) {
          fieldError = '색상을 선택하거나 입력해주세요.'
        } else {
          // HEX 색상 코드 형식 검증
          const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
          if (!hexColorRegex.test(value)) {
            fieldError = '올바른 HEX 색상 코드를 입력해주세요. (예: #3498db)'
          }
        }
        break

      case 'maxStudents':
        if (!value.trim()) {
          fieldError = '최대 수강 인원은 필수입니다.'
        } else {
          const numValue = parseInt(value)
          if (isNaN(numValue) || numValue < 1) {
            fieldError = '최대 수강 인원은 1명 이상이어야 합니다.'
          } else if (numValue > 100) {
            fieldError = '최대 수강 인원은 100명 이하여야 합니다.'
          }
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
      // 시간표 데이터를 백엔드 형식으로 변환
      const scheduleData = schedules.map(schedule => ({
        dayOfWeek: schedule.dayOfWeek as any, // DayOfWeek 타입으로 캐스팅
        startTime: schedule.startTime,
        endTime: schedule.endTime
      }))
      
      // 1. Course 업데이트 (이름이 변경된 경우)
      if (formData.name !== classData?.name) {
        const courseUpdateRequest = {
          name: formData.name
        }
        
        try {
          await apiService.updateCourse(classData!.courseId, courseUpdateRequest)
        } catch (error) {
          // Course 업데이트 실패 시에도 ClassSection은 업데이트 시도
        }
      }
      
      // 2. ClassSection 업데이트
      const classSectionUpdateRequest = {
        name: formData.name,
        teacherId: formData.teacherId,
        classroomId: formData.classroomId,
        maxStudents: parseInt(formData.maxStudents),
        schedule: scheduleData,
        description: formData.description,
        // 색상 필드 추가
        color: formData.color
      }

      
      // 실제 API 호출
      const response = await apiService.updateClassSection(classData?.id || '', classSectionUpdateRequest)
      
      if (response.success) {
        // 성공 시 폼 초기화
        resetForm()
        
        // 성공 시 알림창 표시
        setShowSuccessAlert(true)
        
        // 콜백 호출 (부모 컴포넌트에 알림) - 즉시 호출
        if (onClassUpdated) {
          onClassUpdated()
        }
        
        // 2초 후 알림창 자동 숨김 및 모달 닫기
        setTimeout(() => {
          setShowSuccessAlert(false)
          onClose()
        }, 2000)
      } else {
        // API 응답이 실패한 경우
        throw new Error(response.message || '수업 수정에 실패했습니다.')
      }
    } catch (error) {
      // 에러 메시지 설정
      let errorMsg = '알 수 없는 오류가 발생했습니다.'
      
      if (error instanceof Error) {
        // 성공 메시지가 에러로 처리되는 경우 방지
        if (error.message.includes('성공적으로 수정되었습니다')) {
          // 실제로는 성공이므로 에러 처리하지 않음
          return
        }
        
        if (error.message.includes('Network Error') || error.message.includes('fetch')) {
          errorMsg = '네트워크 연결을 확인해주세요.'
        } else if (error.message.includes('timeout')) {
          errorMsg = '요청 시간이 초과되었습니다. 다시 시도해주세요.'
        } else {
          errorMsg = error.message
        }
      } else if (typeof error === 'string') {
        errorMsg = error
      }
      
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
      courseId: '',
      teacherId: '',
      classroomId: '',
      maxStudents: '',
      description: '',
      subject: 'mathematics' as const,
      difficulty: 'intermediate' as const,
      color: '#3498db'
    })
    setSchedules([])
    setErrors({})
    setTouched({})
    setCurrentCourse(null)
    // 색상 선택 상태 초기화
    setCustomColor('#3498db')
    setSelectedPaletteColor('')
    setUseColorPalette(false)
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen || !classData) {
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
                <h3>수업 수정 완료!</h3>
                <p>수업명과 수업 정보가 모두 성공적으로 수정되었습니다.</p>
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
                <h3>수업 수정 실패</h3>
                <p>{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="edit-class-page">
          <div className="edit-class-header">
            <h1>수업 수정</h1>
            <p>기존 수업 정보를 수정합니다.</p>
            <button className="close-button" onClick={handleCancel}>
              ✕
            </button>
          </div>

          <div className="edit-class-content">
            {isLoadingData ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>수업 정보를 불러오는 중...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="edit-class-form">
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
                      placeholder="수업명을 입력하세요"
                      className={touched.name && errors.name ? 'error' : ''}
                      required
                      disabled={isSubmitting}
                    />
                    {touched.name && errors.name && (
                      <div className="error-message">{errors.name}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="maxStudents">최대 수강 인원 *</label>
                    <input
                      type="number"
                      id="maxStudents"
                      name="maxStudents"
                      value={formData.maxStudents}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('maxStudents')}
                      placeholder="최대 수강 인원"
                      min="1"
                      max="100"
                      className={touched.maxStudents && errors.maxStudents ? 'error' : ''}
                      required
                      disabled={isSubmitting}
                    />
                    {touched.maxStudents && errors.maxStudents && (
                      <div className="error-message">{errors.maxStudents}</div>
                    )}
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

                {/* 기존 강의 정보 표시 (읽기 전용) */}
                <div className="form-row">
                  <div className="form-group">
                    <label>현재 강의</label>
                    <div className="readonly-field">
                      {currentCourse ? (
                        <>
                          <span className="course-name">{courses.find(c => c.id === formData.courseId)?.name || '알 수 없음'}</span>
                          <span className="course-details">
                            과목: {currentCourse.subject === 'mathematics' ? '수학' : 
                                   currentCourse.subject === 'english' ? '영어' : 
                                   currentCourse.subject === 'korean' ? '국어' : '기타'} | 
                            난이도: {currentCourse.difficulty === 'beginner' ? '초급' : 
                                     currentCourse.difficulty === 'intermediate' ? '중급' : 
                                     currentCourse.difficulty === 'advanced' ? '고급' : '기타'}
                          </span>
                        </>
                      ) : (
                        <span className="loading-text">강의 정보 로딩 중...</span>
                      )}
                    </div>
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
                      <option value="">과목을 선택하세요</option>
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
                    <label htmlFor="difficulty">난이도 *</label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('difficulty')}
                      className={touched.difficulty && errors.difficulty ? 'error' : ''}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">난이도를 선택하세요</option>
                      <option value="beginner">초급</option>
                      <option value="intermediate">중급</option>
                      <option value="advanced">고급</option>
                    </select>
                    {touched.difficulty && errors.difficulty && (
                      <div className="error-message">{errors.difficulty}</div>
                    )}
                  </div>
                  
                  {/* 색상 선택 필드 추가 */}
                  <div className="form-group">
                    <label>시간표 색상</label>
                    
                    {/* 색상 팔레트 사용 체크박스 */}
                    <div className="edit-class-color-palette-checkbox">
                      <input
                        type="checkbox"
                        id="useColorPalette"
                        checked={useColorPalette}
                        onChange={(e) => {
                          const usePalette = e.target.checked
                          setUseColorPalette(usePalette)
                          
                          // 체크박스 상태 변경 시 색상 선택 상태 초기화
                          if (usePalette) {
                            // 팔레트 사용 시: 선택된 팔레트 색상이 있으면 유지, 없으면 기본값
                            if (selectedPaletteColor) {
                              setFormData(prev => ({ ...prev, color: selectedPaletteColor }))
                            } else {
                              setFormData(prev => ({ ...prev, color: '#3498db' }))
                            }
                          } else {
                            // 직접 입력 시: 현재 customColor 사용
                            setFormData(prev => ({ ...prev, color: customColor || '#3498db' }))
                          }
                        }}
                        disabled={isSubmitting}
                      />
                      <label htmlFor="useColorPalette">색상 팔레트 사용</label>
                    </div>

                    {/* 색상 팔레트 커스텀 드롭다운 (체크박스 체크 시) */}
                    {useColorPalette && (
                      <div className="edit-class-color-custom-dropdown">
                        <div 
                          className="edit-class-color-dropdown-trigger"
                          onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
                          style={{ 
                            backgroundColor: selectedPaletteColor || '#ffffff',
                            color: selectedPaletteColor ? '#ffffff' : '#6c757d',
                            border: selectedPaletteColor ? 'none' : '2px solid #e9ecef'
                          }}
                        >
                          {selectedPaletteColor ? (
                            <>
                              <div className="edit-class-color-preview-box"></div>
                              <span>
                                {availableColors.find(color => color.code === selectedPaletteColor)?.name || selectedPaletteColor}
                              </span>
                            </>
                          ) : (
                            '색상을 선택하세요'
                          )}
                          <span className="edit-class-color-dropdown-arrow">▼</span>
                        </div>
                        
                        {colorDropdownOpen && (
                          <div className="edit-class-color-dropdown-menu">
                            <div 
                              className="edit-class-color-option"
                              onClick={() => {
                                setSelectedPaletteColor('')
                                setCustomColor('')
                                setFormData(prev => ({ ...prev, color: '' }))
                                setColorDropdownOpen(false)
                              }}
                            >
                              <div className="edit-class-color-option-preview" style={{ backgroundColor: '#e9ecef' }}></div>
                              <span>색상을 선택하세요</span>
                            </div>
                            
                            {availableColors.map(color => (
                              <div 
                                key={color.code}
                                className="edit-class-color-option"
                                onClick={() => {
                                  setSelectedPaletteColor(color.code)
                                  setCustomColor(color.code)
                                  setFormData(prev => ({ ...prev, color: color.code }))
                                  setColorDropdownOpen(false)
                                }}
                              >
                                <div 
                                  className="edit-class-color-option-preview"
                                  style={{ backgroundColor: color.code }}
                                ></div>
                                <span>{color.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 직접 입력 필드 (체크박스 체크 안 함 시) */}
                    {!useColorPalette && (
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          const inputColor = e.target.value
                          setCustomColor(inputColor)
                          setSelectedPaletteColor('') // 팔레트 선택 초기화
                          setFormData(prev => ({ ...prev, color: inputColor }))
                        }}
                        placeholder="#3498db"
                        className="edit-class-custom-color-input"
                        disabled={isSubmitting}
                      />
                    )}
                    
                    <small className="edit-class-color-form-text">
                      {useColorPalette 
                        ? '미리 정의된 색상 팔레트에서 선택하세요' 
                        : 'HEX 색상 코드를 직접 입력하세요 (예: #3498db)'
                      }
                    </small>
                  </div>
                </div>
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
                  {isSubmitting ? '수정 중...' : '수업 수정'}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditClassPage
