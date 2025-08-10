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
        updateSeats(seatsResponse.data as any)
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
        
        // 좌석별 최신 활성 배정만 남기기 (status === 'present')
        const sorted = [...assignmentsResponse.data as any[]].sort((a: any, b: any) => {
          const at = new Date(a.updatedAt || a.createdAt || a.assignedDate || 0).getTime()
          const bt = new Date(b.updatedAt || b.createdAt || b.assignedDate || 0).getTime()
          return bt - at
        })
        const latestActiveBySeat = new Map<string, any>()
        for (const asg of sorted) {
          if (asg.status !== 'present') continue
          if (!latestActiveBySeat.has(asg.seatId)) {
            latestActiveBySeat.set(asg.seatId, asg)
          }
        }
        const activeAssignments = Array.from(latestActiveBySeat.values())
        
        console.log('활성 좌석 배정:', activeAssignments.length, '개')
        
        // 좌석 배정 데이터를 프론트엔드 형식으로 변환
        const formattedAssignments: SeatAssignmentResponse[] = activeAssignments.map((assignment: any) => {
          const student = studentsMap.get(assignment.studentId)
          const studentName = student ? student.name : '미배정'
          const currentAttendance = student?.currentStatus?.currentAttendance || 'dismissed'
          
          console.log(`좌석 ${assignment.seatId}: 학생 ${assignment.studentId} -> ${studentName} (찾음: ${!!student}, 현재상태: ${currentAttendance})`)
          
          return {
            id: assignment.id,
            seatId: assignment.seatId,
            studentId: assignment.studentId,
            studentName: studentName,
            assignedDate: assignment.assignedDate,
            status: assignment.status,
            currentAttendance: currentAttendance,
            notes: assignment.notes,
            createdAt: assignment.createdAt,
            updatedAt: assignment.updatedAt
          }
        })
        
        console.log('변환된 좌석 배정 데이터:', formattedAssignments.length, '개')
        updateSeatAssignments(formattedAssignments)
        
        // 좌석 데이터에 현재 배정 정보 추가 (studentId는 seat_assignments에서 계산)
        const seatsWithAssignments = (seatsResponse.data || []).map((seat: any) => {
          const currentAssignment = latestActiveBySeat.get(seat.seatId)
          const student = currentAssignment ? studentsMap.get(currentAssignment.studentId) : null
          return {
            ...seat,
            // ❌ studentId 필드 제거 - seat_assignments에서 계산
            currentAssignment: currentAssignment ? {
              studentId: currentAssignment.studentId,
              studentName: student ? student.name : '미배정',
              status: currentAssignment.status,
              assignedDate: currentAssignment.assignedDate
            } : null
          }
        })
        
        console.log('좌석 데이터에 배정 정보 추가 완료:', seatsWithAssignments.length, '개')
        updateSeats(seatsWithAssignments)
        
      } else {
        console.error('좌석 배정 데이터 API 응답 실패:', assignmentsResponse)
        updateSeatAssignments([])
        updateSeats(seatsResponse.data || [])
      }
      
    } catch (err) {
      console.error('fetchData 에러:', err)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
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
