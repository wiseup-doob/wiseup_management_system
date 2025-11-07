import type { DownloadOptions, DownloadResult, ImageGenerationOptions } from '../types/download.types'

/**
 * 시간표 이미지 생성 유틸리티
 */
export class TimetableImageGenerator {
  /**
   * HTML 요소를 이미지로 변환
   */
  static async generateTimetableImage(options: ImageGenerationOptions): Promise<DownloadResult> {
    try {
      const { element, options: downloadOptions } = options
      
      // HTML2Canvas 동적 로딩
      const html2canvas = (await import('html2canvas')).default

      // 실제 시간표 콘텐츠 크기를 동적으로 계산
      const actualWidth = Math.max(element.scrollWidth, element.clientWidth)
      const actualHeight = Math.max(element.scrollHeight, element.clientHeight)

      console.log('시간표 실제 크기 측정:', {
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        actualWidth,
        actualHeight
      })

      // 이미지 생성 옵션 설정 (실제 콘텐츠 크기 기준)
      const canvasOptions = {
        allowTaint: true,
        useCORS: true,
        scale: downloadOptions.scale || 1,
        backgroundColor: downloadOptions.backgroundColor || '#ffffff',
        width: actualWidth, // 실제 콘텐츠 너비 (약 700px)
        height: actualHeight, // 실제 콘텐츠 높이 (약 890px)
        scrollX: 0,
        scrollY: 0,
        logging: false, // 로깅 비활성화
        removeContainer: true, // 컨테이너 제거
        foreignObjectRendering: false // 외부 객체 렌더링 비활성화
      }
      
      // HTML2Canvas로 이미지 생성
      const canvas = await html2canvas(element, canvasOptions)
      
      // Canvas를 Blob으로 변환
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              throw new Error('Canvas를 Blob으로 변환할 수 없습니다.')
            }
          },
          downloadOptions.format === 'jpeg' ? 'image/jpeg' : 'image/png',
          downloadOptions.quality || 0.9
        )
      })
      
      // 파일명 생성
      const filename = this.generateFilename(downloadOptions)
      
      // 다운로드 실행
      await this.downloadImage(blob, filename)
      
      return {
        success: true,
        message: '이미지 다운로드가 완료되었습니다.',
        filename,
        fileSize: blob.size
      }
      
    } catch (error) {
      console.error('이미지 생성 중 오류 발생:', error)
      return {
        success: false,
        message: '이미지 생성에 실패했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
  
  /**
   * 이미지 다운로드 실행
   */
  private static async downloadImage(blob: Blob, filename: string): Promise<void> {
    // file-saver 라이브러리 사용 (선택사항)
    try {
      const { saveAs } = await import('file-saver')
      saveAs(blob, filename)
    } catch {
      // file-saver가 없는 경우 기본 다운로드 방식 사용
      this.fallbackDownload(blob, filename)
    }
  }
  
  /**
   * 기본 다운로드 방식 (fallback)
   */
  private static fallbackDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  /**
   * 자동 파일명 생성
   */
  private static generateFilename(options: DownloadOptions): string {
    const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const format = options.format || 'png'
    const scale = options.scale > 1 ? `_${options.scale}x` : ''
    
    // 커스텀 파일명이 있으면 사용, 없으면 기본 형식 사용
    if (options.filename && options.filename.trim()) {
      return `${options.filename.trim()}_${timestamp}${scale}.${format}`
    }
    
    return `timetable_${timestamp}${scale}.${format}`
  }
  
  /**
   * 기본 다운로드 옵션 생성
   */
  static getDefaultOptions(): DownloadOptions {
    return {
      format: 'png',
      quality: 1.0,
      scale: 3, // 1에서 3으로 변경 (프리미엄)
      filename: '',
      includeHeader: true,
      includeTimeColumn: true,
      backgroundColor: '#ffffff'
    }
  }
  
  /**
   * 고품질 다운로드 옵션 생성
   */
  static getHighQualityOptions(): DownloadOptions {
    return {
      format: 'png',
      quality: 1.0,
      scale: 3, // 2에서 3으로 변경 (프리미엄)
      filename: '',
      includeHeader: true,
      includeTimeColumn: true,
      backgroundColor: '#ffffff'
    }
  }
}
