import { useState, useEffect } from 'react'
import { apiService } from '../../../services/api'
import type { Student, Seat, SeatAssignment } from '@shared/types'
import type { SeatAssignmentResponse } from '../types/attendance.types'

interface UseAttendanceDataReturn {
  loading: boolean
  error: string | null
  dataEmpty: boolean
  fetchData: () => Promise<void>
}

export const useAttendanceData = (
  updateStudents: (students: Student[]) => void,
  updateSeats: (seats: Seat[]) => void,
  updateSeatAssignments: (assignments: SeatAssignmentResponse[]) => void
): UseAttendanceDataReturn => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataEmpty, setDataEmpty] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      setDataEmpty(false)
      
      console.log('=== fetchData 시작 ===')
      
      // 1. 먼저 학생 데이터 가져오기
      console.log('학생 데이터 가져오는 중...')
      const studentsResponse = await apiService.getStudents()
      console.log('학생 데이터 응답:', studentsResponse)
      
      if (studentsResponse.success && studentsResponse.data) {
        console.log('Firebase에서 가져온 학생 데이터:', studentsResponse.data)
        updateStudents(studentsResponse.data)
        
        if (studentsResponse.data.length === 0) {
          setDataEmpty(true)
          console.log('학생 데이터가 없습니다.')
          return
        }
      } else {
        console.error('학생 데이터 API 응답 실패:', studentsResponse)
        setError(studentsResponse.message || '학생 데이터를 불러오는데 실패했습니다.')
        return
      }
      
      // 2. 좌석 테이블 가져오기 (레이아웃 렌더링 기준)
      console.log('좌석 데이터 가져오는 중...')
      const seatsResponse = await apiService.getSeats()
      console.log('좌석 데이터 응답:', seatsResponse)
      if (seatsResponse.success && seatsResponse.data) {
        // 활성 좌석만 필터링하고 필요한 속성 추가 (seat_4는 강제로 활성화)
        const activeSeats = seatsResponse.data
          .filter((seat: any) => seat.isActive !== false || seat.id === 'seat_4') // seat_4는 강제로 포함
          .map((seat: any) => ({
            ...seat,
            isActive: true, // 모든 좌석을 활성으로 설정
            row: Math.floor((seat.seatNumber - 1) / 8) + 1,
            col: ((seat.seatNumber - 1) % 8) + 1,
            // SeatStatus를 AttendanceStatus로 변환
            status: seat.status === 'occupied' ? 'present' : 'dismissed'
          }))
        
        console.log('활성 좌석 데이터:', activeSeats)
        updateSeats(activeSeats)
      } else {
        console.warn('좌석 데이터 API 응답 실패:', seatsResponse)
        updateSeats([])
      }

      // 3. 그 다음 좌석 배정 데이터 가져오기
      console.log('좌석 배정 데이터 가져오는 중...')
      const assignmentsResponse = await apiService.getSeatAssignments()
      console.log('좌석 배정 데이터 응답:', assignmentsResponse)
      
      if (assignmentsResponse.success && assignmentsResponse.data) {
        console.log('Firebase에서 가져온 좌석 배정 데이터:', assignmentsResponse.data)
        
        // 학생 데이터를 Map으로 변환하여 빠른 조회 가능하게 함
        const studentsMap = new Map(
          studentsResponse.data.map(student => [student.id, student])
        )
        
        console.log('학생 Map 생성 완료:', studentsMap.size, '명')
        console.log('학생 Map 샘플:', Array.from(studentsMap.entries()).slice(0, 3))
        
        // 좌석별 최신 활성 배정만 남기기 (assignment.status === 'active')
        const sorted = [...assignmentsResponse.data as any[]].sort((a: any, b: any) => {
          const at = new Date(a.updatedAt || a.createdAt || a.assignedDate || 0).getTime()
          const bt = new Date(b.updatedAt || b.createdAt || b.assignedDate || 0).getTime()
          return bt - at
        })
        const latestActiveBySeat = new Map<string, any>()
        for (const asg of sorted) {
          // assignment의 status 필드를 직접 사용 (active 상태인 배정만)
          if (asg.status === 'active') {
            if (!latestActiveBySeat.has(asg.seatId)) {
              latestActiveBySeat.set(asg.seatId, asg)
            }
          }
        }
        const activeAssignments = Array.from(latestActiveBySeat.values())
        
        console.log('활성 좌석 배정:', activeAssignments.length, '개')
        
        // 좌석 배정 데이터를 프론트엔드 형식으로 변환
        const formattedAssignments: SeatAssignmentResponse[] = activeAssignments.map((assignment: any) => {
          const student = studentsMap.get(assignment.studentId)
          const studentName = student ? student.name : '미배정'
          const currentAttendance = assignment.status || 'dismissed'
          
          console.log(`좌석 ${assignment.seatId}: 학생 ${assignment.studentId} -> ${studentName} (찾음: ${!!student}, 현재상태: ${currentAttendance})`)
          
          return {
            ...assignment,
            studentName,
            currentAttendance
          }
        })
        
        console.log('변환된 좌석 배정 데이터:', formattedAssignments)
        updateSeatAssignments(formattedAssignments)
        
        // 4. 출석 데이터 가져와서 좌석 상태 업데이트
        console.log('출석 데이터 가져오는 중...')
        try {
          const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식
          console.log('📅 오늘 날짜:', today)
          console.log('🔍 출석 데이터 요청 파라미터:', { date: today })
          const attendanceResponse = await apiService.getAttendanceRecords({ date: today })
          console.log('📊 출석 데이터 응답:', attendanceResponse)
          
                      if (attendanceResponse.success && attendanceResponse.data) {
              console.log('✅ 출석 데이터 성공적으로 가져옴')
              console.log('📋 출석 데이터 샘플:', attendanceResponse.data.slice(0, 3))
              
              // 출석 데이터를 Map으로 변환 (studentId -> attendanceStatus)
              const attendanceMap = new Map<string, string>()
              attendanceResponse.data.forEach((record: any) => {
                if (record.studentId && record.status) {
                  attendanceMap.set(record.studentId, record.status)
                }
              })
              
              console.log('🗺️ 출석 Map 생성 완료:', attendanceMap.size, '개')
              console.log('🗺️ 출석 Map 샘플:', Array.from(attendanceMap.entries()).slice(0, 3))
            
            // 좌석 데이터에 출석 상태 반영
            const updatedSeats = (seatsResponse.data || []).map((seat: any) => {
              // 해당 좌석의 배정된 학생 찾기
              const assignment = formattedAssignments.find(a => a.seatId === seat.id)
              if (assignment && assignment.studentId) {
                // 출석 데이터에서 학생의 상태 찾기
                const attendanceStatus = attendanceMap.get(assignment.studentId)
                if (attendanceStatus) {
                  return {
                    ...seat,
                    isActive: true,
                    row: Math.floor((seat.seatNumber - 1) / 8) + 1,
                    col: ((seat.seatNumber - 1) % 8) + 1,
                    status: attendanceStatus // 실제 출석 상태로 설정
                  }
                }
              }
              // 출석 데이터가 없으면 기본값
              return {
                ...seat,
                isActive: true,
                row: Math.floor((seat.seatNumber - 1) / 8) + 1,
                col: ((seat.seatNumber - 1) % 8) + 1,
                status: 'dismissed' // 기본값
              }
            })
            
            console.log('출석 상태가 반영된 좌석 데이터:', updatedSeats)
            updateSeats(updatedSeats)
          }
        } catch (attendanceError) {
          console.warn('출석 데이터 가져오기 실패:', attendanceError)
          // 출석 데이터 실패해도 좌석 배정은 표시
        }
      } else {
        console.warn('좌석 배정 데이터 API 응답 실패:', assignmentsResponse)
        updateSeatAssignments([])
      }
      
      console.log('=== fetchData 완료 ===')
    } catch (error) {
      console.error('데이터 가져오기 중 오류 발생:', error)
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    loading,
    error,
    dataEmpty,
    fetchData
  }
}
