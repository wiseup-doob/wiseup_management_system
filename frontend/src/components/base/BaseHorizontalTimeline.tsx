import { forwardRef } from 'react'
import { BaseWidget } from './BaseWidget'
import { Button } from '../buttons/Button'
import { Label } from '../labels/Label'
import type { BaseWidgetProps } from '../../types/components'
import './BaseHorizontalTimeline.css'

export interface TimelineItem {
  time: string // HH:MM 형식
  title: string
  description?: string
  status?: 'completed' | 'in-progress' | 'pending' | 'cancelled'
  icon?: string
}

export interface BaseHorizontalTimelineProps extends BaseWidgetProps {
  selectedDate: string
  timelineItems: TimelineItem[]
  onItemClick?: (item: TimelineItem) => void
  onBackClick?: () => void
  renderItemContent?: (item: TimelineItem) => React.ReactNode
}

export const BaseHorizontalTimeline = forwardRef<HTMLDivElement, BaseHorizontalTimelineProps>(
  ({ 
    selectedDate,
    timelineItems,
    onItemClick,
    onBackClick,
    renderItemContent,
    className = '',
    ...props 
  }, ref) => {

    // 날짜 포맷팅
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
      
      return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`
    }

    // 상태에 따른 스타일
    const getStatusStyle = (status?: string) => {
      switch (status) {
        case 'completed':
          return { 
            className: 'status-completed',
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            borderColor: '#4caf50'
          }
        case 'in-progress':
          return { 
            className: 'status-in-progress',
            backgroundColor: '#fff3e0',
            color: '#ef6c00',
            borderColor: '#ff9800'
          }
        case 'pending':
          return { 
            className: 'status-pending',
            backgroundColor: '#f5f5f5',
            color: '#666666',
            borderColor: '#9e9e9e'
          }
        case 'cancelled':
          return { 
            className: 'status-cancelled',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderColor: '#f44336'
          }
        default:
          return { 
            className: 'status-default',
            backgroundColor: '#ffffff',
            color: '#333333',
            borderColor: '#e0e0e0'
          }
      }
    }

    return (
      <BaseWidget
        ref={ref}
        className={`base-horizontal-timeline ${className}`}
        {...props}
      >
        {/* 헤더 */}
        <BaseWidget className="timeline-header">
          <Button
            variant="secondary"
            size="small"
            onClick={onBackClick}
            className="back-button"
          >
            ←
          </Button>
          <Label variant="heading" size="medium" className="date-title">
            {formatDate(selectedDate)}
          </Label>
        </BaseWidget>

        {/* 타임라인 컨테이너 */}
        <BaseWidget className="timeline-container">
          {timelineItems.length === 0 ? (
            <BaseWidget className="empty-timeline">
              <Label variant="default" size="small" className="empty-text">
                해당 날짜의 일정이 없습니다.
              </Label>
            </BaseWidget>
          ) : (
            <BaseWidget className="timeline-items">
              {timelineItems.map((item, index) => {
                const statusStyle = getStatusStyle(item.status)
                
                return (
                  <div
                    key={index}
                    className={`timeline-item ${statusStyle.className}`}
                    onClick={() => onItemClick?.(item)}
                  >
                    {/* 시간 표시 */}
                    <BaseWidget className="item-time">
                      <Label variant="default" size="small" className="time-label">
                        {item.time}
                      </Label>
                    </BaseWidget>

                    {/* 연결선 */}
                    {index < timelineItems.length - 1 && (
                      <BaseWidget className="timeline-connector" />
                    )}

                    {/* 아이템 콘텐츠 */}
                    <BaseWidget 
                      className="item-content"
                      style={{
                        backgroundColor: statusStyle.backgroundColor,
                        color: statusStyle.color,
                        borderColor: statusStyle.borderColor
                      }}
                    >
                      {renderItemContent ? (
                        renderItemContent(item)
                      ) : (
                        <>
                          <Label variant="default" size="medium" className="item-title">
                            {item.title}
                          </Label>
                          {item.description && (
                            <Label variant="default" size="small" className="item-description">
                              {item.description}
                            </Label>
                          )}
                        </>
                      )}
                    </BaseWidget>
                  </div>
                )
              })}
            </BaseWidget>
          )}
        </BaseWidget>
      </BaseWidget>
    )
  }
)

BaseHorizontalTimeline.displayName = 'BaseHorizontalTimeline' 