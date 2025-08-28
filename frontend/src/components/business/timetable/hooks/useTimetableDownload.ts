import { useState, useCallback, useRef } from 'react'
import type { DownloadOptions, DownloadResult, DownloadProgress } from '../types/download.types'
import { TimetableImageGenerator } from '../utils/timetableImageGenerator'

/**
 * 시간표 다운로드 기능을 관리하는 훅
 */
export const useTimetableDownload = () => {
  // 상태 관리
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    stage: 'preparing',
    progress: 0,
    message: '준비 중...'
  })
  const [downloadOptions, setDownloadOptions] = useState<DownloadOptions>(
    TimetableImageGenerator.getDefaultOptions()
  )
  const [lastResult, setLastResult] = useState<DownloadResult | null>(null)
  
  // DOM 요소 참조
  const targetElementRef = useRef<HTMLElement | null>(null)
  
  /**
   * 다운로드 옵션 업데이트
   */
  const updateDownloadOptions = useCallback((newOptions: Partial<DownloadOptions>) => {
    setDownloadOptions(prev => ({
      ...prev,
      ...newOptions
    }))
  }, [])
  
  /**
   * 다운로드 옵션을 기본값으로 리셋
   */
  const resetDownloadOptions = useCallback(() => {
    setDownloadOptions(TimetableImageGenerator.getDefaultOptions())
  }, [])
  
  /**
   * 고품질 옵션으로 설정
   */
  const setHighQualityOptions = useCallback(() => {
    setDownloadOptions(TimetableImageGenerator.getHighQualityOptions())
  }, [])
  
  /**
   * 진행 상태 업데이트
   */
  const updateProgress = useCallback((stage: DownloadProgress['stage'], progress: number, message: string) => {
    setDownloadProgress({
      stage,
      progress,
      message
    })
  }, [])
  
  /**
   * 시간표 이미지 다운로드 실행
   */
  const downloadTimetable = useCallback(async (element?: HTMLElement) => {
    try {
      // 다운로드할 요소 결정
      const targetElement = element || targetElementRef.current
      if (!targetElement) {
        throw new Error('다운로드할 요소를 찾을 수 없습니다.')
      }
      
      // 상태 초기화
      setIsGenerating(true)
      setLastResult(null)
      updateProgress('preparing', 0, '다운로드 준비 중...')
      
      // 진행률 시뮬레이션 (실제로는 HTML2Canvas 진행 상황을 추적할 수 없음)
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev.stage === 'preparing' && prev.progress < 30) {
            return { ...prev, progress: prev.progress + 10 }
          } else if (prev.stage === 'preparing' && prev.progress >= 30) {
            return { stage: 'generating', progress: 30, message: '이미지 생성 중...' }
          } else if (prev.stage === 'generating' && prev.progress < 80) {
            return { ...prev, progress: prev.progress + 15 }
          } else if (prev.stage === 'generating' && prev.progress >= 80) {
            return { stage: 'downloading', progress: 80, message: '다운로드 중...' }
          } else if (prev.stage === 'downloading' && prev.progress < 100) {
            return { ...prev, progress: prev.progress + 10 }
          }
          return prev
        })
      }, 200)
      
      // 이미지 생성 및 다운로드
      updateProgress('generating', 30, '이미지 생성 중...')
      
      const result = await TimetableImageGenerator.generateTimetableImage({
        element: targetElement,
        options: downloadOptions
      })
      
      // 진행률 완료
      clearInterval(progressInterval)
      updateProgress('complete', 100, '완료!')
      
      // 결과 저장
      setLastResult(result)
      
      if (result.success) {
        // 성공 시 잠시 후 상태 초기화
        setTimeout(() => {
          setIsGenerating(false)
          setDownloadProgress({
            stage: 'preparing',
            progress: 0,
            message: '준비 중...'
          })
        }, 2000)
      } else {
        // 실패 시 즉시 상태 초기화
        setIsGenerating(false)
        setDownloadProgress({
          stage: 'preparing',
          progress: 0,
          message: '준비 중...'
        })
      }
      
      return result
      
    } catch (error) {
      console.error('다운로드 중 오류 발생:', error)
      
      const errorResult: DownloadResult = {
        success: false,
        message: '다운로드 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }
      
      setLastResult(errorResult)
      setIsGenerating(false)
      setDownloadProgress({
        stage: 'preparing',
        progress: 0,
        message: '준비 중...'
      })
      
      return errorResult
    }
  }, [downloadOptions, updateProgress])
  
  /**
   * 다운로드 취소
   */
  const cancelDownload = useCallback(() => {
    setIsGenerating(false)
    setDownloadProgress({
      stage: 'preparing',
      progress: 0,
      message: '준비 중...'
    })
  }, [])
  
  /**
   * 타겟 요소 설정
   */
  const setTargetElement = useCallback((element: HTMLElement | null) => {
    targetElementRef.current = element
  }, [])
  
  return {
    // 상태
    isGenerating,
    downloadProgress,
    downloadOptions,
    lastResult,
    
    // 액션
    downloadTimetable,
    updateDownloadOptions,
    resetDownloadOptions,
    setHighQualityOptions,
    cancelDownload,
    setTargetElement
  }
}
