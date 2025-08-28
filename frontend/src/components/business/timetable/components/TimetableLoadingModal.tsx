import React, { useState, useEffect, useRef } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TimetableWidget } from '../TimetableWidget'
import './TimetableLoadingModal.css'

interface TimetableLoadingModalProps {
  isOpen: boolean
  students: Array<{
    id: string
    name: string
    grade: string
    status: string
    timetableData?: any
  }>
  onLoadingComplete: (renderedElements: { [key: string]: HTMLElement }) => void
  onClose: () => void
}

export const TimetableLoadingModal: React.FC<TimetableLoadingModalProps> = ({
  isOpen,
  students,
  onLoadingComplete,
  onClose
}) => {
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [renderedElements, setRenderedElements] = useState<{ [key: string]: HTMLElement }>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const renderAreaRef = useRef<HTMLDivElement>(null)
  const currentRootRef = useRef<any>(null)

  // 학생별 시간표 렌더링
  const renderStudentTimetable = async (student: any, index: number) => {
    if (!renderAreaRef.current) return

    try {
      console.log(`🎯 ${student.name} 시간표 렌더링 시작 (${index + 1}/${students.length})`)
      
      // 이전 렌더링 정리
      if (currentRootRef.current) {
        currentRootRef.current.unmount()
      }

      // React와 ReactDOM import
      const React = await import('react')
      const { createRoot } = await import('react-dom/client')

      // TimetableWidget 렌더링
      const timetableWidgetElement = React.createElement(TimetableWidget, {
        data: student.timetableData?.classSections || [],
        startHour: 9,
        endHour: 20,
        showTimeLabels: true,
        showEmptySlots: true,
        className: 'bulk-download-timetable'
      })

      // DndProvider로 감싸기
      const dndProviderElement = React.createElement(DndProvider, {
        backend: HTML5Backend
      }, timetableWidgetElement)

      // 렌더링 영역 정리
      renderAreaRef.current.innerHTML = ''
      
      // 새로운 root 생성 및 렌더링
      const root = createRoot(renderAreaRef.current)
      currentRootRef.current = root
      root.render(dndProviderElement)

      // 렌더링 완료까지 대기
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // DOM 요소 찾기 및 저장
      const foundTimetableElement = renderAreaRef.current.querySelector('.timetable-widget')
      if (foundTimetableElement) {
        const clonedElement = foundTimetableElement.cloneNode(true) as HTMLElement
        setRenderedElements(prev => ({
          ...prev,
          [student.id]: clonedElement
        }))
        
        console.log(`✅ ${student.name} 시간표 렌더링 완료`)
      } else {
        console.error(`❌ ${student.name} 시간표 요소를 찾을 수 없습니다`)
      }

      // 진행률 업데이트
      const progress = ((index + 1) / students.length) * 100
      setLoadingProgress(progress)
      setCurrentStudentIndex(index + 1)

    } catch (error) {
      console.error(`${student.name} 시간표 렌더링 실패:`, error)
    }
  }

  // 순차적 렌더링 시작
  useEffect(() => {
    if (isOpen && students.length > 0 && !isLoading) {
      setIsLoading(true)
      setCurrentStudentIndex(0)
      setLoadingProgress(0)
      setRenderedElements({})
      
      const renderSequentially = async () => {
        for (let i = 0; i < students.length; i++) {
          await renderStudentTimetable(students[i], i)
          // 다음 학생 렌더링 전 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
        // 모든 렌더링 완료
        setIsLoading(false)
        console.log('🎉 모든 학생 시간표 렌더링 완료:', renderedElements)
        onLoadingComplete(renderedElements)
      }
      
      renderSequentially()
    }
  }, [isOpen, students, onLoadingComplete])

  if (!isOpen) return null

  return (
    <div className="timetable-loading-modal-overlay">
      <div className="timetable-loading-modal">
        <div className="modal-header">
          <h2>시간표 렌더링 중...</h2>
        </div>
        
        <div className="loading-content">
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            
            <div className="progress-info">
              <div className="progress-text">
                {currentStudentIndex > 0 && currentStudentIndex <= students.length
                  ? `${students[currentStudentIndex - 1]?.name} 처리 중...`
                  : '준비 중...'
                }
              </div>
              <div className="progress-counts">
                진행: {currentStudentIndex} | 전체: {students.length}
              </div>
              <div className="progress-percentage">
                {Math.round(loadingProgress)}%
              </div>
            </div>
          </div>
          
          {/* 렌더링 영역 (숨김) */}
          <div 
            ref={renderAreaRef}
            className="render-area"
            style={{
              position: 'absolute',
              left: '-9999px',
              top: '-9999px',
              width: '740px',
              height: '892px',
              overflow: 'hidden',
              zIndex: -1,
              visibility: 'hidden'
            }}
          />
        </div>
        
        <div className="modal-footer">
          <button 
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            {isLoading ? '렌더링 중...' : '닫기'}
          </button>
        </div>
      </div>
    </div>
  )
}
