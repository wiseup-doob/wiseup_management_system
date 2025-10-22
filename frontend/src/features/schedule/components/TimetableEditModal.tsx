import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useDrag } from 'react-dnd'
import type { Student } from '@shared/types'
import type { StudentTimetableResponse } from '../types/timetable.types'
import type { ClassSectionWithDetails } from '../../class/types/class.types'
import { Button } from '../../../components/buttons/Button'
import { Label } from '../../../components/labels/Label'
import { SearchInput } from '../../../components/SearchInput/SearchInput'
import { TimetableWidget } from '../../../components/business/timetable/TimetableWidget'
import { apiService } from '../../../services/api'
import { transformStudentTimetableResponse, checkAllConflicts } from '../utils'
import { useTimetableVersion } from '../../../contexts/TimetableVersionContext'
import './TimetableEditModal.css'

interface TimetableEditModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student | null
  timetableData?: any // SchedulePage에서 전달받은 시간표 데이터
  onSave: () => void
}

// ✅ 30분 단위 고정 시간표 설정
const TIMETABLE_CONFIG = {
  startHour: 9,
  endHour: 23,
  timeInterval: 30
}

// 요일 매핑
const DAY_MAPPING: Record<string, string> = {
  'monday': '월요일',
  'tuesday': '화요일', 
  'wednesday': '수요일',
  'thursday': '목요일',
  'friday': '금요일',
  'saturday': '토요일',
  'sunday': '일요일'
}

// 🎨 Phase 5: 색상 관련 유틸리티 함수들
/**
 * 수업의 색상을 가져오는 함수
 * @param classSection 수업 정보
 * @returns 수업 색상 (DB 저장 색상 우선, 없으면 기본 색상)
 */
const getClassColor = (classSection: ClassSectionWithDetails): string => {
  return classSection.color || '#3498db'
}

/**
 * 색상 정보를 로깅하는 함수
 * @param classSection 수업 정보
 * @param context 컨텍스트 (예: '충돌 검증', '시간표 표시' 등)
 */
const logColorInfo = (classSection: ClassSectionWithDetails, context: string): void => {
  console.log(`🎨 ${context} - 수업 "${classSection.name}" 색상:`, {
    dbColor: classSection.color || '없음',
    finalColor: getClassColor(classSection),
    hasCustomColor: !!classSection.color
  })
}

