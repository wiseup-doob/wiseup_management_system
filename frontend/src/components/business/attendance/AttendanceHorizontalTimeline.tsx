import React from 'react'
import { BaseHorizontalTimeline, type TimelineItem } from '../../base/BaseHorizontalTimeline'
import { Label } from '../../labels/Label'
import type { BaseWidgetProps } from '../../../types/components'
import type { AttendanceTimelineItem } from '@shared/types/attendance.types'
import type { AttendanceStatus } from '@shared/types/common.types'
import { ATTENDANCE_STATUS_STYLES, ATTENDANCE_TO_TIMELINE_STATUS } from '@shared/types/attendance.types'
import './AttendanceHorizontalTimeline.css'

export interface AttendanceHorizontalTimelineProps extends BaseWidgetProps {
  selectedDate: string
  attendanceItems: AttendanceTimelineItem[]
  onItemClick?: (item: AttendanceTimelineItem) => void
  onBackClick?: () => void
}

export const AttendanceHorizontalTimeline = React.forwardRef<HTMLDivElement, AttendanceHorizontalTimelineProps>(
  ({ 
    selectedDate,
    attendanceItems,
    onItemClick,
    onBackClick,
    className = '',
    ...props 
  }, ref) => {

    // 출결 상태에 따른 타임라인 아이템 변환
    const convertToTimelineItems = (): TimelineItem[] => {
      return attendanceItems.map(item => {
        const statusInfo = ATTENDANCE_STATUS_STYLES[item.status]
        const timelineStatus = ATTENDANCE_TO_TIMELINE_STATUS[item.status]

        return {
          time: item.time,
          title: statusInfo.text,
          description: item.location ? `위치: ${item.location}` : item.notes,
          status: timelineStatus
        }
      })
    }

    // 아이템 클릭 핸들러
    const handleItemClick = (timelineItem: TimelineItem) => {
      const attendanceItem = attendanceItems.find(item => 
        item.time === timelineItem.time && item.activity === timelineItem.title
      )
      if (attendanceItem) {
        onItemClick?.(attendanceItem)
      }
    }

    // 커스텀 아이템 렌더링
    const renderItemContent = (timelineItem: TimelineItem) => {
      const attendanceItem = attendanceItems.find(item => 
        item.time === timelineItem.time && item.activity === timelineItem.title
      )

      return (
        <div className="attendance-timeline-content">
          <Label variant="default" size="medium" className="attendance-title">
            {timelineItem.title}
          </Label>
          {timelineItem.description && (
            <Label variant="default" size="small" className="attendance-description">
              {timelineItem.description}
            </Label>
          )}
          {attendanceItem?.notes && attendanceItem.notes !== timelineItem.description && (
            <Label variant="default" size="small" className="attendance-notes">
              {attendanceItem.notes}
            </Label>
          )}
        </div>
      )
    }

    return (
      <BaseHorizontalTimeline
        ref={ref}
        selectedDate={selectedDate}
        timelineItems={convertToTimelineItems()}
        onItemClick={handleItemClick}
        onBackClick={onBackClick}
        renderItemContent={renderItemContent}
        className={`attendance-horizontal-timeline ${className}`}
        {...props}
      />
    )
  }
)

AttendanceHorizontalTimeline.displayName = 'AttendanceHorizontalTimeline' 