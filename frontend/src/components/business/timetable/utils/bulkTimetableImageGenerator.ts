import type { 
  BulkDownloadOptions, 
  BulkDownloadResult, 
  StudentSelection, 
  BulkDownloadProgress,
  BulkImageGenerationOptions 
} from '../types/bulk-download.types'

/**
 * 전체 시간표 이미지 생성 유틸리티
 */
export class BulkTimetableImageGenerator {
  /**
   * 여러 학생의 시간표를 일괄 처리하여 ZIP 파일 생성
   */
  static async generateBulkTimetableImages(options: BulkImageGenerationOptions): Promise<BulkDownloadResult> {
    try {
      const { students, options: downloadOptions, onProgress, onCancel } = options
      
      // 선택된 학생만 필터링
      const selectedStudents = students.filter(student => student.isSelected)
      
      if (selectedStudents.length === 0) {
        return {
          success: false,
          message: '선택된 학생이 없습니다.',
          totalStudents: 0,
          successCount: 0,
          failedCount: 0,
          errors: ['선택된 학생이 없습니다.']
        }
      }

      // JSZip 라이브러리 동적 로딩
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      const results: { student: StudentSelection; success: boolean; error?: string }[] = []
      let completedCount = 0
      let failedCount = 0
      const errors: string[] = []

      // 각 학생의 시간표를 순차적으로 처리
      for (let i = 0; i < selectedStudents.length; i++) {
        const student = selectedStudents[i]
        
        // 취소 요청 확인
        if (onCancel && onCancel()) {
          return {
            success: false,
            message: '사용자에 의해 취소되었습니다.',
            totalStudents: selectedStudents.length,
            successCount: completedCount,
            failedCount: failedCount,
            errors: [...errors, '사용자에 의해 취소되었습니다.']
          }
        }

        try {
          // 진행률 업데이트
          if (onProgress) {
            const progress: BulkDownloadProgress = {
              currentStudent: student,
              completedCount,
              failedCount,
              totalCount: selectedStudents.length,
              progressPercentage: Math.round(((i + 1) / selectedStudents.length) * 100),
              isProcessing: true
            }
            onProgress(progress)
          }

          // 학생별 시간표 이미지 생성
          const imageBlob = await this.generateStudentTimetableImage(student, downloadOptions)
          
          if (imageBlob) {
            // ZIP에 파일 추가
            const filename = this.generateStudentFilename(student, downloadOptions)
            zip.file(filename, imageBlob)
            results.push({ student, success: true })
            completedCount++
          } else {
            throw new Error('이미지 생성에 실패했습니다.')
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
          results.push({ student, success: false, error: errorMessage })
          errors.push(`${student.name}: ${errorMessage}`)
          failedCount++
        }

        // 메모리 부하 방지를 위한 짧은 대기
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // ZIP 파일 생성
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })

      // 최종 결과 반환
      const success = completedCount > 0
      const message = success 
        ? `${completedCount}명의 학생 시간표가 성공적으로 다운로드되었습니다.`
        : '모든 학생의 시간표 생성에 실패했습니다.'

      return {
        success,
        message,
        totalStudents: selectedStudents.length,
        successCount: completedCount,
        failedCount,
        errors,
        zipFile: zipBlob,
        zipFilename: this.generateZipFilename(downloadOptions)
      }

    } catch (error) {
      console.error('일괄 이미지 생성 중 오류 발생:', error)
      return {
        success: false,
        message: '일괄 이미지 생성에 실패했습니다.',
        totalStudents: 0,
        successCount: 0,
        failedCount: 0,
        errors: [error instanceof Error ? error.message : '알 수 없는 오류']
      }
    }
  }