export const TimetableEditModal: React.FC<TimetableEditModalProps> = ({
  isOpen,
  onClose,
  student,
  timetableData,
  onSave
}) => {
  // 버전 관리
  const { selectedVersion } = useTimetableVersion()

  // 상태 관리
  const [availableClasses, setAvailableClasses] = useState<ClassSectionWithDetails[]>([])
  const [filteredClasses, setFilteredClasses] = useState<ClassSectionWithDetails[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentTimetable, setCurrentTimetable] = useState<any>(null)
  const [originalTimetableData, setOriginalTimetableData] = useState<any>(null) // 원본 백엔드 데이터 저장
  const [localTimetableData, setLocalTimetableData] = useState<any>(null) // 로컬 편집 데이터
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false) // 저장되지 않은 변경사항
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen && student && selectedVersion) {
      loadModalData(student.id)
    }
  }, [isOpen, student, selectedVersion])

  // 모달 데이터 로딩
  const loadModalData = async (studentId: string) => {
    if (!selectedVersion) {
      setError('활성 버전을 찾을 수 없습니다.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`📚 ${student?.name}의 모달 데이터 로드 시작 (버전: ${selectedVersion.displayName})...`)

      // 병렬로 데이터 로드
      const [classesResponse, timetableResponse] = await Promise.all([
        apiService.getClassSectionsWithDetails(), // 상세 정보 포함된 수업 목록 (🎨 색상 포함)
        apiService.getStudentTimetableByVersion(studentId, selectedVersion.id) // 버전별 학생 시간표
      ])
      
      // 수업 목록 설정
      if (classesResponse.success && classesResponse.data) {
        setAvailableClasses(classesResponse.data)
        setFilteredClasses(classesResponse.data) // 초기에는 모든 수업 표시
        console.log('✅ 수업 목록 로드 성공:', classesResponse.data.length, '개')
        
        // 교사명, 강의실명, 색상 디버깅
        console.log('🔍 첫 번째 수업 상세 정보:', {
          name: classesResponse.data[0]?.name,
          teacher: classesResponse.data[0]?.teacher,
          classroom: classesResponse.data[0]?.classroom,
          schedule: classesResponse.data[0]?.schedule,
          color: classesResponse.data[0]?.color // 🎨 DB 저장된 색상 확인
        })
      } else {
        console.warn('⚠️ 수업 목록 로드 실패:', classesResponse.message)
        setAvailableClasses([])
        setFilteredClasses([])
      }
      
      // 학생 시간표 설정
      if (timetableResponse.success && timetableResponse.data) {
        console.log('✅ 학생 시간표 로드 성공:', timetableResponse.data)
        
        // 원본 백엔드 데이터 저장
        setOriginalTimetableData(timetableResponse.data)
        
        // 로컬 편집 데이터 초기화
        setLocalTimetableData(timetableResponse.data)
        
        // useTimetable 훅이 기대하는 구조로 변환
        const timetableForDisplay = {
          classSections: timetableResponse.data.classSections,
          conflicts: [],
          metadata: {
            studentId: timetableResponse.data.studentId,
            studentName: timetableResponse.data.studentName,
            grade: timetableResponse.data.grade,
            status: timetableResponse.data.status
          }
        }
        
        setCurrentTimetable(timetableForDisplay)
      } else {
        // 시간표가 없는 경우 빈 시간표 생성
        console.log('🔍 학생 시간표가 없습니다. 빈 시간표를 생성합니다.')
        
        if (student) {
          const emptyTimetableData = {
            studentId: studentId,
            studentName: student.name,
            grade: student.grade || '',
            status: 'active' as const,
            classSections: []
          }
          
          // 로컬 편집 데이터 초기화
          setLocalTimetableData(emptyTimetableData)
          
          // useTimetable 훅이 기대하는 구조로 변환
          const emptyTimetableForDisplay = {
            classSections: emptyTimetableData.classSections,
            conflicts: [],
            metadata: {
              studentId: emptyTimetableData.studentId,
              studentName: emptyTimetableData.studentName,
              grade: emptyTimetableData.grade,
              status: emptyTimetableData.status
            }
          }
          
          setCurrentTimetable(emptyTimetableForDisplay)
        }
      }
      
    } catch (err) {
      console.error('❌ 모달 데이터 로드 오류:', err)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
      
      // 에러 시에도 빈 시간표는 표시
      if (student) {
        const emptyTimetableData = {
          studentId: student.id,
          studentName: student.name,
          grade: student.grade || '',
          status: 'active' as const,
          classSections: []
        }
        
        // 로컬 편집 데이터 초기화
        setLocalTimetableData(emptyTimetableData)
        
        // useTimetable 훅이 기대하는 구조로 변환
        const emptyTimetableForDisplay = {
          classSections: emptyTimetableData.classSections,
          conflicts: [],
          metadata: {
            studentId: emptyTimetableData.studentId,
            studentName: emptyTimetableData.studentName,
            grade: emptyTimetableData.grade,
            status: emptyTimetableData.status
          }
        }
        setCurrentTimetable(emptyTimetableForDisplay)
      }
      
    } finally {
      setIsLoading(false)
    }
  }

  // 색상 관련 성능 최적화
  const classColorsMap = useMemo(() => {
    const colorsMap = new Map<string, string>()
    availableClasses.forEach(classSection => {
      colorsMap.set(classSection.id, getClassColor(classSection))
    })
    return colorsMap
  }, [availableClasses])

  // 수업 목록 정렬 (추가된 수업을 맨 위로)
  const sortedFilteredClasses = useMemo(() => {
    if (!localTimetableData || !localTimetableData.classSections) {
      return filteredClasses
    }

    // 추가된 수업 ID 목록
    const addedClassIds = new Set(
      localTimetableData.classSections.map((cls: any) => cls.id)
    )

    // 정렬: 추가된 수업(true) → 추가되지 않은 수업(false)
    return [...filteredClasses].sort((a, b) => {
      const aIsAdded = addedClassIds.has(a.id)
      const bIsAdded = addedClassIds.has(b.id)

      // 추가된 수업을 먼저 (true는 1, false는 0으로 변환하여 내림차순 정렬)
      if (aIsAdded && !bIsAdded) return -1
      if (!aIsAdded && bIsAdded) return 1

      // 같은 그룹 내에서는 원래 순서 유지
      return 0
    })
  }, [filteredClasses, localTimetableData])

  // 🎨 Phase 5: 색상 정보 요약 로깅
  useEffect(() => {
    if (availableClasses.length > 0) {
      const colorStats = {
        total: availableClasses.length,
        withCustomColor: availableClasses.filter(cs => cs.color).length,
        withoutColor: availableClasses.filter(cs => !cs.color).length,
        sampleColors: availableClasses.slice(0, 3).map(cs => ({
          name: cs.name,
          color: getClassColor(cs)
        }))
      }
      console.log('🎨 수업 색상 통계:', colorStats)
    }
  }, [availableClasses])

  // 드래그 가능한 수업 카드 컴포넌트
  const DraggableClassCard: React.FC<{ classSection: ClassSectionWithDetails }> = ({ classSection }) => {
    // 이미 시간표에 추가된 수업인지 확인 (로컬 편집 데이터와 직접 비교)
    const isAlreadyAdded = useMemo(() => {
      if (!localTimetableData || !localTimetableData.classSections) {
        console.log(`🔍 ${classSection.name}: localTimetableData가 아직 로드되지 않음`)
        return false
      }
      
      // 로컬 편집 데이터의 classSections에서 직접 ID 비교
      const result = localTimetableData.classSections.some((cls: any) => cls.id === classSection.id)
      
      console.log(`🔍 ${classSection.name}: 이미 추가됨 = ${result} (총 ${localTimetableData.classSections.length}개 수업)`)
      return result
    }, [localTimetableData, classSection.id])

    const [{ isDragging }, drag] = useDrag({
      type: 'class-section',
      item: {
        type: 'class-section',
        classSection,
        id: classSection.id
      },
      canDrag: !isAlreadyAdded, // 이미 추가된 수업은 드래그 불가
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    })

    const dragRef = useRef<HTMLDivElement>(null)
    
    // useEffect로 drag ref 연결 관리
    useEffect(() => {
      if (!isAlreadyAdded && dragRef.current) {
        drag(dragRef.current)
      }
    }, [isAlreadyAdded, drag])

    // 제거 버튼 클릭 핸들러
    const handleRemoveClick = async () => {
      if (!student) return
      
      try {
        console.log(`📚 ${student.name}에서 수업 제거 시작:`, classSection.id)
        
        // 로컬 상태에서만 제거 (DB에는 저장하지 않음)
        const updatedLocalData = {
          ...localTimetableData,
          classSections: localTimetableData.classSections.filter((cls: any) => cls.id !== classSection.id)
        }
        
        setLocalTimetableData(updatedLocalData)
        
        // 시간표 UI 업데이트 - useTimetable 훅이 기대하는 구조로 변환
        const updatedTimetableForDisplay = {
          classSections: updatedLocalData.classSections,
          conflicts: [],
          metadata: {
            studentId: updatedLocalData.studentId,
            studentName: updatedLocalData.studentName,
            grade: updatedLocalData.grade,
            status: updatedLocalData.status
          }
        }
        
        setCurrentTimetable(updatedTimetableForDisplay)
        setError(null)
        setHasUnsavedChanges(true) // 저장되지 않은 변경사항 표시
        
        console.log('🎉 로컬 시간표에서 수업이 제거되었습니다. (저장 버튼을 눌러주세요)')
        
      } catch (err) {
        console.error('❌ 수업 제거 실패:', err)
        setError('수업을 제거하는 중 오류가 발생했습니다.')
      }
    }

    return (
      <div 
        ref={dragRef}
        className={`class-card ${isDragging ? 'dragging' : ''} ${isAlreadyAdded ? 'disabled' : ''}`}
        title={isAlreadyAdded ? '이미 시간표에 추가된 수업입니다' : '드래그하여 시간표에 추가'}
      >
        <div className="class-card-header">
          <Label variant="heading" size="small">{classSection.name}</Label>
          {isAlreadyAdded && (
            <div className="already-added-badge">
              <Label variant="secondary" size="small">추가됨</Label>
            </div>
          )}
        </div>
        <div className="class-card-details">
          <Label variant="secondary" size="small">
            선생님: {classSection.teacher?.name || '미정'}
          </Label>
          <Label variant="secondary" size="small">
            강의실: {classSection.classroom?.name || '미정'}
          </Label>
        </div>
        <div className="class-card-schedules">
          {classSection.schedule && classSection.schedule.length > 0 ? (
            classSection.schedule.map((schedule, index) => {
              const dayName = DAY_MAPPING[schedule.dayOfWeek] || schedule.dayOfWeek
              return (
                <div key={index} className="schedule-item">
                  {dayName} {schedule.startTime}~{schedule.endTime}
                </div>
              )
            })
          ) : (
            <div className="schedule-item no-schedule">시간 미정</div>
          )}
        </div>
        
        {/* 제거 버튼 - 이미 추가된 수업에만 표시 */}
        {isAlreadyAdded && (
          <div className="class-card-actions" onClick={(e) => e.stopPropagation()}>
            <Button
              onClick={handleRemoveClick}
              variant="danger"
              size="small"
              className="remove-button"
            >
              제거
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  // 검색 핸들러
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    
    if (!value.trim()) {
      // 검색어가 없으면 모든 수업 표시
      setFilteredClasses(availableClasses)
    } else {
      // 검색어가 있으면 필터링
      const filtered = availableClasses.filter(classSection => {
        const searchLower = value.toLowerCase()
        return (
          classSection.name.toLowerCase().includes(searchLower) ||
          classSection.teacher?.name?.toLowerCase().includes(searchLower) ||
          classSection.classroom?.name?.toLowerCase().includes(searchLower) ||
          classSection.course?.name?.toLowerCase().includes(searchLower) ||
          classSection.course?.subject?.toLowerCase().includes(searchLower)
        )
      })
      setFilteredClasses(filtered)
    }
  }

  // 수업 추가 함수
  const handleAddClass = async (classSectionId: string) => {
    if (!student) return
    
    try {
      console.log(`📚 ${student.name}에게 수업 추가 시작:`, classSectionId)
      
      // 추가하려는 수업 정보 찾기
      const classToAdd = availableClasses.find(c => c.id === classSectionId)
      if (!classToAdd) {
        setError('수업 정보를 찾을 수 없습니다.')
        return
      }
      
      // 시간 충돌 검증
      if (currentTimetable && currentTimetable.daySchedules) {
        // currentTimetable을 checkAllConflicts가 기대하는 구조로 변환
        const timetableForConflictCheck = {
          classSections: currentTimetable.daySchedules.flatMap((day: any) => day?.classes || [])
        }
        
        // 충돌 검증을 위한 임시 데이터 구조 생성 (ClassSectionWithSchedule 타입에 맞춤)
        const tempClassData = {
          id: classToAdd.id,
          name: classToAdd.name,                          // ✅ 올바른 속성명
          teacher: { name: classToAdd.teacher?.name || '담당 교사 미정' }, // ✅ 올바른 구조
          classroom: { name: classToAdd.classroom?.name || '강의실 미정' }, // ✅ 올바른 구조
          schedule: classToAdd.schedule || [],
          // 🎨 Phase 5: 하드코딩된 색상을 DB 저장 색상으로 변경
          color: getClassColor(classToAdd) // 🚀 유틸리티 함수 사용
        } as any; // 임시로 any 타입 사용하여 호환성 확보
        
        // 🎨 색상 정보 로깅
        logColorInfo(classToAdd, '충돌 검증')
        
        // 충돌 검증 시작
        console.log('🔍 충돌 검증 시작:', timetableForConflictCheck.classSections.length, '개 수업')
        
        const conflictCheck = checkAllConflicts(
          tempClassData,
          [timetableForConflictCheck],
          {
            checkStudent: true,
            checkTeacher: true,
            checkClassroom: true
          }
        )
        
        if (conflictCheck.hasConflict) {
          console.warn('⚠️ 시간 충돌 감지:', conflictCheck.allConflicts)
          
          // 충돌 타입별로 그룹화하여 메시지 생성
          const conflictMessages = []
          
          if (conflictCheck.studentConflicts.length > 0) {
            conflictMessages.push('📚 학생 시간 충돌:')
            conflictCheck.studentConflicts.forEach(conflict => {
              conflictMessages.push(`  • ${conflict.message}`)
            })
          }
          
          if (conflictCheck.teacherConflicts.length > 0) {
            conflictMessages.push('👨‍🏫 교사 시간 충돌:')
            conflictCheck.teacherConflicts.forEach(conflict => {
              conflictMessages.push(`  • ${conflict.message}`)
            })
          }
          
          if (conflictCheck.classroomConflicts.length > 0) {
            conflictMessages.push('🏫 강의실 시간 충돌:')
            conflictCheck.classroomConflicts.forEach(conflict => {
              conflictMessages.push(`  • ${conflict.message}`)
            })
          }
          
          setError(`시간 충돌이 발생했습니다:\n${conflictMessages.join('\n')}`)
          return
        }
      }
      
      // 충돌이 없으면 로컬 상태에만 추가 (DB에는 저장하지 않음)
      console.log('✅ 충돌 검증 완료, 로컬에 수업 추가')
      
      // 로컬 편집 데이터에 수업 추가
      const updatedLocalData = {
        ...localTimetableData,
        classSections: [...localTimetableData.classSections, classToAdd]
      }
      
      setLocalTimetableData(updatedLocalData)
      
      // 시간표 UI 업데이트 - useTimetable 훅이 기대하는 구조로 변환
      const updatedTimetableForDisplay = {
        classSections: updatedLocalData.classSections,
        conflicts: [],
        metadata: {
          studentId: updatedLocalData.studentId,
          studentName: updatedLocalData.studentName,
          grade: updatedLocalData.grade,
          status: updatedLocalData.status
        }
      }
      
      setCurrentTimetable(updatedTimetableForDisplay)
      setError(null)
      setHasUnsavedChanges(true) // 저장되지 않은 변경사항 표시
      
      // 성공 메시지 표시
      console.log('🎉 로컬 시간표가 업데이트되었습니다. (저장 버튼을 눌러주세요)')
      
    } catch (err) {
      console.error('❌ 수업 추가 실패:', err)
      
      // 학생 시간표가 없는 경우 자동 생성 시도
      if (err instanceof Error && err.message.includes('Student timetable not found')) {
        console.log('🆕 학생 시간표가 없습니다. 자동 생성 시도...')
        
        try {
          // 빈 학생 시간표 생성
          const emptyTimetableGrid = transformStudentTimetableResponse(
            {
              studentId: student.id,
              studentName: student.name,
              grade: student.grade || '',
              status: 'active' as const,
              classSections: []
            },
            TIMETABLE_CONFIG.startHour,
            TIMETABLE_CONFIG.endHour,
            TIMETABLE_CONFIG.timeInterval
          )
          
          setCurrentTimetable(emptyTimetableGrid)
          console.log('✅ 빈 학생 시간표 생성 완료')
          
          // 이제 다시 수업 추가 시도 (로컬에만 추가)
          console.log('🔄 수업 추가 재시도 (로컬)...')
          
          // 로컬 편집 데이터에 수업 추가
          const classToAdd = availableClasses.find(c => c.id === classSectionId)
          if (classToAdd) {
            const updatedLocalData = {
              ...localTimetableData,
              classSections: [...localTimetableData.classSections, classToAdd]
            }
            
            setLocalTimetableData(updatedLocalData)
            
            // 시간표 UI 업데이트
            const updatedTimetableGrid = transformStudentTimetableResponse(
              updatedLocalData,
              TIMETABLE_CONFIG.startHour,
              TIMETABLE_CONFIG.endHour,
              TIMETABLE_CONFIG.timeInterval
            )
            
            setCurrentTimetable(updatedTimetableGrid)
            setError(null)
            setHasUnsavedChanges(true)
            console.log('🎉 로컬 시간표가 업데이트되었습니다. (저장 버튼을 눌러주세요)')
            return
          }
          
        } catch (createErr) {
          console.error('❌ 학생 시간표 자동 생성 실패:', createErr)
          setError('학생 시간표를 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.')
          return
        }
      }
      
      // 다른 에러는 기존 방식으로 처리
      let errorMessage = '수업을 추가하는 중 오류가 발생했습니다.'
      
      if (err instanceof Error) {
        if (err.message.includes('Network Error') || err.message.includes('fetch')) {
          errorMessage = '네트워크 연결을 확인해주세요.'
        } else if (err.message.includes('timeout')) {
          errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.'
        } else if (err.message.includes('conflict') || err.message.includes('충돌')) {
          errorMessage = '시간 충돌이 발생했습니다. 다른 시간을 선택해주세요.'
        } else if (err.message.includes('already exists') || err.message.includes('Class section already exists')) {
          errorMessage = '이미 시간표에 추가된 수업입니다. 중복 추가는 불가능합니다.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    }
  }

  // 드롭 이벤트 처리 함수 (자동 배치)
  const handleDrop = async (item: any) => {
    console.log('🎯 드롭 이벤트 처리:', item)
    
    if (item.type === 'class-section' && item.classSection) {
      const classSection = item.classSection
      console.log('📚 드롭된 수업 정보:', {
        id: classSection.id,
        name: classSection.name,
        schedule: classSection.schedule
      })
      
      // 수업 카드의 스케줄 정보 자동 파싱 및 배치
      if (classSection.schedule && classSection.schedule.length > 0) {
        console.log('📅 수업 스케줄 정보 파싱:', classSection.schedule)
        
        // 각 스케줄에 대해 시간 충돌 검증 및 추가
        for (const schedule of classSection.schedule) {
          console.log(`🔍 ${schedule.dayOfWeek} ${schedule.startTime}~${schedule.endTime} 스케줄 처리`)
          
          // 시간 충돌 검증
          if (currentTimetable && currentTimetable.daySchedules) {
            const timetableForConflictCheck = {
              classSections: currentTimetable.daySchedules.flatMap((day: any) => day?.classes || [])
            }
            
            // 충돌 검증을 위한 임시 데이터 구조 생성 (ClassSectionWithSchedule 타입에 맞춤)
            const tempScheduleData = {
              id: classSection.id,
              name: classSection.name,                          // ✅ 올바른 속성명
              teacher: { name: classSection.teacher?.name || '담당 교사 미정' }, // ✅ 올바른 구조
              classroom: { name: classSection.classroom?.name || '강의실 미정' }, // ✅ 올바른 구조
              schedule: [schedule], // 개별 스케줄만 검증
              // 🎨 Phase 5: 하드코딩된 색상을 DB 저장 색상으로 변경
              color: getClassColor(classSection) // 🚀 유틸리티 함수 사용
            } as any; // 임시로 any 타입 사용하여 호환성 확보
            
            // 🎨 색상 정보 로깅
            logColorInfo(classSection, '충돌 검증')
            
            // 충돌 검증 시작
            console.log('🔍 충돌 검증 시작:', timetableForConflictCheck.classSections.length, '개 수업')
            
            const conflictCheck = checkAllConflicts(
              tempScheduleData,
              [timetableForConflictCheck],
              {
                checkStudent: true,
                checkTeacher: true,
                checkClassroom: true
              }
            )
            
            if (conflictCheck.hasConflict) {
              console.warn('⚠️ 시간 충돌 감지:', conflictCheck.allConflicts)
              
              // 충돌 타입별로 그룹화하여 메시지 생성
              const conflictMessages = []
              
              if (conflictCheck.studentConflicts.length > 0) {
                conflictMessages.push('📚 학생 시간 충돌:')
                conflictCheck.studentConflicts.forEach(conflict => {
                  conflictMessages.push(`  • ${conflict.message}`)
                })
              }
              
              if (conflictCheck.teacherConflicts.length > 0) {
                conflictMessages.push('👨‍🏫 교사 시간 충돌:')
                conflictCheck.teacherConflicts.forEach(conflict => {
                  conflictMessages.push(`  • ${conflict.message}`)
                })
              }
              
              if (conflictCheck.classroomConflicts.length > 0) {
                conflictMessages.push('🏫 강의실 시간 충돌:')
                conflictCheck.classroomConflicts.forEach(conflict => {
                  conflictMessages.push(`  • ${conflict.message}`)
                })
              }
              
              setError(`시간 충돌이 발생했습니다:\n${conflictMessages.join('\n')}`)
              return
            }
          }
        }
        
        // 충돌이 없으면 수업 추가
        console.log('✅ 충돌 검증 완료, 수업 추가 진행')
        await handleAddClass(classSection.id)
        
      } else {
        console.log('⚠️ 수업에 스케줄 정보가 없습니다.')
        setError('수업에 스케줄 정보가 없습니다. 먼저 수업 시간을 설정해주세요.')
      }
    }
  }

  // 수업 제거 함수
  const handleRemoveClass = async (classSectionId: string) => {
    if (!student || !selectedVersion) return

    try {
      console.log(`📚 ${student.name}에서 수업 제거 시작 (버전: ${selectedVersion.displayName}):`, classSectionId)

      const response = await apiService.removeClassFromStudentTimetableByVersion(student.id, selectedVersion.id, classSectionId)
      
      if (response.success && response.data) {
        console.log('✅ 수업 제거 성공:', response.data)
        
        // 시간표 데이터 업데이트
        const updatedTimetableGrid = transformStudentTimetableResponse(
          response.data,
          TIMETABLE_CONFIG.startHour,
          TIMETABLE_CONFIG.endHour,
          TIMETABLE_CONFIG.timeInterval
        )
        
        setCurrentTimetable(updatedTimetableGrid)
        setError(null)
        
        // 성공 메시지 표시
        console.log('🎉 시간표가 업데이트되었습니다.')
        // TODO: 성공 토스트 메시지 표시
        
      } else {
        throw new Error(response.message || '수업 제거에 실패했습니다.')
      }
      
    } catch (err) {
      console.error('❌ 수업 제거 실패:', err)
      setError('수업을 제거하는 중 오류가 발생했습니다.')
    }
  }

  const handleSave = async () => {
    if (!student || !selectedVersion || !hasUnsavedChanges) {
      onSave()
      onClose()
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log(`💾 시간표 저장 시작 (버전: ${selectedVersion.displayName})...`)

      // 현재 로컬 데이터를 DB에 저장
      // 기존 수업들을 모두 제거하고 새로 추가
      const currentClassIds = originalTimetableData?.classSections?.map((cls: any) => cls.id) || []
      const newClassIds = localTimetableData?.classSections?.map((cls: any) => cls.id) || []

      // 제거해야 할 수업들
      const classesToRemove = currentClassIds.filter((id: string) => !newClassIds.includes(id))

      // 추가해야 할 수업들
      const classesToAdd = newClassIds.filter((id: string) => !currentClassIds.includes(id))

      console.log('🗑️ 제거할 수업:', classesToRemove)
      console.log('➕ 추가할 수업:', classesToAdd)

      // 수업 제거
      for (const classId of classesToRemove) {
        await apiService.removeClassFromStudentTimetableByVersion(student.id, selectedVersion.id, classId)
        console.log(`✅ 수업 제거 완료: ${classId}`)
      }

      // 수업 추가
      for (const classId of classesToAdd) {
        await apiService.addClassToStudentTimetableByVersion(student.id, selectedVersion.id, classId)
        console.log(`✅ 수업 추가 완료: ${classId}`)
      }
      
      console.log('🎉 모든 변경사항이 DB에 저장되었습니다.')
      setHasUnsavedChanges(false)
      
      // 성공 시 콜백 호출
      onSave()
      onClose()
      
    } catch (err) {
      console.error('❌ 시간표 저장 실패:', err)
      setError('시간표를 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="modal-header">
          <Label variant="heading" size="medium">
            {student ? `${student.name} 시간표 편집` : '시간표 편집'}
          </Label>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
                            {/* 좌측: 수업 카드 목록 */}
                    <div className="class-list-section">
                      <div className="section-header">
                        <Label variant="heading" size="small">
                          수업 목록
                        </Label>
                        <div className="search-container">
                          <SearchInput 
                            placeholder="수업명, 교사, 강의실, 과목으로 검색"
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                            variant="pill"
                            showIcon={true}
                            size="sm"
                          />
                        </div>
                      </div>
                      
                                            <div className="class-cards">
                        {/* 로딩 상태 */}
                        {isLoading && (
                          <div className="loading-state">
                            <Label variant="secondary" size="small">수업 목록을 불러오는 중...</Label>
                          </div>
                        )}
                        
                        {/* 에러 상태 */}
                        {error && !isLoading && (
                          <div className="error-state">
                            <Label variant="secondary" size="small">
                              {error.includes('시간 충돌이 발생했습니다:') ? (
                                <div className="conflict-error">
                                  <div className="conflict-header">
                                    <span className="conflict-icon">⚠️</span>
                                    시간 충돌이 발생했습니다
                                  </div>
                                  <div className="conflict-details">
                                    {error.split('\n').slice(1).map((line, index) => (
                                      <div key={index} className="conflict-item">
                                        <span className="conflict-bullet">•</span>
                                        {line}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="conflict-help">
                                    충돌을 해결하려면 기존 수업을 제거하거나 다른 시간으로 변경해주세요.
                                  </div>
                                </div>
                              ) : (
                                error
                              )}
                            </Label>
                          </div>
                        )}
                        
                        {/* 수업 목록 표시 */}
                        {!isLoading && !error && sortedFilteredClasses.length > 0 && (
                          sortedFilteredClasses.map(classSection => (
                            <DraggableClassCard key={classSection.id} classSection={classSection} />
                          ))
                        )}

                        {/* 검색 결과가 없는 경우 */}
                        {!isLoading && !error && searchTerm && sortedFilteredClasses.length === 0 && (
                          <div className="empty-state">
                            <Label variant="secondary" size="small">
                              "{searchTerm}"에 대한 검색 결과가 없습니다.
                            </Label>
                          </div>
                        )}
                        
                        {/* 수업이 없는 경우 */}
                        {!isLoading && !error && !searchTerm && availableClasses.length === 0 && (
                          <div className="empty-state">
                            <Label variant="secondary" size="small">등록된 수업이 없습니다.</Label>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 우측: 학생 시간표 */}
                    <div className="timetable-section">
                      <div className="section-header">
                        <Label variant="heading" size="small">
                          학생 시간표
                        </Label>
                        <Label variant="secondary" size="small">
                          수업을 드래그하여 배치하세요 (자동으로 올바른 위치에 배치됩니다)
                        </Label>
                      </div>
                      
                      <div className="timetable-container">
                        {/* 시간표 로딩 상태 */}
                        {isLoading && (
                          <div className="timetable-loading">
                            <Label variant="secondary" size="medium">시간표를 불러오는 중...</Label>
                          </div>
                        )}
                        
                        {/* 시간표 표시 (데이터가 없어도 빈 레이아웃 표시) */}
                        {!isLoading && currentTimetable && (
                          <TimetableWidget 
                            data={currentTimetable}
                            className="edit-timetable-widget"
                            startHour={TIMETABLE_CONFIG.startHour}
                            endHour={TIMETABLE_CONFIG.endHour}
                            onDrop={handleDrop}
                          />
                        )}
                      </div>
                    </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <Button 
            onClick={handleCancel}
            variant="secondary"
            size="medium"
          >
            취소
          </Button>
          <Button 
            onClick={handleSave}
            variant="primary"
            size="medium"
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : hasUnsavedChanges ? '저장*' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  )
}
