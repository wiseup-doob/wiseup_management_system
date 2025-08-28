import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { BulkTimetableDownloadModalProps } from '../types/bulk-download.types'
import { useBulkTimetableDownload } from '../hooks/useBulkTimetableDownload'

import { apiService } from '../../../../services/api'
import './BulkTimetableDownloadModal.css'

/**
 * 전체 시간표 다운로드 모달
 */
export const BulkTimetableDownloadModal: React.FC<BulkTimetableDownloadModalProps> = ({
  isOpen,
  onClose,
  students,
  onStudentsUpdate
}) => {
  // 현재 단계 (options -> selection -> load -> progress)
  const [currentStep, setCurrentStep] = useState<'options' | 'selection' | 'load' | 'progress'>('options')
  
  // 커스텀 ZIP 파일명
  const [customZipFilename, setCustomZipFilename] = useState('전체학생시간표')
  
  // 로컬 학생 상태 관리 (SchedulePage에서 받아온 학생 목록)
  const [localStudents, setLocalStudents] = useState<Array<{
    id: string
    name: string
    grade: string
    status: string
    isSelected: boolean
    timetableData?: any
  }>>([])
  
  // 시간표 로드 상태
  const [isLoadingTimetables, setIsLoadingTimetables] = useState(false)
  const [timetableLoadProgress, setTimetableLoadProgress] = useState(0)
  const [loadedTimetables, setLoadedTimetables] = useState<{[key: string]: any}>({})
  
  // 캡쳐된 이미지 결과 저장
  const [capturedImages, setCapturedImages] = useState<Array<{ studentId: string; success: boolean; blob?: Blob; error?: string }>>([])
  

  
  // 훅 사용
  const {
    downloadOptions,
    isGenerating,
    downloadProgress,
    lastResult,
    error,
    updateDownloadOptions,
    resetDownloadOptions,
    setHighQualityOptions,
    setStudents,
    startBulkDownload,
    cancelDownload
  } = useBulkTimetableDownload()

  // students prop을 훅의 selectedStudents와 동기화
  useEffect(() => {
    if (students && students.length > 0) {
      setStudents(students)
      // 로컬 상태도 동기화
      setLocalStudents(students)
    } else {
      setStudents([])
      setLocalStudents([])
    }
  }, [students, setStudents])



  // 로드된 시간표 데이터를 학생 데이터에 반영 (무한 루프 방지)
  useEffect(() => {
    if (Object.keys(loadedTimetables).length > 0) {
      // 무한 루프 방지를 위해 조건부로만 업데이트
      const hasNewTimetableData = localStudents.some(student => {
        const currentTimetableData = student.timetableData
        const newTimetableData = loadedTimetables[student.id]
        return JSON.stringify(currentTimetableData) !== JSON.stringify(newTimetableData)
      })
      
      if (hasNewTimetableData) {
        const updatedStudents = localStudents.map(student => ({
          ...student,
          timetableData: loadedTimetables[student.id] || null
        }))
        setLocalStudents(updatedStudents)
      }
    }
  }, [loadedTimetables])

  // loadedTimetables 상태 변경 모니터링 및 단계 진행
  useEffect(() => {
    // 시간표 로드가 완료되었고, 데이터가 있고, 로딩이 끝났다면 'progress' 단계로 이동
    if (isLoadingTimetables === false && 
        Object.keys(loadedTimetables).length > 0) {
      setCurrentStep('progress')
    }
  }, [loadedTimetables, isLoadingTimetables])

  // progress 단계로 이동했을 때만 1번 다운로드 시작 (무한 루프 방지)
  useEffect(() => {
    if (currentStep === 'progress' && 
        Object.keys(loadedTimetables).length > 0 && 
        !isGenerating) {
      handleStartDownload()
    }
  }, [currentStep]) // loadedTimetables, isGenerating 제거하여 무한 루프 방지

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('options')
      setCustomZipFilename('전체학생시간표')
      resetDownloadOptions()
    }
  }, [isOpen, resetDownloadOptions])

  // 모달 닫기 처리
  const handleClose = () => {
    if (isGenerating) {
      if (window.confirm('다운로드가 진행 중입니다. 정말로 취소하시겠습니까?')) {
        cancelDownload()
        onClose()
      }
    } else {
      setCurrentStep('options')
      onClose()
    }
  }

  // 설정 완료 처리
  const handleCompleteSetup = () => {
    if (customZipFilename.trim()) {
      updateDownloadOptions({ zipFilename: customZipFilename.trim() })
    }
    setCurrentStep('selection')
  }

  // 이전 단계로 돌아가기
  const handleGoBack = () => {
    if (currentStep === 'selection') {
      setCurrentStep('options')
    } else if (currentStep === 'progress') {
      setCurrentStep('selection')
    }
  }

    // 시간표 로드 시작
  const handleLoadTimetables = async () => {
    // 🎯 load 단계로 설정
    setCurrentStep('load')
    
    // localStudents에서 직접 선택된 학생 수 계산
    const actualSelectedCount = localStudents.filter(s => s.isSelected).length
    
    if (actualSelectedCount === 0) {
      alert('선택된 학생이 없습니다.')
      return
    }
    
    setIsLoadingTimetables(true)
    setTimetableLoadProgress(0)
    setLoadedTimetables({})
    
    // 로드된 데이터를 추적하기 위한 로컬 변수
    let localLoadedTimetables: Record<string, any> = {}
    
    try {
      const selectedStudentsList = localStudents.filter(s => s.isSelected)
      let loadedCount = 0
      
      for (const student of selectedStudentsList) {
        try {
          // apiService를 사용하여 학생 시간표 로드
          const response = await apiService.getStudentTimetable(student.id)
          
          if (response.success && response.data && response.data.classSections) {
            // 백엔드 API 응답을 TimetableWidget이 기대하는 구조로 변환
            const timetableData = {
              classSections: response.data.classSections.map((section: any) => ({
                id: section.id,
                name: section.name,
                teacherName: section.teacher?.name || '',
                classroomName: section.classroom?.name || '',
                schedule: section.schedule.map((scheduleItem: any) => ({
                  dayOfWeek: scheduleItem.dayOfWeek, // 'monday', 'tuesday' 등
                  startTime: scheduleItem.startTime,
                  endTime: scheduleItem.endTime
                })),
                color: section.color || '#e3f2fd'
              })),
              conflicts: [],
              metadata: {
                totalClasses: response.data.classSections.length,
                totalStudents: 1,
                totalTeachers: 0
              }
            }
            
            // 로컬 변수에 추가
            localLoadedTimetables[student.id] = timetableData
            
            setLoadedTimetables(prev => {
              const newLoadedTimetables = {
                ...prev,
                [student.id]: timetableData
              }
              return newLoadedTimetables
            })
          } else {
            // 시간표가 없는 경우 빈 데이터로 설정
            const emptyTimetableData = {
              classSections: [],
              conflicts: [],
              metadata: {
                totalClasses: 0,
                totalStudents: 1,
                totalTeachers: 0
              }
            }
            
            // 로컬 변수에 추가
            localLoadedTimetables[student.id] = emptyTimetableData
            
            setLoadedTimetables(prev => {
              const newLoadedTimetables = {
                ...prev,
                [student.id]: emptyTimetableData
              }
              return newLoadedTimetables
            })
          }
        } catch (error) {
          console.error(`❌ 학생 ${student.name}의 시간표 로드 실패:`, error)
          // 오류 시에도 빈 데이터로 설정
          const errorTimetableData = {
            classSections: [],
            conflicts: [],
            metadata: {
              totalClasses: 0,
              totalStudents: 1,
              totalTeachers: 0
            }
          }
          
          // 로컬 변수에 추가
          localLoadedTimetables[student.id] = errorTimetableData
          
          setLoadedTimetables(prev => {
            const newLoadedTimetables = {
              ...prev,
              [student.id]: errorTimetableData
            }
            return newLoadedTimetables
          })
        }
        
        loadedCount++
        setTimetableLoadProgress(Math.round((loadedCount / selectedStudentsList.length) * 100))
        
        // API 부하 방지를 위한 짧은 대기
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // 🎯 시간표 로드 단계에서 실제 렌더링 및 캡쳐 진행
      const captureResults: Array<{ studentId: string; success: boolean; blob?: Blob; error?: string }> = []
      let captureSuccessCount = 0
      let captureFailedCount = 0
      
      for (const student of selectedStudentsList) {
        try {
          const timetableData = localLoadedTimetables[student.id]
          if (!timetableData) {
            throw new Error('시간표 데이터가 없습니다')
          }
          
          // 실제 TimetableWidget 렌더링 및 캡쳐
          const blob = await renderAndCaptureTimetable(student, timetableData)
          if (blob) {
            captureResults.push({
              studentId: student.id,
              success: true,
              blob: blob
            })
            captureSuccessCount++
          } else {
            throw new Error('이미지 생성 실패')
          }
          
        } catch (error) {
          console.error(`${student.name} 시간표 캡쳐 실패:`, error)
          captureResults.push({
            studentId: student.id,
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류'
          })
          captureFailedCount++
        }
      }
      
      // 캡쳐된 이미지들을 로컬 상태에 저장 (나중에 다운로드에서 사용)
      setCapturedImages(captureResults)
      
      // 로딩 완료 후 progress 단계로 이동
      setCurrentStep('progress')
      
    } catch (error) {
      console.error('❌ 시간표 로드 중 오류 발생:', error)
      alert('시간표 로드 중 오류가 발생했습니다.')
    } finally {
      setIsLoadingTimetables(false)
    }
  }

  // 모달 내에서 시간표 렌더링 및 캡쳐
  const renderAndCaptureTimetable = async (student: any, timetableData: any): Promise<Blob | null> => {
    return new Promise(async (resolve) => {
      try {
        // TimetableWidget을 모달 내 보이는 렌더링 영역에 렌더링
        const renderArea = document.getElementById('visible-timetable-render-area')
        if (!renderArea) {
          throw new Error('렌더링 영역을 찾을 수 없습니다')
        }
        
        // 기존 내용 제거
        renderArea.innerHTML = ''
        
        // TimetableWidget 렌더링
        const { createRoot } = await import('react-dom/client')
        const root = createRoot(renderArea)
        
        const { TimetableWidget } = await import('../TimetableWidget')
        const { DndProvider } = await import('react-dnd')
        const { HTML5Backend } = await import('react-dnd-html5-backend')
        
        root.render(
          <DndProvider backend={HTML5Backend}>
            <div style={{ padding: '20px', background: 'white' }}>
              <TimetableWidget
                data={[timetableData]}
                showConflicts={false}
                showEmptySlots={false}
                showTimeLabels={true}
              />
            </div>
          </DndProvider>
        )
        
        // 렌더링 완료 대기
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // html2canvas로 캡쳐
        const html2canvas = (await import('html2canvas')).default
        const canvas = await html2canvas(renderArea, {
          allowTaint: true,
          useCORS: true,
          background: downloadOptions.backgroundColor || '#ffffff',
          width: 740,
          height: 892,
          logging: true
        })
        
        // Canvas를 Blob으로 변환
        const blob = await new Promise<Blob | null>((resolveBlob) => {
          canvas.toBlob(
            (blob) => resolveBlob(blob),
            downloadOptions.format === 'jpeg' ? 'image/jpeg' : 'image/png',
            downloadOptions.quality || 0.9
          )
        })
        
        // 렌더링 정리
        root.unmount()
        
        resolve(blob)
        
      } catch (error) {
        console.error(`${student.name} 시간표 렌더링 및 캡쳐 실패:`, error)
        resolve(null)
      }
    })
  }





  // 다운로드 시작
  const handleStartDownload = async () => {
    // localStudents에서 직접 선택된 학생 수 계산
    const actualSelectedCount = localStudents.filter(s => s.isSelected).length
    
    if (actualSelectedCount === 0) {
      if (students.length === 0) {
        alert('학생 목록을 불러올 수 없습니다. 페이지를 새로고침해주세요.')
      } else {
        alert('선택된 학생이 없습니다. 학생을 선택해주세요.')
      }
      return
    }
    
    // 시간표 데이터가 로드되지 않은 경우 먼저 로드
    if (Object.keys(loadedTimetables).length === 0) {
      await handleLoadTimetables()
      return
    }
    
    try {
      const selectedStudents = localStudents.filter(s => s.isSelected)
      const results: Array<{ studentId: string; success: boolean; blob?: Blob; error?: string }> = []
      let successCount = 0
      let failedCount = 0
      
      // 🎯 이미 시간표 로드 단계에서 캡쳐가 완료되었으므로, 여기서는 ZIP 파일 생성만 진행
      // 캡쳐된 이미지들을 결과에 추가
      const selectedStudentsList = localStudents.filter(s => s.isSelected)
      results.push(...selectedStudentsList.map(student => ({
        studentId: student.id,
        success: true,
        blob: capturedImages.find(r => r.studentId === student.id)?.blob
      })))
      successCount = selectedStudentsList.length
      
      // ZIP 파일 생성
      if (successCount > 0) {
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()
        
        // 성공한 이미지들을 ZIP에 추가
        results.filter(r => r.success && r.blob).forEach((result, index) => {
          const student = selectedStudentsList.find(s => s.id === result.studentId)
          const filename = `${student?.name}_${student?.grade}_시간표.${downloadOptions.format || 'png'}`
          // 실제 캡쳐된 blob 사용
          zip.file(filename, result.blob!)
        })
        
        // ZIP 파일 생성 및 다운로드
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const { saveAs } = await import('file-saver')
        const zipFilename = `${customZipFilename || '전체학생시간표'}.zip`
        
        saveAs(zipBlob, zipFilename)
        
        alert(`전체 학생 시간표 다운로드가 완료되었습니다!\n성공: ${successCount}명, 실패: ${failedCount}명`)
      } else {
        alert('모든 학생의 시간표 생성에 실패했습니다.')
      }
      
    } catch (error) {
      console.error('❌ 다운로드 중 오류 발생:', error)
      alert('다운로드 중 오류가 발생했습니다.')
    }
  }

  if (!isOpen) return null

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bulk-timetable-download-modal-overlay" onClick={handleClose}>
        <div className="bulk-timetable-download-modal" onClick={(e) => e.stopPropagation()}>
          {/* 모달 헤더 */}
          <div className="modal-header">
            <h2>전체 시간표 다운로드</h2>
            <button className="close-button" onClick={handleClose}>
              ✕
            </button>
          </div>

        {/* 단계 표시기 */}
        <div className="step-indicator">
          <div className={`step ${currentStep === 'options' ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">다운로드 옵션</div>
          </div>
          <div className="step-arrow">→</div>
          <div className={`step ${currentStep === 'selection' ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">학생 선택</div>
          </div>
          <div className="step-arrow">→</div>
          <div className={`step ${currentStep === 'load' ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">시간표 로드</div>
          </div>
          <div className="step-arrow">→</div>
          <div className={`step ${currentStep === 'progress' ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">다운로드</div>
          </div>
        </div>

        {/* 단계별 콘텐츠 */}
        {currentStep === 'options' && (
          <div className="options-step">
            <div className="options-section">
              <h3>다운로드 옵션 설정</h3>
              
              {/* 파일 형식 */}
              <div className="option-group">
                <label>파일 형식:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="png"
                      checked={downloadOptions.format === 'png'}
                      onChange={(e) => updateDownloadOptions({ format: e.target.value as 'png' | 'jpeg' })}
                    />
                    PNG (고품질)
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="jpeg"
                      checked={downloadOptions.format === 'jpeg'}
                      onChange={(e) => updateDownloadOptions({ format: e.target.value as 'png' | 'jpeg' })}
                    />
                    JPEG (압축)
                  </label>
                </div>
              </div>

              {/* 품질 설정 */}
              <div className="option-group">
                <label>품질:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="1"
                      checked={downloadOptions.scale === 1}
                      onChange={(e) => updateDownloadOptions({ scale: parseInt(e.target.value) })}
                    />
                    표준 (1x)
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="2"
                      checked={downloadOptions.scale === 2}
                      onChange={(e) => updateDownloadOptions({ scale: parseInt(e.target.value) })}
                    />
                    고품질 (2x)
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="3"
                      checked={downloadOptions.scale === 3}
                      onChange={(e) => updateDownloadOptions({ scale: parseInt(e.target.value) })}
                    />
                    프리미엄 (3x)
                  </label>
                </div>
              </div>

              {/* 배경색 */}
              <div className="option-group">
                <label>배경색:</label>
                <input
                  type="color"
                  value={downloadOptions.backgroundColor}
                  onChange={(e) => updateDownloadOptions({ backgroundColor: e.target.value })}
                />
              </div>

              {/* ZIP 파일명 */}
              <div className="option-group">
                <label>ZIP 파일명:</label>
                <input
                  type="text"
                  value={customZipFilename}
                  onChange={(e) => setCustomZipFilename(e.target.value)}
                  placeholder="전체학생시간표"
                />
                <small>현재 설정: {customZipFilename || '자동 생성됨'}</small>
              </div>

              {/* 설정 완료 버튼 */}
              <div className="setup-complete-section">
                <button 
                  className="setup-complete-btn"
                  onClick={handleCompleteSetup}
                >
                  ✅ 설정 완료
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'selection' && (
          <div className="selection-step">
            <div className="selection-section">
              <h3>학생 선택</h3>
              
              {/* 학생 선택 안내 메시지 */}
              <div className="selection-info">
                <p>다운로드할 학생들을 체크박스로 선택해주세요.</p>
                <p>전체 선택/해제도 가능합니다.</p>
              </div>
              
              {/* 전체 선택/해제 */}
              <div className="select-all-section">
                <label>
                  <input
                    type="checkbox"
                    checked={localStudents.length > 0 && localStudents.every(s => s.isSelected)}
                    onChange={(e) => {
                      const newStudents = localStudents.map(s => ({ ...s, isSelected: e.target.checked }))
                      setLocalStudents(newStudents)
                      // 훅의 selectedStudents도 업데이트
                      setStudents(newStudents)
                    }}
                  />
                  전체 선택
                </label>
                <span className="selection-count">
                  선택된 학생: {localStudents.filter(s => s.isSelected).length} / {localStudents.length}
                </span>
              </div>

              {/* 학생 목록 */}
              <div className="students-list">
                {localStudents.map((student) => (
                  <div key={student.id} className="student-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={student.isSelected}
                        onChange={(e) => {
                          const newStudents = localStudents.map(s => 
                            s.id === student.id 
                              ? { ...s, isSelected: e.target.checked }
                              : s
                          )
                          setLocalStudents(newStudents)
                          // 훅의 selectedStudents도 업데이트
                          setStudents(newStudents)
                        }}
                      />
                      <span className="student-name">{student.name}</span>
                      <span className="student-grade">{student.grade}</span>
                      <span className={`student-status ${student.status}`}>
                        {student.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              {/* 액션 버튼 */}
              <div className="selection-actions">
                <button 
                  className="go-back-btn"
                  onClick={handleGoBack}
                >
                  ← 옵션으로 돌아가기
                </button>
                <button 
                  className="load-timetables-btn"
                  onClick={handleLoadTimetables}
                  disabled={localStudents.filter(s => s.isSelected).length === 0 || isLoadingTimetables}
                >
                  {isLoadingTimetables ? '⏳ 시간표 로드 중...' : '📚 시간표 로드 시작'}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'load' && (
          <div className="load-step">
            <div className="load-section">
              <h3>시간표 로드 중...</h3>
              
              {/* 로드 진행률 표시 */}
              <div className="load-progress-bar">
                <div 
                  className="load-progress-fill"
                  style={{ width: `${timetableLoadProgress}%` }}
                ></div>
              </div>
              
              <div className="load-progress-info">
                <div className="load-progress-text">
                  선택된 학생들의 시간표를 로드하고 있습니다...
                </div>
                <div className="load-progress-percentage">
                  {timetableLoadProgress}%
                </div>
              </div>
              
              {/* 🎯 시간표 렌더링 영역 추가 */}
              <div className="timetable-render-area">
                <h4>시간표 미리보기</h4>
                <div 
                  id="visible-timetable-render-area"
                  style={{
                    width: '100%',
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '20px',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    minHeight: '400px',
                    overflow: 'hidden'
                  }}
                >
                  <div className="timetable-placeholder">
                    시간표가 여기에 렌더링됩니다...
                  </div>
                </div>
              </div>
              
              {/* 로드 완료 후 다운로드 시작 버튼 */}
              {timetableLoadProgress === 100 && (
                <div className="load-complete-actions">
                  <button 
                    className="start-download-btn"
                    onClick={handleStartDownload}
                  >
                    📥 다운로드 시작 ({localStudents.filter(s => s.isSelected).length}명)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 'progress' && (
          <div className="progress-step">
            <div className="progress-section">
              <h3>다운로드 진행 중...</h3>
              
              {/* 진행률 표시 */}
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${downloadProgress.progressPercentage}%` }}
                ></div>
              </div>
              
              <div className="progress-info">
                <div className="progress-text">
                  {downloadProgress.currentStudent 
                    ? `${downloadProgress.currentStudent.name} 처리 중...`
                    : '준비 중...'
                  }
                </div>
                <div className="progress-counts">
                  완료: {downloadProgress.completedCount} | 
                  실패: {downloadProgress.failedCount} | 
                  전체: {downloadProgress.totalCount}
                </div>
                <div className="progress-percentage">
                  {downloadProgress.progressPercentage}%
                </div>
              </div>

              {/* 결과 표시 */}
              {lastResult && (
                <div className={`result-message ${lastResult.success ? 'success' : 'error'}`}>
                  {lastResult.message}
                  {lastResult.errors.length > 0 && (
                    <div className="error-details">
                      <strong>오류 상세:</strong>
                      <ul>
                        {lastResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="progress-actions">
                {!isGenerating ? (
                  <>
                    <button 
                      className="go-back-btn"
                      onClick={handleGoBack}
                    >
                      ← 학생 선택으로 돌아가기
                    </button>
                    {lastResult?.success && (
                      <button 
                        className="close-modal-btn"
                        onClick={onClose}
                      >
                        모달 닫기
                      </button>
                    )}
                  </>
                ) : (
                  <button 
                    className="cancel-download-btn"
                    onClick={cancelDownload}
                  >
                    ❌ 다운로드 취소
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        

        
        
      </div>
    </div>
    </DndProvider>
  )
}
