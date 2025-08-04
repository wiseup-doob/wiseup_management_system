import './AttendancePage.css'
import { BaseWidget } from '../../../components/base/BaseWidget'
import { Button } from '../../../components/buttons/Button'
import { Label } from '../../../components/labels/Label'
import { SearchInput } from '../../../components/SearchInput/SearchInput'
import { SeatGrid } from '../../../components/business/attendance/SeatGrid'
import { useAttendance } from '../hooks/useAttendance'
import { getNextAttendanceStatus } from '../../../utils/attendance.utils'
import { apiService, type Student } from '../../../services/api'
import { useEffect, useState } from 'react'
import type { AttendanceStatus } from '../types/attendance.types'

function AttendancePage() {
  const { 
    seats, 
    students,
    searchTerm, 
    updateSeat, 
    updateStudents,
    handleSearchChange 
  } = useAttendance()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(false)

  // Firebase에서 학생 데이터 불러오기
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('=== fetchStudents 시작 ===')
      console.log('API 서비스 호출 중...')
      
      const response = await apiService.getStudents()
      console.log('API 응답 전체:', response)
      console.log('응답 성공 여부:', response.success)
      console.log('응답 데이터:', response.data)
      console.log('응답 데이터 타입:', typeof response.data)
      console.log('응답 데이터 길이:', response.data?.length)
      
      if (response.success && response.data) {
        console.log('Firebase에서 가져온 학생 데이터:', response.data)
        updateStudents(response.data)
        console.log('students 상태 설정 완료')
      } else {
        console.error('API 응답 실패:', response)
        setError(response.message || '학생 데이터를 불러오는데 실패했습니다.')
      }
      
    } catch (err) {
      console.error('fetchStudents 에러:', err)
      setError('학생 데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
      console.log('=== fetchStudents 완료 ===')
    }
  }

  // 학생 데이터 초기화
  const handleInitializeStudents = async () => {
    try {
      setInitializing(true)
      setError(null)
      
      const response = await apiService.initializeStudents()
      
      if (response.success) {
        console.log('학생 데이터 초기화 성공:', response.message)
        // 초기화 후 데이터 다시 불러오기
        await fetchStudents()
      } else {
        setError(response.message || '학생 데이터 초기화에 실패했습니다.')
      }
      
    } catch (err) {
      setError('학생 데이터 초기화 중 오류가 발생했습니다.')
      console.error('Error initializing students:', err)
    } finally {
      setInitializing(false)
    }
  }

  const handleSeatClick = (seatId: string) => {
    console.log(`자리 ${seatId} 클릭`)
    // 출결 상태 토글 (unknown -> present -> absent -> late -> unknown)
    const seat = seats.find(s => s.id === seatId)
    if (seat) {
      const nextStatus = getNextAttendanceStatus(seat.status)
      updateSeat(seatId, nextStatus)
    }
  }

  // 학생 데이터를 좌석 데이터와 매핑
  const getStudentName = (seatId: string): string => {
    // seatId에서 번호 추출 (예: "seat-1" -> 1)
    const seatNumber = parseInt(seatId.replace('seat-', ''), 10)
    
    console.log('=== getStudentName 디버깅 ===')
    console.log('seatId:', seatId)
    console.log('추출된 좌석 번호:', seatNumber, '(타입:', typeof seatNumber, ')')
    console.log('현재 students 배열:', students)
    console.log('students 길이:', students.length)
    
    const student = students.find(s => s.seatNumber === seatNumber)
    console.log('찾은 학생:', student)
    
    const result = student ? student.name : `학생${seatNumber}`
    console.log('최종 결과:', result)
    console.log('========================')
    
    return result
  }

  if (loading) {
    return (
      <BaseWidget className="attendance-page">
        <Label 
          variant="heading" 
          size="large" 
          className="page-title"
        >
          출결 관리
        </Label>
        <BaseWidget className="loading-section">
          <Label 
            variant="default" 
            size="medium" 
            className="loading-text"
          >
            학생 데이터를 불러오는 중...
          </Label>
        </BaseWidget>
      </BaseWidget>
    )
  }

  if (error) {
    return (
      <BaseWidget className="attendance-page">
        <Label 
          variant="heading" 
          size="large" 
          className="page-title"
        >
          출결 관리
        </Label>
        <BaseWidget className="error-section">
          <Label 
            variant="error" 
            size="medium" 
            className="error-text"
          >
            {error}
          </Label>
          <BaseWidget className="error-actions">
            <Button 
              variant="primary" 
              size="medium" 
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              다시 시도
            </Button>
            <Button 
              variant="secondary" 
              size="medium" 
              onClick={handleInitializeStudents}
              disabled={initializing}
              className="initialize-button"
            >
              {initializing ? '초기화 중...' : '학생 데이터 초기화'}
            </Button>
          </BaseWidget>
        </BaseWidget>
      </BaseWidget>
    )
  }

  return (
    <BaseWidget className="attendance-page">
      <Label 
        variant="heading" 
        size="large" 
        className="page-title"
      >
        출결 관리
      </Label>
      
      <BaseWidget className="search-section">
        <SearchInput 
          placeholder="원생을 검색하세요" 
          value={searchTerm}
          onChange={(value) => handleSearchChange(value)}
        />
      </BaseWidget>

      <SeatGrid
        seats={seats}
        getStudentName={getStudentName}
        onSeatClick={handleSeatClick}
        onSeatHover={(seatId: string) => console.log(`자리 ${seatId} 호버`)}
        onSeatFocus={(seatId: string) => console.log(`자리 ${seatId} 포커스`)}
      />
      
      <BaseWidget className="door-indicator">
        <Label 
          variant="default" 
          size="small" 
          className="door-text"
        >
          문
        </Label>
      </BaseWidget>
    </BaseWidget>
  )
}

export default AttendancePage 