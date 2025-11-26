import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { BaseWidget } from '../../../components/base/BaseWidget'
import { Label } from '../../../components/labels/Label'
import { Button } from '../../../components/buttons/Button'
import { SearchInput } from '../../../components/SearchInput/SearchInput'
import { apiService } from '../../../services/api'
import type { Student } from '@shared/types/student.types'
import type { ClassSectionWithDetails } from '../types/class.types'
import './AddStudentPage.css'

interface AddStudentPageProps {
  isOpen: boolean
  onClose: () => void
  classData: ClassSectionWithDetails
  onStudentAdded: () => void
}

function AddStudentPage({ isOpen, onClose, classData, onStudentAdded }: AddStudentPageProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null)

  // 학생 목록 로드
  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiService.getStudents('active')
      if (response.success && response.data) {
        setStudents(response.data)
        setFilteredStudents(response.data)
      } else {
        throw new Error('학생 목록을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      setError('학생 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 등록된 학생 목록 로드
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([])
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(false)

  const loadEnrolledStudents = useCallback(async () => {
    try {
      setIsLoadingEnrolled(true)

      const response = await apiService.getEnrolledStudents(classData.id, activeVersionId || undefined)
      if (response.success && response.data) {
        setEnrolledStudents(response.data)
      } else {
        setEnrolledStudents([])
      }
    } catch (error) {
      setEnrolledStudents([])
    } finally {
      setIsLoadingEnrolled(false)
    }
  }, [classData.id, activeVersionId])

  // 이미 등록된 학생 필터링 (student_timetables를 통해 확인)
  const availableStudents = useMemo(() => {
    // 등록된 학생 ID 목록 생성
    const enrolledStudentIds = new Set(enrolledStudents.map(student => student.id))
    
    // 등록되지 않은 학생들만 반환
    return students.filter(student => !enrolledStudentIds.has(student.id))
  }, [students, enrolledStudents])

  // 검색 필터링
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
    
    if (!value.trim()) {
      setFilteredStudents(availableStudents)
    } else {
      const filtered = availableStudents.filter(student =>
        student.name.toLowerCase().includes(value.toLowerCase()) ||
        student.grade?.toLowerCase().includes(value.toLowerCase()) ||
        student.status?.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredStudents(filtered)
    }
  }, [availableStudents])

  // 학생 선택/해제
  const toggleStudentSelection = useCallback((studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(studentId)) {
        newSet.delete(studentId)
      } else {
        newSet.add(studentId)
      }
      return newSet
    })
  }, [])

  // 전체 선택/해제
  const toggleAllStudents = useCallback(() => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)))
    }
  }, [filteredStudents, selectedStudents.size])

  // 학생 등록
  const handleAddStudents = useCallback(async () => {
    if (selectedStudents.size === 0) {
      setError('등록할 학생을 선택해주세요.')
      return
    }

    try {
      setIsAdding(true)
      setError(null)

      const studentIds = Array.from(selectedStudents)

      // 각 학생을 수업에 등록
      for (const studentId of studentIds) {
        await apiService.addStudentToClass(classData.id, studentId, activeVersionId || undefined)
      }

      setSuccessMessage(`${selectedStudents.size}명의 학생이 성공적으로 등록되었습니다.`)

      // 선택 초기화
      setSelectedStudents(new Set())

      // 등록된 학생 목록 새로고침
      await loadEnrolledStudents()

      // 학생 목록도 새로고침 (등록 가능한 학생 목록 업데이트를 위해)
      await loadStudents()

      // 콜백 호출
      onStudentAdded()

      // 2초 후 성공 메시지 숨김
      setTimeout(() => {
        setSuccessMessage(null)
        onClose()
      }, 2000)

    } catch (error) {
      setError('학생 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsAdding(false)
    }
  }, [selectedStudents, classData.id, onStudentAdded, onClose, loadEnrolledStudents, loadStudents, activeVersionId])

  // 학생 삭제
  const handleRemoveStudent = useCallback(async (studentId: string) => {
    try {
      setIsRemoving(true)
      setError(null)

      // 백엔드 API를 통해 학생을 수업에서 제거
      const response = await apiService.removeStudentFromClass(classData.id, studentId, activeVersionId || undefined)

      if (response.success) {
        // 성공 시 프론트엔드 상태 업데이트
        setSuccessMessage('학생이 수업에서 제거되었습니다.')

        // 등록된 학생 목록과 전체 학생 목록 새로고침
        await loadEnrolledStudents()
        await loadStudents()

        // 2초 후 성공 메시지 숨김
        setTimeout(() => {
          setSuccessMessage(null)
        }, 2000)
      } else {
        throw new Error(response.message || '학생 제거에 실패했습니다.')
      }

    } catch (error) {
      setError('학생 제거에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsRemoving(false)
    }
  }, [classData.id, loadEnrolledStudents, loadStudents, activeVersionId])

  // 활성 버전 로드
  useEffect(() => {
    const loadActiveVersion = async () => {
      try {
        const response = await apiService.getActiveTimetableVersion()
        if (response.success && response.data) {
          setActiveVersionId(response.data.id)
        }
      } catch (error) {
        console.error('활성 버전 조회 실패:', error)
      }
    }

    if (isOpen) {
      loadActiveVersion()
    }
  }, [isOpen])

  // 모달 열릴 때 학생 목록 로드
  useEffect(() => {
    if (isOpen && activeVersionId) {
      loadStudents()
      loadEnrolledStudents()
      setSelectedStudents(new Set())
      setSearchTerm('')
      setError(null)
      setSuccessMessage(null)
    }
  }, [isOpen, activeVersionId, loadStudents, loadEnrolledStudents])

  // 검색어 변경 시 필터링
  useEffect(() => {
    handleSearch(searchTerm)
  }, [searchTerm, handleSearch])

  if (!isOpen) return null

  return (
    <div className="add-student-modal-overlay" onClick={onClose}>
      <div className="add-student-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="add-student-modal-header">
          <h2>학생 등록</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="add-student-modal-body">
          {/* 수업 정보 */}
          <div className="class-info-section">
            <h3>수업 정보</h3>
            <div className="class-info-grid">
              <div className="info-item">
                <span className="label">수업명:</span>
                <span className="value">{classData.name}</span>
              </div>
              <div className="info-item">
                <span className="label">담당 교사:</span>
                <span className="value">{classData.teacher?.name || classData.teacherId}</span>
              </div>
              <div className="info-item">
                <span className="label">강의실:</span>
                <span className="value">{classData.classroom?.name || classData.classroomId}</span>
              </div>
              <div className="info-item">
                <span className="label">현재 학생 수:</span>
                <span className="value">{classData.currentStudents}/{classData.maxStudents}</span>
              </div>
            </div>
          </div>

          {/* 등록된 학생 목록 */}
          <div className="enrolled-students-section">
            <h3>등록된 학생</h3>
            {isLoadingEnrolled ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>등록된 학생 목록을 불러오는 중...</p>
              </div>
            ) : enrolledStudents.length === 0 ? (
              <div className="empty-state">
                <p>등록된 학생이 없습니다.</p>
              </div>
            ) : (
              <div className="enrolled-students-list">
                {enrolledStudents.map(student => (
                  <div key={student.id} className="enrolled-student-item">
                    <div className="enrolled-student-info">
                      <span className="enrolled-student-name">{student.name}</span>
                      <span className="enrolled-student-grade">{student.grade || '학년 미정'}</span>
                      <span className="enrolled-student-status">{student.status || '상태 미정'}</span>
                    </div>
                    <Button
                      onClick={() => handleRemoveStudent(student.id)}
                      variant="danger"
                      size="small"
                      className="remove-student-btn"
                      disabled={isRemoving}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 학생 검색 */}
          <div className="search-section">
            <SearchInput
              placeholder="학생명, 학년, 상태로 검색"
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
              variant="pill"
              showIcon={true}
              size="md"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="error-message">
              <Label variant="error" size="small">{error}</Label>
            </div>
          )}

          {/* 성공 메시지 */}
          {successMessage && (
            <div className="success-message">
              <Label variant="success" size="small">{successMessage}</Label>
            </div>
          )}

          {/* 학생 목록 */}
          <div className="students-section">
            <div className="students-header">
              <h3>등록 가능한 학생</h3>
              <div className="students-count">
                총 {filteredStudents.length}명 중 {selectedStudents.size}명 선택됨
              </div>
            </div>

            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>학생 목록을 불러오는 중...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                {searchTerm ? (
                  <p>검색 결과가 없습니다.</p>
                ) : (
                  <p>등록 가능한 학생이 없습니다.</p>
                )}
              </div>
            ) : (
              <>
                {/* 전체 선택 체크박스 */}
                <div className="select-all-section">
                  <label className="select-all-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                      onChange={toggleAllStudents}
                    />
                    <span className="checkmark"></span>
                    전체 선택
                  </label>
                </div>

                {/* 학생 목록 */}
                <div className="students-list">
                  {filteredStudents.map(student => (
                    <div
                      key={student.id}
                      className={`add-student-item ${selectedStudents.has(student.id) ? 'selected' : ''}`}
                      onClick={() => toggleStudentSelection(student.id)}
                    >
                      <label className="add-student-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                        />
                        <span className="checkmark"></span>
                      </label>

                      <div className="add-student-info">
                        <div className="add-student-name">{student.name}</div>
                        <div className="add-student-details">
                          <span className="add-student-grade">{student.grade || '학년 미정'}</span>
                          <span className="add-student-status">{student.status || '상태 미정'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="add-student-modal-actions">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isAdding}
          >
            취소
          </Button>
          <Button
            onClick={handleAddStudents}
            variant="primary"
            disabled={selectedStudents.size === 0 || isAdding}
          >
            {isAdding ? '등록 중...' : `${selectedStudents.size}명 등록`}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AddStudentPage
