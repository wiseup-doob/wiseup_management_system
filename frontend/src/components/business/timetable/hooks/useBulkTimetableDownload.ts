import { useState, useCallback, useRef } from 'react'
import type { 
  BulkDownloadOptions, 
  BulkDownloadResult, 
  StudentSelection, 
  BulkDownloadProgress,
  BulkImageGenerationOptions 
} from '../types/bulk-download.types'
import { BulkTimetableImageGenerator } from '../utils/bulkTimetableImageGenerator'

/**
 * 전체 시간표 다운로드 훅
 */
export const useBulkTimetableDownload = () => {
  // 기본 상태
  const [selectedStudents, setSelectedStudents] = useState<StudentSelection[]>([])
  const [downloadOptions, setDownloadOptions] = useState<BulkDownloadOptions>(
    BulkTimetableImageGenerator.getDefaultOptions()
  )
  
  // 다운로드 진행 상태
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<BulkDownloadProgress>({
    currentStudent: null,
    completedCount: 0,
    failedCount: 0,
    totalCount: 0,
    progressPercentage: 0,
    isProcessing: false
  })
  
  // 결과 및 오류
  const [lastResult, setLastResult] = useState<BulkDownloadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // 취소 요청 플래그
  const cancelRequestedRef = useRef(false)
  
  /**
   * 학생 선택 상태 변경
   */
  const selectStudent = useCallback((studentId: string, isSelected: boolean) => {
    setSelectedStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, isSelected }
          : student
      )
    )
  }, [])
  
  /**
   * 전체 학생 선택/해제
   */
  const selectAllStudents = useCallback((isSelected: boolean) => {
    setSelectedStudents(prev => 
      prev.map(student => ({ ...student, isSelected }))
    )
  }, [])
  
  /**
   * 학생 목록 설정
   */
  const setStudents = useCallback((students: StudentSelection[]) => {
    setSelectedStudents(students.map(student => ({
      ...student,
      isSelected: false // 기본적으로 선택되지 않음
    })))
  }, [])
  
  /**
   * 다운로드 옵션 업데이트
   */
  const updateDownloadOptions = useCallback((updates: Partial<BulkDownloadOptions>) => {
    setDownloadOptions(prev => ({ ...prev, ...updates }))
  }, [])
  
  /**
   * 기본 옵션으로 재설정
   */
  const resetDownloadOptions = useCallback(() => {
    setDownloadOptions(BulkTimetableImageGenerator.getDefaultOptions())
  }, [])
  
  /**
   * 고품질 옵션으로 설정
   */
  const setHighQualityOptions = useCallback(() => {
    setDownloadOptions(BulkTimetableImageGenerator.getHighQualityOptions())
  }, [])
  
  /**
   * 진행률 업데이트 콜백
   */
  const handleProgress = useCallback((progress: BulkDownloadProgress) => {
    setDownloadProgress(progress)
  }, [])
  
  /**
   * 취소 요청 확인
   */
  const checkCancelRequest = useCallback(() => {
    return cancelRequestedRef.current
  }, [])
  
  /**
   * 일괄 다운로드 시작
   */
  const startBulkDownload = useCallback(async (students?: StudentSelection[]): Promise<BulkDownloadResult> => {
    try {
      // 상태 초기화
      setIsGenerating(true)
      setError(null)
      setLastResult(null)
      cancelRequestedRef.current = false
      
      // 학생 데이터 결정: 매개변수로 전달된 데이터 우선, 없으면 훅 상태 사용
      const targetStudents = students || selectedStudents
      
      // 진행률 초기화
      setDownloadProgress({
        currentStudent: null,
        completedCount: 0,
        failedCount: 0,
        totalCount: targetStudents.filter(s => s.isSelected).length,
        progressPercentage: 0,
        isProcessing: true
      })
      
      // 선택된 학생이 있는지 확인
      const selectedCount = targetStudents.filter(s => s.isSelected).length
      if (selectedCount === 0) {
        throw new Error('선택된 학생이 없습니다.')
      }
      
      // 일괄 이미지 생성 실행
      const result = await BulkTimetableImageGenerator.generateBulkTimetableImages({
        students: targetStudents,
        options: downloadOptions,
        onProgress: handleProgress,
        onCancel: checkCancelRequest
      })
      
      // 결과 저장
      setLastResult(result)
      
      // 자동 다운로드 비활성화 - 호출자가 직접 처리하도록 함
      // if (result.success && result.zipFile) {
      //   await downloadZipFile(result.zipFile, result.zipFilename || '전체학생시간표.zip')
      // }
      
      return result
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      setError(errorMessage)
      
      const errorResult: BulkDownloadResult = {
        success: false,
        message: errorMessage,
        totalStudents: selectedStudents.filter(s => s.isSelected).length,
        successCount: 0,
        failedCount: selectedStudents.filter(s => s.isSelected).length,
        errors: [errorMessage]
      }
      
      setLastResult(errorResult)
      return errorResult
      
    } finally {
      setIsGenerating(false)
      setDownloadProgress(prev => ({ ...prev, isProcessing: false }))
    }
  }, [selectedStudents, downloadOptions, handleProgress, checkCancelRequest])
  
  /**
   * 다운로드 취소
   */
  const cancelDownload = useCallback(() => {
    cancelRequestedRef.current = true
    setIsGenerating(false)
    setDownloadProgress(prev => ({ ...prev, isProcessing: false }))
  }, [])
  
  /**
   * ZIP 파일 다운로드 (내부용, export하지 않음)
   */
  const downloadZipFile = async (blob: Blob, filename: string): Promise<void> => {
    try {
      // file-saver 라이브러리 사용
      const { saveAs } = await import('file-saver')
      saveAs(blob, filename)
    } catch {
      // file-saver가 없는 경우 기본 다운로드 방식 사용
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }
  
  /**
   * 선택된 학생 수 계산
   */
  const selectedCount = selectedStudents.filter(s => s.isSelected).length
  
  /**
   * 전체 학생 수
   */
  const totalCount = selectedStudents.length
  
  /**
   * 모든 학생이 선택되었는지 확인
   */
  const isAllSelected = totalCount > 0 && selectedCount === totalCount
  
  /**
   * 일부만 선택되었는지 확인
   */
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount
  
  return {
    // 상태
    selectedStudents,
    downloadOptions,
    isGenerating,
    downloadProgress,
    lastResult,
    error,
    
    // 계산된 값
    selectedCount,
    totalCount,
    isAllSelected,
    isPartiallySelected,
    
    // 액션
    selectStudent,
    selectAllStudents,
    setStudents,
    updateDownloadOptions,
    resetDownloadOptions,
    setHighQualityOptions,
    startBulkDownload,
    cancelDownload
  }
}