  /**
   * 개별 학생의 시간표 이미지 생성
   */
  private static async generateStudentTimetableImage(
    student: StudentSelection, 
    options: BulkDownloadOptions
  ): Promise<Blob | null> {
    try {
      // html2canvas 라이브러리 동적 로딩
      const html2canvas = (await import('html2canvas')).default
      
      // 가상 DOM에 시간표 렌더링
      const virtualTimetableElement = await this.createVirtualTimetable(student, options)
      
      if (!virtualTimetableElement) {
        throw new Error(`학생 ${student.name}의 가상 시간표를 생성할 수 없습니다.`)
      }

      // 이미지 생성 옵션
      const canvasOptions = {
        allowTaint: true,
        useCORS: true,
        scale: options.scale || 1,
        backgroundColor: options.backgroundColor || '#ffffff',
        width: 740,
        height: 892,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 740,
        windowHeight: 892,
        logging: true, // 디버깅을 위해 로깅 활성화
        removeContainer: false, // 컨테이너 제거 비활성화
        foreignObjectRendering: false,
        ignoreElements: (element: Element) => {
          // 특정 요소들을 무시하여 렌더링 안정성 향상
          const htmlElement = element as HTMLElement
          return element.classList.contains('hidden') || 
                 htmlElement.style.display === 'none' ||
                 htmlElement.style.visibility === 'hidden'
        }
      }

      // HTML2Canvas로 이미지 생성 - 요소를 직접 찾아서 캡처
      let timetableElement = virtualTimetableElement.querySelector('.timetable-widget') as HTMLElement
      
      if (!timetableElement) {
        console.warn('⚠️ .timetable-widget을 찾을 수 없어서 전체 요소를 사용합니다')
        timetableElement = virtualTimetableElement
      }
      
      console.log('🎯 html2canvas에 전달할 요소:', {
        element: timetableElement,
        className: timetableElement.className,
        tagName: timetableElement.tagName,
        children: timetableElement.children.length
      })
      
      console.log('🚀 html2canvas 시작...')
      const canvas = await html2canvas(timetableElement, canvasOptions)
      console.log('✅ html2canvas 완료:', canvas)
      
      // Canvas를 Blob으로 변환
      console.log('🔄 Canvas를 Blob으로 변환 중...')
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => {
            console.log('✅ Blob 변환 완료:', blob)
            resolve(blob)
          },
          options.format === 'jpeg' ? 'image/jpeg' : 'image/png',
          options.quality || 0.9
        )
      })

      // Blob 생성 후 가상 DOM 요소 제거
      this.removeVirtualTimetable(virtualTimetableElement)

      return blob

    } catch (error) {
      console.error(`학생 ${student.name}의 이미지 생성 실패:`, error)
      return null
    }
  }

  /**
   * 학생별 파일명 생성
   */
  private static generateStudentFilename(student: StudentSelection, options: BulkDownloadOptions): string {
    const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const format = options.format || 'png'
    const scale = options.scale > 1 ? `_${options.scale}x` : ''
    
    // 기본 파일명이 있으면 사용, 없으면 학생 정보로 생성
    if (options.filename && options.filename.trim()) {
      return `${options.filename.trim()}_${student.name}_${timestamp}${scale}.${format}`
    }
    
    return `${student.name}_${student.grade}_시간표_${timestamp}${scale}.${format}`
  }

  /**
   * ZIP 파일명 생성
   */
  private static generateZipFilename(options: BulkDownloadOptions): string {
    const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    
    if (options.zipFilename && options.zipFilename.trim()) {
      return `${options.zipFilename.trim()}_${timestamp}.zip`
    }
    
    return `전체학생시간표_${timestamp}.zip`
  }

  /**
   * 기본 다운로드 옵션 생성
   */
  static getDefaultOptions(): BulkDownloadOptions {
    return {
      format: 'png',
      quality: 1.0,
      scale: 3,
      filename: '',
      includeHeader: true,
      includeTimeColumn: true,
      backgroundColor: '#ffffff',
      zipFilename: '전체학생시간표',
      includeStudentInfo: true
    }
  }

  /**
   * 고품질 다운로드 옵션 생성
   */
  static getHighQualityOptions(): BulkDownloadOptions {
    return {
      format: 'png',
      quality: 1.0,
      scale: 3,
      filename: '',
      includeHeader: true,
      includeTimeColumn: true,
      backgroundColor: '#ffffff',
      zipFilename: '전체학생시간표_고품질',
      includeStudentInfo: true
    }
  }

  /**
   * 가상 DOM에 TimetableWidget을 사용하여 시간표 생성
   */
  private static async createVirtualTimetable(
    student: StudentSelection, 
    options: BulkDownloadOptions
  ): Promise<HTMLElement | null> {
    try {
      // 가상 컨테이너 생성
      const virtualContainer = document.createElement('div')
      virtualContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 740px;
        height: 892px;
        overflow: hidden;
        background-color: ${options.backgroundColor || '#ffffff'};
        z-index: -1;
      `
      
      // 시간표 데이터가 있는 경우 간단한 HTML 생성
      if (student.timetableData && student.timetableData.classSections) {
        const simpleHTML = this.generateSimpleTimetableHTML(student, options)
        virtualContainer.innerHTML = simpleHTML
        document.body.appendChild(virtualContainer)
        
        // 렌더링 완료까지 충분히 대기
        await new Promise(resolve => setTimeout(resolve, 500))
        
        return virtualContainer
      } else {
        // 시간표 데이터가 없는 경우 기본 템플릿 생성
        const defaultHTML = this.generateDefaultTimetableHTML(student, options)
        virtualContainer.innerHTML = defaultHTML
        document.body.appendChild(virtualContainer)
        
        // 렌더링 완료까지 충분히 대기 (500ms)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        return virtualContainer
      }
      
    } catch (error) {
      console.error(`가상 시간표 생성 실패:`, error)
      return null
    }
  }

  /**
   * 가상 DOM 요소 제거
   */
  private static removeVirtualTimetable(element: HTMLElement): void {
    try {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element)
      }
    } catch (error) {
      console.error('가상 시간표 제거 실패:', error)
    }
  }

  /**
   * TimetableWidget을 사용한 시간표 HTML 생성
   */
  private static generateTimetableWidgetHTML(student: StudentSelection, options: BulkDownloadOptions): string {
    const { timetableData } = student
    
    if (!timetableData || !timetableData.classSections) {
      return this.generateDefaultTimetableHTML(student, options)
    }

    // TimetableWidget과 동일한 HTML 구조 생성
    return `
      <div class="virtual-timetable" style="
        width: 700px; 
        height: 852px; 
        background-color: ${options.backgroundColor || '#ffffff'};
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        font-family: Arial, sans-serif;
      ">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #333;">${student.name} 시간표</h2>
          <p style="margin: 5px 0; color: #666;">${student.grade} | ${student.status === 'active' ? '활성' : '비활성'}</p>
        </div>
        
        <div class="timetable-widget-container" style="
          width: 100%;
          height: calc(100% - 80px);
          overflow: hidden;
        ">
          <!-- TimetableWidget과 동일한 구조로 시간표 렌더링 -->
          <div class="timetable-grid" style="
            display: grid;
            grid-template-columns: 80px repeat(7, 1fr);
            grid-template-rows: 50px repeat(48, 30px);
            gap: 1px;
            background-color: #e0e0e0;
            border: 1px solid #ccc;
            border-radius: 4px;
            overflow: hidden;
          ">
            <!-- 시간 열 헤더 -->
            <div style="
              grid-column: 1;
              grid-row: 1;
              background-color: #f5f5f5;
              border-right: 1px solid #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 12px;
            ">시간</div>
            
            <!-- 요일 헤더 -->
            ${['월', '화', '수', '목', '금', '토', '일'].map((day, index) => `
              <div style="
                grid-column: ${index + 2};
                grid-row: 1;
                background-color: #f5f5f5;
                border-right: ${index < 6 ? '1px solid #ccc' : 'none'};
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 12px;
              ">${day}</div>
            `).join('')}
            
            <!-- 시간별 행 -->
            ${Array.from({ length: 48 }, (_, timeIndex) => {
              const hour = Math.floor(timeIndex / 2) + 9
              const minute = (timeIndex % 2) * 30
              const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
              
              return `
                <!-- 시간 라벨 -->
                <div style="
                  grid-column: 1;
                  grid-row: ${timeIndex + 2};
                  background-color: #f9f9f9;
                  border-right: 1px solid #ccc;
                  border-bottom: 1px solid #e0e0e0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                  color: #666;
                ">${time}</div>
                
                <!-- 요일별 셀 -->
                ${Array.from({ length: 7 }, (_, dayIndex) => {
                  const day = ['월', '화', '수', '목', '금', '토', '일'][dayIndex]
                  const dayMapping: Record<string, string> = {
                    'monday': '월', 'tuesday': '화', 'wednesday': '수', 'thursday': '목',
                    'friday': '금', 'saturday': '토', 'sunday': '일'
                  }
                  
                  // 해당 시간대에 수업이 있는지 확인
                  const matchingClass = timetableData.classSections.find((cls: any) => {
                    return cls.schedule?.some((scheduleItem: any) => {
                      const dayMatch = dayMapping[scheduleItem.dayOfWeek] === day
                      const timeMatch = scheduleItem.startTime <= time && scheduleItem.endTime > time
                      return dayMatch && timeMatch
                    })
                  })
                  
                  if (matchingClass) {
                    const scheduleItem = matchingClass.schedule?.find((item: any) => 
                      dayMapping[item.dayOfWeek] === day && 
                      item.startTime <= time && 
                      item.endTime > time
                    )
                    
                    return `
                      <div style="
                        grid-column: ${dayIndex + 2};
                        grid-row: ${timeIndex + 2};
                        background-color: ${matchingClass.color || '#e3f2fd'};
                        border-right: ${dayIndex < 6 ? '1px solid #ccc' : 'none'};
                        border-bottom: 1px solid #e0e0e0;
                        padding: 2px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        text-align: center;
                        min-height: 30px;
                      ">
                        <div style="font-weight: bold; margin-bottom: 2px;">${matchingClass.name}</div>
                        <div style="font-size: 8px; color: #666;">${scheduleItem ? `${scheduleItem.startTime}~${scheduleItem.endTime}` : ''}</div>
                        <div style="font-size: 8px; color: #666;">${matchingClass.teacherName || '교사'}</div>
                      </div>
                    `
                  } else {
                    return `
                      <div style="
                        grid-column: ${dayIndex + 2};
                        grid-row: ${timeIndex + 2};
                        background-color: #ffffff;
                        border-right: ${dayIndex < 6 ? '1px solid #ccc' : 'none'};
                        border-bottom: 1px solid #e0e0e0;
                      "></div>
                    `
                  }
                }).join('')}
              `
            }).join('')}
          </div>
        </div>
      </div>
    `
  }

  /**
   * 간단한 시간표 HTML 생성 (기존 방식 유지)
   */
  private static generateSimpleTimetableHTML(student: StudentSelection, options: BulkDownloadOptions): string {
    const { timetableData } = student
    
    if (!timetableData || !timetableData.classSections) {
      return this.generateDefaultTimetableHTML(student, options)
    }

    const classes = timetableData.classSections
    console.log(`🔍 ${student.name}의 classSections:`, classes)
    console.log(`🔍 첫 번째 수업 예시:`, classes[0])
    
    // 백엔드 API 응답 구조에 맞게 요일 매핑
    const dayMapping: Record<string, string> = {
      'monday': '월',
      'tuesday': '화', 
      'wednesday': '수',
      'thursday': '목',
      'friday': '금',
      'saturday': '토',
      'sunday': '일'
    }
    
    const days = ['월', '화', '수', '목', '금', '토', '일']
    const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', 
                       '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
                       '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']

    let html = `
      <div class="virtual-timetable" style="
        width: 700px; 
        height: 852px; 
        background-color: ${options.backgroundColor || '#ffffff'};
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        font-family: Arial, sans-serif;
      ">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #333;">${student.name} 시간표</h2>
          <p style="margin: 5px 0; color: #666;">${student.grade} | ${student.status === 'active' ? '활성' : '비활성'}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5; width: 80px;">시간</th>
              ${days.map(day => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">${day}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `

    // 시간별 행 생성
    timeSlots.forEach((time, timeIndex) => {
      html += `<tr>`
      html += `<td style="border: 1px solid #ddd; padding: 4px; text-align: center; background-color: #f9f9f9;">${time}</td>`
      
      // 각 요일별 셀
      days.forEach((day, dayIndex) => {
        // 백엔드 API 응답 구조에 맞게 수업 필터링
        const dayClasses = classes.filter((cls: any) => {
          // schedule 배열에서 해당 요일과 시간에 맞는 수업 찾기
          const matchingSchedule = cls.schedule?.find((scheduleItem: any) => {
            const dayMatch = dayMapping[scheduleItem.dayOfWeek] === day
            const timeMatch = scheduleItem.startTime <= time && scheduleItem.endTime > time
            
            if (dayMatch && timeMatch) {
              console.log(`🔍 ${day} ${time} - 수업 매칭 성공:`, {
                수업명: cls.name,
                요일: scheduleItem.dayOfWeek,
                시작시간: scheduleItem.startTime,
                끝시간: scheduleItem.endTime
              })
            }
            
            return dayMatch && timeMatch
          })
          
          return !!matchingSchedule
        })
        
        if (dayClasses.length > 0) {
          const cls: any = dayClasses[0]
          // schedule에서 해당 시간대의 정보 가져오기
          const scheduleItem = cls.schedule?.find((item: any) => 
            dayMapping[item.dayOfWeek] === day && 
            item.startTime <= time && 
            item.endTime > time
          )
          
          html += `<td style="border: 1px solid #ddd; padding: 4px; background-color: ${cls.color || '#e3f2fd'}; text-align: center; font-size: 11px;">
            <div style="font-weight: bold;">${cls.name}</div>
            <div>${scheduleItem ? `${scheduleItem.startTime}~${scheduleItem.endTime}` : ''}</div>
            <div>${cls.teacherName || '교사'}</div>
          </td>`
        } else {
          html += `<td style="border: 1px solid #ddd; padding: 4px; background-color: #ffffff;"></td>`
        }
      })
      
      html += `</tr>`
    })

    html += `
          </tbody>
        </table>
      </div>
    `

    return html
  }

  /**
   * DOM 렌더링 완료 대기
   */
  private static async waitForRendering(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      // requestAnimationFrame을 여러 번 호출하여 렌더링 완료 보장
      const checkRendering = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // 추가로 DOM 요소가 실제로 존재하는지 확인
              if (element.querySelector('.timetable-widget')) {
                resolve()
              } else {
                // 요소가 없으면 더 기다림
                setTimeout(() => {
                  if (element.querySelector('.timetable-widget')) {
                    resolve()
                  } else {
                    console.warn('TimetableWidget을 찾을 수 없어서 강제로 진행합니다')
                    resolve()
                  }
                }, 500)
              }
            })
          })
        })
      }
      checkRendering()
    })
  }

  /**
   * 기본 시간표 HTML 생성 (데이터가 없는 경우)
   */
  private static generateDefaultTimetableHTML(student: StudentSelection, options: BulkDownloadOptions): string {
    return `
      <div class="virtual-timetable" style="
        width: 700px; 
        height: 852px; 
        background-color: ${options.backgroundColor || '#ffffff'};
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        font-family: Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="text-align: center;">
          <h2 style="margin: 0; color: #333;">${student.name} 시간표</h2>
          <p style="margin: 5px 0; color: #666;">${student.grade} | ${student.status === 'active' ? '활성' : '비활성'}</p>
          <p style="margin: 20px 0; color: #999;">시간표 데이터가 없습니다.</p>
        </div>
      </div>
    `
  }

  /**
   * 렌더링된 DOM 요소를 사용하여 이미지 생성 (새로운 방식)
   */
  static async generateBulkTimetableImagesFromElements(
    students: Array<StudentSelection>,
    downloadOptions: BulkDownloadOptions,
    renderedElements: { [key: string]: HTMLElement }
  ): Promise<BulkDownloadResult> {
    try {
      console.log('🚀 렌더링된 DOM 요소를 사용하여 이미지 생성 시작')
      console.log('📊 학생 수:', students.length)
      console.log('📊 렌더링된 요소 수:', Object.keys(renderedElements).length)

      const results: Array<{ studentId: string; success: boolean; blob?: Blob; error?: string }> = []
      let successCount = 0
      let failedCount = 0

      for (const student of students) {
        try {
          console.log(`🎯 ${student.name} 이미지 생성 시작`)
          
          // 렌더링된 DOM 요소 찾기
          const renderedElement = renderedElements[student.id]
          if (!renderedElement) {
            throw new Error(`학생 ${student.name}의 렌더링된 요소를 찾을 수 없습니다`)
          }

          // html2canvas로 이미지 생성
          const html2canvas = (await import('html2canvas')).default
          
          const canvasOptions = {
            allowTaint: true,
            useCORS: true,
            scale: downloadOptions.scale || 1,
            backgroundColor: downloadOptions.backgroundColor || '#ffffff',
            width: 740,
            height: 892,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 740,
            windowHeight: 892,
            logging: true,
            removeContainer: false,
            foreignObjectRendering: false
          }

          console.log('🚀 html2canvas 시작...')
          const canvas = await html2canvas(renderedElement, canvasOptions)
          console.log('✅ html2canvas 완료:', canvas)
          
          // Canvas를 Blob으로 변환
          console.log('🔄 Canvas를 Blob으로 변환 중...')
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(
              (blob) => {
                console.log('✅ Blob 변환 완료:', blob)
                resolve(blob)
              },
              downloadOptions.format === 'jpeg' ? 'image/jpeg' : 'image/png',
              downloadOptions.quality || 0.9
            )
          })

          if (blob) {
            results.push({
              studentId: student.id,
              success: true,
              blob: blob
            })
            successCount++
            console.log(`✅ ${student.name} 이미지 생성 성공`)
          } else {
            throw new Error('Blob 생성 실패')
          }

        } catch (error) {
          console.error(`${student.name}의 이미지 생성 실패:`, error)
          results.push({
            studentId: student.id,
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류'
          })
          failedCount++
        }
      }

      const result: BulkDownloadResult = {
        success: successCount > 0,
        message: successCount > 0 
          ? `${successCount}명의 학생 시간표 이미지 생성 완료`
          : '모든 학생의 시간표 생성에 실패했습니다.',
        totalStudents: students.length,
        successCount: successCount,
        failedCount: failedCount,
        errors: results.filter(r => !r.success).map(r => r.error || '알 수 없는 오류')
      }

      console.log('🎉 이미지 생성 완료:', result)
      return result

    } catch (error) {
      console.error('이미지 생성 중 오류 발생:', error)
      return {
        success: false,
        message: '이미지 생성 중 오류가 발생했습니다.',
        totalStudents: students.length,
        successCount: 0,
        failedCount: students.length,
        errors: [error instanceof Error ? error.message : '알 수 없는 오류']
      }
    }
  }
}
