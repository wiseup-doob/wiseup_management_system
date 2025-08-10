import { useState } from 'react'
import { apiService } from '../../../services/api'
import type { AttendanceStatus } from '@shared/types/common.types'
import type { Student } from '@shared/types'

interface UseAttendanceActionsReturn {
  error: string | null
  setError: (error: string | null) => void
  assignSeat: (seatId: string, studentId: string) => Promise<void>
  clearSeat: (seatId: string) => Promise<void>
  swapSeats: (aSeatId: string, bSeatId: string) => Promise<void>
  handleAttendanceChange: (
    selectedStudent: Student,
    status: AttendanceStatus,
    onSuccess: () => void
  ) => Promise<void>
  getStudentName: (seatId: string, seatAssignments: any[], students: any[]) => string
}

export const useAttendanceActions = (
  fetchData: () => Promise<void>,
  updateStudentAttendanceStatus: (studentId: string, status: AttendanceStatus) => void
): UseAttendanceActionsReturn => {
  const [error, setError] = useState<string | null>(null)

  const assignSeat = async (seatId: string, studentId: string) => {
    try {
      // 현재 좌석 점유자와 지정 학생의 현재 좌석 파악
      const currentOccupant = await apiService.getSeatAssignmentBySeatId(seatId)
      const studentCurrent = await apiService.getSeatAssignmentByStudentId(studentId)

      // 이미 같은 학생이 그 좌석에 있는 경우: 아무 것도 하지 않음
      if (currentOccupant.success && currentOccupant.data && 
          (currentOccupant.data as any).studentId === studentId) {
        return
      }

      // 대상 좌석이 점유되어 있고, 지정 학생도 다른 좌석을 점유 중이면 교체
      if (currentOccupant.success && currentOccupant.data && 
          studentCurrent.success && studentCurrent.data && (studentCurrent.data as any).seatId) {
        await swapSeats((studentCurrent.data as any).seatId, seatId)
        return
      }

      // 대상 좌석이 점유되어 있고, 지정 학생은 미배정이면 먼저 해제 후 배정
      if (currentOccupant.success && currentOccupant.data) {
        await clearSeat(seatId)
      }

      const res = await apiService.assignStudentToSeat(studentId, seatId)
      if (!res.success) throw new Error(res.message)
      await fetchData()
    } catch (e) {
      console.error('배정 실패', e)
      setError('좌석 배정에 실패했습니다.')
    }
  }

  const clearSeat = async (seatId: string) => {
    try {
      console.log('🚀 === 좌석 배정 해제 시작 ===');
      console.log('📍 입력 파라미터:', { seatId });
      
      // 최신 배정 정보를 서버에서 조회하여 정확한 studentId를 사용
      console.log('📋 1단계: 좌석 배정 정보 조회 시작');
      console.log('🔗 API 호출: getSeatAssignmentBySeatId');
      
      const current = await apiService.getSeatAssignmentBySeatId(seatId);
      console.log('📊 1단계 결과:', {
        success: current.success,
        data: current.data,
        error: current.error,
        message: current.message,
        meta: current.meta
      });
      
      const stId = current.success && current.data ? (current.data as any).studentId : undefined;
      console.log('👤 추출된 학생 ID:', {
        studentId: stId,
        type: typeof stId,
        isValid: stId && stId !== '',
        originalData: current.data
      });
      
      if (!stId || stId === '') {
        console.warn('⚠️ 학생 ID가 유효하지 않음:', { stId, seatId });
        console.log('ℹ️ 빈 좌석이거나 이미 해제된 상태일 수 있습니다.');
        // 빈 좌석인 경우 성공으로 처리
        await fetchData();
        return;
      }
      
      console.log('📋 2단계: 좌석 배정 해제 API 호출 시작');
      console.log('🔗 API 호출: unassignStudentFromSeat');
      console.log('📤 요청 데이터:', { studentId: stId, seatId });
      
      const res = await apiService.unassignStudentFromSeat(stId, seatId);
      console.log('📊 2단계 결과:', {
        success: res.success,
        data: res.data,
        error: res.error,
        message: res.message,
        meta: res.meta,
        // 전체 응답 객체 상세 분석
        fullResponse: JSON.stringify(res, null, 2),
        responseKeys: Object.keys(res),
        responseType: typeof res,
        responseConstructor: res?.constructor?.name,
        // 응답 객체의 모든 속성 값 확인
        allProperties: Object.entries(res).reduce((acc, [key, value]) => {
          acc[key] = {
            value: value,
            type: typeof value,
            isNull: value === null,
            isUndefined: value === undefined,
            constructor: value?.constructor?.name
          };
          return acc;
        }, {} as any)
      });
      
      if (!res.success) {
        console.error('❌ 좌석 배정 해제 API 실패:', res);
        throw new Error(res.message || '좌석 배정 해제에 실패했습니다.');
      }
      
      console.log('✅ 좌석 배정 해제 성공!');
      console.log('🔄 데이터 새로고침 시작');
      
      await fetchData();
      console.log('✅ 데이터 새로고침 완료');
      console.log('🎉 === 좌석 배정 해제 완료 ===');
      
    } catch (e) {
      console.error('💥 === 좌석 배정 해제 오류 발생 ===');
      console.error('❌ 에러 객체:', e);
      console.error('❌ 에러 타입:', typeof e);
      console.error('❌ 에러 메시지:', e instanceof Error ? e.message : String(e));
      console.error('❌ 에러 스택:', e instanceof Error ? e.stack : '스택 정보 없음');
      console.error('❌ 에러 상세:', {
        name: e instanceof Error ? e.name : 'Error',
        constructor: e?.constructor?.name,
        prototype: Object.getPrototypeOf(e)?.constructor?.name
      });
      
      // API 응답 에러인 경우 추가 정보 로깅
      if (e && typeof e === 'object' && 'response' in e) {
        console.error('🌐 API 응답 에러 상세:', {
          status: (e as any).response?.status,
          statusText: (e as any).response?.statusText,
          headers: (e as any).response?.headers,
          data: (e as any).response?.data
        });
      }
      
      // 네트워크 에러인 경우 추가 정보 로깅
      if (e instanceof TypeError && e.message.includes('fetch')) {
        console.error('🌐 네트워크 에러 상세:', {
          message: e.message,
          cause: (e as any).cause
        });
      }
      
      setError('좌석 배정 해제에 실패했습니다.');
      console.error('💥 === 좌석 배정 해제 오류 로깅 완료 ===');
    }
  }

  const swapSeats = async (aSeatId: string, bSeatId: string) => {
    try {
      // 좌석 번호/행/열을 스왑하여 시각적 위치를 교환
      const res = await apiService.swapSeatPositions(aSeatId, bSeatId)
      if (!res.success) throw new Error(res.message)
      await fetchData()
    } catch (e) {
      console.error('교체 실패', e)
      setError('좌석 교환(번호 스왑)에 실패했습니다.')
    }
  }

  const handleAttendanceChange = async (
    selectedStudent: Student,
    status: AttendanceStatus,
    onSuccess: () => void
  ) => {
    try {
      console.log('=== 출결 상태 변경 시작 ===')
      console.log('선택된 학생:', selectedStudent)
      
      // 실제로 사용할 학생 ID 결정
      const actualStudentId = (selectedStudent as any).actualId || selectedStudent.id
      console.log('학생 ID 타입:', typeof actualStudentId)
      console.log('학생 ID 값:', actualStudentId)
      console.log('변경할 상태:', status)
      
      // 현재 시간 정보
      const now = new Date()
      const checkInTime = status === 'present' ? now.toTimeString().split(' ')[0] : undefined
      const checkOutTime = status === 'dismissed' ? now.toTimeString().split(' ')[0] : undefined
      
      console.log('API 호출 준비:', {
        studentId: actualStudentId,
        status,
        checkInTime,
        checkOutTime
      })
      
      // API 호출하여 학생 출결 상태 업데이트
      const response = await apiService.updateStudentAttendance(
        actualStudentId,
        status,
        checkInTime,
        checkOutTime,
        '교실',
        `상태 변경: ${status}`
      )
      
      console.log('API 응답:', response)
      
      if (response.success) {
        console.log('✅ API 출결 상태 업데이트 성공')
        
        // Redux 상태 업데이트
        updateStudentAttendanceStatus(actualStudentId, status)
        
        // 성공 콜백 실행
        onSuccess()
        
        console.log(`✅ 학생 ${selectedStudent.name}의 출결 상태가 성공적으로 ${status}로 변경되었습니다.`)
        console.log(`시간 정보: 등원 ${checkInTime}, 하원 ${checkOutTime}`)
        console.log('✅ 출결 상태가 실시간으로 업데이트되었습니다!')
      } else {
        console.error('❌ API 출결 상태 업데이트 실패:', response.message)
        setError(response.message || '출결 상태 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 출결 상태 변경 중 오류가 발생했습니다:', error)
      setError('출결 상태 변경 중 오류가 발생했습니다.')
    }
  }

  const getStudentName = (seatId: string, seatAssignments: any[], students: any[]): string => {
    // 좌석 배정에서 해당 좌석의 학생 찾기
    const assignment = seatAssignments.find(a => a.seatId === seatId)
    if (assignment && assignment.studentId) {
      // 학생 ID로 학생 정보 찾기
      const student = students.find(s => s.id === assignment.studentId)
      if (student && student.name) {
        return student.name
      }
      // assignment에 직접 studentName이 있는 경우
      if (assignment.studentName) {
        return assignment.studentName
      }
    }
    
    // 좌석이 비어있는 경우
    return ''
  }

  return {
    error,
    setError,
    assignSeat,
    clearSeat,
    swapSeats,
    handleAttendanceChange,
    getStudentName
  }
}
