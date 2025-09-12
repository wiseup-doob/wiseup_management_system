import React, { useEffect, useState } from 'react'
import { apiService } from '../../../services/api'
import { Button } from '../../buttons/Button'
import { Label } from '../../labels/Label'
import './ClassDetailModal.css'

interface ClassDetailModalProps {
  isOpen: boolean
  onClose: () => void
  classSectionId: string | null
  onColorSaved?: () => void
  showColorPicker?: boolean  // 색상 선택기 표시 여부 (기본값: true)
  showStudentList?: boolean  // 학생 목록 표시 여부 (기본값: true)
}

interface ClassDetails {
  id: string
  name: string
  currentStudents: number
  color?: string
}

interface EnrolledStudent {
  id: string
  name: string
  grade: string
  status: 'active' | 'inactive'
  contactInfo?: {
    phone?: string
    email?: string
  }
}

// 데이터 검증 및 기본값 처리 함수
const validateAndNormalizeClassDetails = (data: any): ClassDetails => {
  console.log('🔍 원본 API 응답 데이터:', data)
  
  return {
    id: data.id || '',
    name: data.name || '수업명 없음',
    currentStudents: data.currentStudents || 0,
    color: data.color || '#3498db'
  }
}

// 수강 인원 데이터 검증 및 기본값 처리 함수
const validateAndNormalizeEnrolledStudents = (data: any[]): EnrolledStudent[] => {
  if (!Array.isArray(data)) {
    return []
  }
  
  return data.map((student: any) => ({
    id: student.id || '',
    name: student.name || '이름 없음',
    grade: student.grade || '학년 미정',
    status: student.status || 'active',
    contactInfo: {
      phone: student.contactInfo?.phone || '',
      email: student.contactInfo?.email || ''
    }
  }))
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  isOpen,
  onClose,
  classSectionId,
  onColorSaved,
  showColorPicker = true,    // 기본값: true
  showStudentList = true     // 기본값: true
}) => {
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 색상 선택 관련 상태 추가
  const [useColorPalette, setUseColorPalette] = useState(false)
  const [selectedPaletteColor, setSelectedPaletteColor] = useState('')
  const [customColor, setCustomColor] = useState('')
  const [availableColors, setAvailableColors] = useState<Array<{ code: string; name: string }>>([])
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false)
  const [isSavingColor, setIsSavingColor] = useState(false)
  
  // 임시 색상 상태 (저장 전까지)
  const [tempSelectedColor, setTempSelectedColor] = useState('')

  // 알림 상태 추가
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // 색상 팔레트 로드 useEffect 추가
  useEffect(() => {
    const loadColorPalette = async () => {
      try {
        const response = await apiService.getColorPalette()
        if (response.success && response.data) {
          setAvailableColors(response.data)
          
          // 기존 색상이 로드된 후 색상 상태 설정
          if (classDetails?.color && response.data.length > 0) {
            const isColorInPalette = response.data.some(color => color.code === classDetails.color)
            
            if (isColorInPalette) {
              setUseColorPalette(true)
              setSelectedPaletteColor(classDetails.color)
              setCustomColor(classDetails.color)
              setTempSelectedColor(classDetails.color)
            } else {
              setUseColorPalette(false)
              setSelectedPaletteColor('')
              setCustomColor(classDetails.color)
              setTempSelectedColor(classDetails.color)
            }
          }
        }
      } catch (error) {
        setAvailableColors([])
      }
    }
    
    if (isOpen) {
      loadColorPalette()
    }
  }, [isOpen, classDetails?.color])

  // API 호출 로직
  useEffect(() => {
    if (isOpen && classSectionId) {
      loadClassDetail()
    } else {
      // 모달이 닫힐 때 상태 초기화
      setClassDetails(null)
      setEnrolledStudents([])
      setError(null)
    }
  }, [isOpen, classSectionId])

  const loadClassDetail = async () => {
    if (!classSectionId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('📚 수업 상세 정보 로드 시작:', classSectionId)
      
      // 병렬로 API 호출하여 성능 최적화
      const [detailsResponse, studentsResponse] = await Promise.allSettled([
        apiService.getClassSectionWithDetailsById(classSectionId),
        apiService.getEnrolledStudents(classSectionId)
      ])
      
      // 수업 상세 정보 처리
      if (detailsResponse.status === 'fulfilled' && detailsResponse.value.success && detailsResponse.value.data) {
        console.log('✅ 수업 상세 정보 로드 성공:', detailsResponse.value.data)
        // 데이터 검증 및 기본값 처리
        const validatedData = validateAndNormalizeClassDetails(detailsResponse.value.data)
        setClassDetails(validatedData)
      } else {
        const errorMsg = detailsResponse.status === 'rejected' 
          ? detailsResponse.reason?.message || '수업 정보를 불러오는 중 오류가 발생했습니다.'
          : detailsResponse.value?.message || '수업 정보를 불러올 수 없습니다.'
        console.error('❌ 수업 상세 정보 로드 실패:', errorMsg)
        setError(errorMsg)
      }
      
      // 수강 인원 정보 처리
      if (studentsResponse.status === 'fulfilled' && studentsResponse.value.success && studentsResponse.value.data) {
        console.log('✅ 수강 인원 정보 로드 성공:', studentsResponse.value.data)
        // 수강 인원 데이터 검증 및 기본값 처리
        const validatedStudents = validateAndNormalizeEnrolledStudents(studentsResponse.value.data)
        setEnrolledStudents(validatedStudents)
      } else {
        const errorMsg = studentsResponse.status === 'rejected' 
          ? studentsResponse.reason?.message || '수강 인원 정보를 불러오는 중 오류가 발생했습니다.'
          : studentsResponse.value?.message || '수강 인원 정보를 불러올 수 없습니다.'
        console.warn('⚠️ 수강 인원 정보 로드 실패:', errorMsg)
        // 수강 인원 정보는 필수가 아니므로 에러로 처리하지 않음
        setEnrolledStudents([])
      }
      
    } catch (err) {
      console.error('❌ 수업 상세 정보 로드 중 예상치 못한 오류:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatSchedule = (schedule: Array<{dayOfWeek: string, startTime: string, endTime: string}>) => {
    const dayNames: {[key: string]: string} = {
      'monday': '월요일',
      'tuesday': '화요일',
      'wednesday': '수요일',
      'thursday': '목요일',
      'friday': '금요일',
      'saturday': '토요일',
      'sunday': '일요일'
    }
    
    return schedule.map(s => 
      `${dayNames[s.dayOfWeek] || s.dayOfWeek} ${s.startTime} - ${s.endTime}`
    ).join(', ')
  }

  // 임시 색상 선택 함수 (저장하지 않음)
  const handleTempColorChange = (newColor: string) => {
    setTempSelectedColor(newColor)
  }

  // 색상 저장 API 호출 함수
  const handleSaveColor = async () => {
    if (!classSectionId || !tempSelectedColor) return;
    
    setIsSavingColor(true);
    try {
      const response = await apiService.updateClassSection(classSectionId, {
        color: tempSelectedColor
      });
      
      if (response.success) {
        setClassDetails(prev => prev ? { ...prev, color: tempSelectedColor } : null);
        
        // 시간표 새로고침 콜백 호출
        onColorSaved?.();
        
        setShowSuccessAlert(true);
        // 성공 알림 표시 후 바로 모달 닫기
        onClose();
      } else {
        throw new Error(response.message || '색상 저장에 실패했습니다.');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '색상 저장 중 오류가 발생했습니다.');
      setShowErrorAlert(true);
      setTimeout(() => {
        setShowErrorAlert(false);
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsSavingColor(false);
    }
  };


  if (!isOpen) return null

  return (
    <div className="class-detail-modal-overlay" onClick={onClose}>
      <div className="class-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* 성공 알림창 */}
        {showSuccessAlert && (
          <div className="success-alert">
            <div className="success-alert-content">
              <div className="success-icon">✓</div>
              <div className="success-message">
                <h3>색상 변경 완료!</h3>
                <p>수업 색상이 성공적으로 변경되었습니다.</p>
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
                <h3>색상 변경 실패</h3>
                <p>{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* 모달 헤더 */}
        <div className="class-detail-modal-header">
          <div className="header-content">
            <Label variant="heading" size="large">
              {classDetails ? `${classDetails.name}` : '수업 이름 로드 실패'}
            </Label>
          </div>
          <Button 
            variant="ghost" 
            size="small" 
            onClick={onClose}
            className="close-button"
          >
            ✕
          </Button>
        </div>

        {/* 모달 내용 */}
        <div className="class-detail-modal-content">
          {isLoading ? (
            <div className="loading-container">
              <Label variant="secondary" size="medium">
                수업 정보를 불러오는 중...
              </Label>
            </div>
          ) : error ? (
            <div className="error-container">
              <Label variant="error" size="medium">
                {error}
              </Label>
              <Button 
                variant="primary" 
                size="small" 
                onClick={loadClassDetail}
                className="retry-button"
              >
                다시 시도
              </Button>
            </div>
          ) : classDetails ? (
            <div className="class-details-container">

              {/* 수강 인원 목록 - 조건부 렌더링 */}
              {showStudentList && (
                <div className="class-detail-info-section">
                  <Label variant="heading" size="medium" className="class-detail-section-title">
                    수강 인원 ({enrolledStudents.length}명)
                  </Label>
                  
                  {enrolledStudents.length > 0 ? (
                    <table className="students-table">
                      <thead>
                        <tr>
                          <th>학생명</th>
                          <th>학교</th>
                          <th>학년</th>
                          <th>학생 전화번호</th>
                          <th>학부모 전화번호</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map((student) => (
                          <tr key={student.id}>
                            <td>{student.name}</td>
                            <td>-</td>
                            <td>{student.grade}</td>
                            <td>{student.contactInfo?.phone || '-'}</td>
                            <td>-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty-students">
                      <Label variant="secondary" size="medium">
                        등록된 학생이 없습니다.
                      </Label>
                    </div>
                  )}
                </div>
              )}

              {/* 색상 변경 섹션 - 조건부 렌더링 */}
              {showColorPicker && (
                <div className="color-picker-section">
                  <h4>수업 색상 변경</h4>
                  
                  {/* 색상 팔레트 체크박스 */}
                  <div className="color-palette-checkbox">
                    <input
                      type="checkbox"
                      id="useColorPalette"
                      checked={useColorPalette}
                      onChange={(e) => {
                        const usePalette = e.target.checked
                        setUseColorPalette(usePalette)
                        
                        if (usePalette) {
                          if (selectedPaletteColor) {
                            handleTempColorChange(selectedPaletteColor)
                          } else {
                            handleTempColorChange('#3498db')
                          }
                        } else {
                          handleTempColorChange(customColor || '#3498db')
                        }
                      }}
                      disabled={isSavingColor}
                    />
                    <label htmlFor="useColorPalette">색상 팔레트 사용</label>
                  </div>

                  {/* 색상 팔레트 드롭다운 */}
                  {useColorPalette && (
                    <div className="color-custom-dropdown">
                      <div 
                        className="color-dropdown-trigger"
                        onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
                        style={{ 
                          backgroundColor: tempSelectedColor || '#ffffff',
                          color: tempSelectedColor ? '#ffffff' : '#6c757d',
                          border: tempSelectedColor ? 'none' : '2px solid #e9ecef'
                        }}
                      >
                        {tempSelectedColor ? (
                          <>
                            <div className="color-preview-box"></div>
                            <span>
                              {availableColors.find(color => color.code === tempSelectedColor)?.name || tempSelectedColor}
                            </span>
                          </>
                        ) : (
                          '색상을 선택하세요'
                        )}
                        <span className="color-dropdown-arrow">▼</span>
                      </div>
                      
                      {colorDropdownOpen && (
                        <div className="color-dropdown-menu">
                          <div 
                            className="color-option"
                            onClick={() => {
                              setSelectedPaletteColor('')
                              setCustomColor('')
                              handleTempColorChange('')
                              setColorDropdownOpen(false)
                            }}
                          >
                            <div className="color-option-preview" style={{ backgroundColor: '#e9ecef' }}></div>
                            <span>색상을 선택하세요</span>
                          </div>
                          
                          {availableColors.map(color => (
                            <div 
                              key={color.code}
                              className="color-option"
                              onClick={() => {
                                setSelectedPaletteColor(color.code)
                                setCustomColor(color.code)
                                handleTempColorChange(color.code)
                                setColorDropdownOpen(false)
                              }}
                            >
                              <div 
                                className="color-option-preview"
                                style={{ backgroundColor: color.code }}
                              ></div>
                              <span>{color.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 직접 입력 필드 */}
                  {!useColorPalette && (
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => {
                        const inputColor = e.target.value
                        setCustomColor(inputColor)
                        setSelectedPaletteColor('')
                        handleTempColorChange(inputColor)
                      }}
                      placeholder="#3498db"
                      className="custom-color-input"
                      disabled={isSavingColor}
                    />
                  )}
                  
                  <small className="color-form-text">
                    {useColorPalette 
                      ? '미리 정의된 색상 팔레트에서 선택하세요' 
                      : 'HEX 색상 코드를 직접 입력하세요 (예: #3498db)'
                    }
                  </small>

                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <div className="modal-footer-buttons">
            {/* 색상 저장 버튼 - 색상 선택기가 활성화된 경우에만 표시 */}
            {showColorPicker && (
              <Button 
                onClick={handleSaveColor}
                disabled={!tempSelectedColor || isSavingColor}
                variant="primary"
                size="medium"
                className="color-save-button"
              >
                {isSavingColor ? '저장 중...' : '색상 저장'}
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="medium" 
              onClick={onClose}
              className="close-modal-button"
            >
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
