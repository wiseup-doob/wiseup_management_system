import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { TimetableDownloadModalProps } from '../types/download.types'
import { useTimetableDownload } from '../hooks/useTimetableDownload'
import { TimetableWidget } from '../TimetableWidget'
import './TimetableDownloadModal.css'

/**
 * 시간표 다운로드 전용 모달 컴포넌트
 */
export const TimetableDownloadModal: React.FC<TimetableDownloadModalProps> = ({
  isOpen,
  onClose,
  timetableData,
  studentInfo
}) => {
  // 다운로드 훅 사용
  const {
    isGenerating,
    downloadProgress,
    downloadOptions,
    lastResult,
    downloadTimetable,
    updateDownloadOptions,
    resetDownloadOptions,
    setHighQualityOptions,
    cancelDownload,
    setTargetElement
  } = useTimetableDownload()

  // 모달 내부 상태
  const [currentStep, setCurrentStep] = useState<'options' | 'preview'>('options')
  const [customFilename, setCustomFilename] = useState('')
  
  // 시간표 미리보기용 ref
  const timetableRef = useRef<HTMLDivElement>(null)
  
  // 시간표 크기 상태
  const [timetableSize, setTimetableSize] = useState({ width: 0, height: 0 })
  
  // 모달이 열릴 때마다 타겟 요소 설정
  useEffect(() => {
    if (isOpen && timetableRef.current) {
      console.log('타겟 요소 설정:', timetableRef.current)
      setTargetElement(timetableRef.current)
    }
  }, [isOpen, setTargetElement])
  
  // timetableRef 변경 시 로그
  useEffect(() => {
    console.log('timetableRef 변경:', timetableRef.current)
  }, [timetableRef.current])
  
  // 시간표 크기 계산
  const calculateTimetableSize = useCallback(() => {
    if (timetableRef.current) {
      const rect = timetableRef.current.getBoundingClientRect()
      const scrollWidth = timetableRef.current.scrollWidth
      const scrollHeight = timetableRef.current.scrollHeight

      console.log('시간표 미리보기 컨테이너 크기 계산:', {
        표시크기: { width: rect.width, height: rect.height },
        실제크기: { width: scrollWidth, height: scrollHeight }
      })

      setTimetableSize({
        width: Math.max(scrollWidth, rect.width),
        height: Math.max(scrollHeight, rect.height)
      })
    }
  }, [])
  
  // 단계 변경 시 크기 계산 및 모달 열릴 때 파일명 업데이트
  useEffect(() => {
    if (currentStep === 'preview') {
      // 시간표가 렌더링될 때까지 대기 후 크기 계산
      setTimeout(calculateTimetableSize, 200)
    }
  }, [currentStep, calculateTimetableSize])
  
  // 모달이 열릴 때마다 파일명 업데이트
  useEffect(() => {
    if (isOpen && studentInfo?.name) {
      const grade = studentInfo.grade || ''
      const gradeText = grade ? `_${grade}` : ''
      const newFilename = `${studentInfo.name}${gradeText}_시간표`
      setCustomFilename(newFilename)
      updateDownloadOptions({ filename: newFilename })
    }
  }, [isOpen, studentInfo?.name, studentInfo?.grade, updateDownloadOptions])
  
  // 커스텀 파일명 초기화 및 업데이트
  useEffect(() => {
    if (studentInfo?.name) {
      const grade = studentInfo.grade || ''
      const gradeText = grade ? `_${grade}` : ''
      const newFilename = `${studentInfo.name}${gradeText}_시간표`
      setCustomFilename(newFilename)
      
      // 다운로드 옵션도 즉시 업데이트
      updateDownloadOptions({ filename: newFilename })
    }
  }, [studentInfo?.name, studentInfo?.grade, updateDownloadOptions])
  
  // 모달 닫기 처리
  const handleClose = () => {
    if (isGenerating) {
      if (window.confirm('다운로드가 진행 중입니다. 정말로 취소하시겠습니까?')) {
        cancelDownload()
        onClose()
      }
    } else {
      // 모달 닫을 때 단계 초기화
      setCurrentStep('options')
      onClose()
    }
  }
  
  // 설정 완료 처리
  const handleCompleteSetup = () => {
    setCurrentStep('preview')
  }
  
  // 이전 단계로 돌아가기
  const handleGoBack = () => {
    setCurrentStep('options')
  }
  
  // 다운로드 실행
  const handleDownload = async () => {
    // 학생 이름 + 시간표 컨테이너를 캡쳐
    const containerElement = document.querySelector('.timetable-with-name')
    if (!containerElement) {
      console.error('시간표 컨테이너를 찾을 수 없습니다.')
      return
    }

    // 커스텀 파일명이 있으면 옵션에 적용
    if (customFilename.trim()) {
      updateDownloadOptions({ filename: customFilename.trim() })
    }

    console.log('시간표 컨테이너 캡쳐 시작:', containerElement)
    console.log('컨테이너 실제 크기:', {
      clientWidth: containerElement.clientWidth,
      clientHeight: containerElement.clientHeight,
      scrollWidth: containerElement.scrollWidth,
      scrollHeight: containerElement.scrollHeight
    })
    console.log('계산된 시간표 크기:', timetableSize)

    // 학생 이름 + 시간표 전체를 캡쳐
    await downloadTimetable(containerElement as HTMLElement)
  }
  
  // 다운로드 옵션 변경 핸들러들
  const handleFormatChange = (format: 'png' | 'jpeg') => {
    updateDownloadOptions({ format })
  }
  
  const handleQualityChange = (quality: number) => {
    updateDownloadOptions({ quality })
  }
  
  const handleScaleChange = (scale: number) => {
    updateDownloadOptions({ scale })
  }
  
  const handleBackgroundColorChange = (backgroundColor: string) => {
    updateDownloadOptions({ backgroundColor })
  }
  
  const handleIncludeHeaderChange = (includeHeader: boolean) => {
    updateDownloadOptions({ includeHeader })
  }
  
  const handleIncludeTimeColumnChange = (includeTimeColumn: boolean) => {
    updateDownloadOptions({ includeTimeColumn })
  }
  
  if (!isOpen) return null
  
  return (
    <div className="timetable-download-modal-overlay" onClick={handleClose}>
      <div className="timetable-download-modal" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="modal-header">
          <h2>시간표 다운로드</h2>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>
        
        {/* 학생 정보 */}
        {studentInfo && (
          <div className="student-info">
            <div className="student-name">{studentInfo.name}</div>
            {studentInfo.grade && <div className="student-grade">{studentInfo.grade}</div>}
            {studentInfo.status && <div className="student-status">{studentInfo.status}</div>}
          </div>
        )}
        
        {/* 단계 표시 */}
        <div className="step-indicator">
          <div className={`step ${currentStep === 'options' ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">다운로드 옵션</div>
          </div>
          <div className="step-arrow">→</div>
          <div className={`step ${currentStep === 'preview' ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">시간표 미리보기</div>
          </div>
        </div>
        
        {/* 옵션 단계 */}
        {currentStep === 'options' && (
          <div className="options-content">
            <div className="options-section">
              <h3>이미지 형식</h3>
              <div className="option-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="format"
                    value="png"
                    checked={downloadOptions.format === 'png'}
                    onChange={() => handleFormatChange('png')}
                  />
                  <span>PNG (투명도 지원)</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="format"
                    value="jpeg"
                    checked={downloadOptions.format === 'jpeg'}
                    onChange={() => handleFormatChange('jpeg')}
                  />
                  <span>JPEG (파일 크기 최적화)</span>
                </label>
              </div>
            </div>
            
            <div className="options-section">
              <h3>품질 설정</h3>
              <div className="option-group">
                <label>
                  품질: {Math.round(downloadOptions.quality * 100)}%
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={downloadOptions.quality}
                    onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
                  />
                </label>
              </div>
            </div>
            
            <div className="options-section">
              <h3>해상도 설정</h3>
              <div className="option-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="scale"
                    value={1}
                    checked={downloadOptions.scale === 1}
                    onChange={() => handleScaleChange(1)}
                  />
                  <span>1x (기본)</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="scale"
                    value={2}
                    checked={downloadOptions.scale === 2}
                    onChange={() => handleScaleChange(2)}
                  />
                  <span>2x (고품질)</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="scale"
                    value={3}
                    checked={downloadOptions.scale === 3}
                    onChange={() => handleScaleChange(3)}
                  />
                  <span>3x (프리미엄)</span>
                </label>
              </div>
            </div>
            
            <div className="options-section">
              <h3>파일명 설정</h3>
              <div className="option-group">
                <input
                  type="text"
                  placeholder="파일명을 입력하세요"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  className="filename-input"
                />
                <small>
                  현재 설정: {customFilename || '자동 생성됨'}
                  <br />
                  파일명을 입력하지 않으면 자동으로 생성됩니다.
                </small>
              </div>
            </div>
            
            <div className="options-section">
              <h3>배경 설정</h3>
              <div className="option-group">
                <label>
                  배경색:
                  <input
                    type="color"
                    value={downloadOptions.backgroundColor}
                    onChange={(e) => handleBackgroundColorChange(e.target.value)}
                    className="color-input"
                  />
                </label>
              </div>
            </div>
            
            <div className="options-section">
              <h3>표시 옵션</h3>
              <div className="option-group">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={downloadOptions.includeHeader}
                    onChange={(e) => handleIncludeHeaderChange(e.target.checked)}
                  />
                  <span>헤더 포함</span>
                </label>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={downloadOptions.includeTimeColumn}
                    onChange={(e) => handleIncludeTimeColumnChange(e.target.checked)}
                  />
                  <span>시간 열 포함</span>
                </label>
              </div>
            </div>
            
            {/* 빠른 설정 버튼들 */}
            <div className="quick-settings">
              <button
                type="button"
                onClick={resetDownloadOptions}
                className="quick-setting-btn"
              >
                기본 설정 (프리미엄)
              </button>
              <button
                type="button"
                onClick={setHighQualityOptions}
                className="quick-setting-btn"
              >
                고품질 설정 (프리미엄)
              </button>
            </div>
            
            {/* 설정 완료 버튼 */}
            <div className="setup-complete-section">
              <button
                type="button"
                onClick={handleCompleteSetup}
                className="setup-complete-btn"
              >
                ✅ 설정 완료
              </button>
              <small>설정을 완료하면 시간표 미리보기로 이동합니다.</small>
            </div>
          </div>
        )}
        
        {/* 미리보기 단계 */}
        {currentStep === 'preview' && (
          <div className="preview-content">
            <div className="preview-header">
              <h3>시간표 미리보기</h3>
              <p>다운로드될 이미지의 모습을 미리 확인할 수 있습니다.</p>
            </div>
            
            {/* 시간표 미리보기 */}
            <div className="timetable-with-name" style={{
              background: 'white',
              padding: '20px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {studentInfo?.name && (
                <h2 style={{
                  margin: '0 0 16px 0',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#1a1a1a',
                  whiteSpace: 'nowrap'
                }}>
                  {studentInfo.name}
                </h2>
              )}
              <TimetableWidget
                data={timetableData}
                startHour={9}
                endHour={23}
                showConflicts={true}
                showEmptySlots={true}
                showTimeLabels={true}
              />
            </div>
            
            {/* 시간표 크기 정보 표시 */}
            <div className="timetable-size-info">
              <small>
                시간표 크기: {timetableSize.width}px × {timetableSize.height}px
              </small>
            </div>
            
            {/* 미리보기 액션 버튼들 */}
            <div className="preview-actions">
              <button
                type="button"
                onClick={handleGoBack}
                className="go-back-btn"
              >
                ← 옵션으로 돌아가기
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="download-start-btn"
                disabled={isGenerating}
              >
                {isGenerating ? '다운로드 중...' : '📥 다운로드 시작'}
              </button>
            </div>
          </div>
        )}
        
        {/* 진행 상태 표시 */}
        {isGenerating && (
          <div className="download-progress">
            <div className="progress-header">
              <h4>{downloadProgress.message}</h4>
              <button onClick={cancelDownload} className="cancel-btn">
                취소
              </button>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${downloadProgress.progress}%` }}
              />
            </div>
            <div className="progress-text">
              {downloadProgress.progress}%
            </div>
          </div>
        )}
        
        {/* 결과 메시지 */}
        {lastResult && !isGenerating && (
          <div className={`result-message ${lastResult.success ? 'success' : 'error'}`}>
            <div className="result-icon">
              {lastResult.success ? '✅' : '❌'}
            </div>
            <div className="result-content">
              <div className="result-title">
                {lastResult.success ? '다운로드 완료!' : '다운로드 실패'}
              </div>
              <div className="result-message-text">
                {lastResult.message}
              </div>
              {lastResult.success && lastResult.filename && (
                <div className="result-filename">
                  파일명: {lastResult.filename}
                </div>
              )}
              {lastResult.success && lastResult.fileSize && (
                <div className="result-filesize">
                  파일 크기: {(lastResult.fileSize / 1024).toFixed(1)} KB
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
