import { forwardRef } from 'react'
import { BaseWidget } from '../../base/BaseWidget'
import { Label } from '../../labels/Label'
import type { TimetableItem, DayOfWeek, TimeSlot } from '@shared/types'
import type { BaseWidgetProps } from '../../../types/components'
import './BaseTimetable.css'

export interface BaseTimetableProps extends BaseWidgetProps {
  timeSlots: TimeSlot[]
  timetableItems: TimetableItem[]
  onItemClick?: (item: TimetableItem) => void
  onItemEdit?: (item: TimetableItem) => void
  onItemDelete?: (item: TimetableItem) => void
  onCellClick?: (day: DayOfWeek, timeSlot: TimeSlot) => void
  isEditable?: boolean
  className?: string
}

export const BaseTimetable = forwardRef<HTMLDivElement, BaseTimetableProps>(
  ({ 
    timeSlots, 
    timetableItems, 
    onItemClick, 
    onItemEdit, 
    onItemDelete, 
    onCellClick,
    isEditable = false,
    className = '',
    ...props 
  }, ref) => {
    
    const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일']
    
    const getItemsForCell = (day: DayOfWeek, timeSlot: TimeSlot) => {
      return timetableItems.filter(item => 
        item.dayOfWeek === day && item.timeSlotId === timeSlot.id
      )
    }
    
    const handleCellClick = (day: DayOfWeek, timeSlot: TimeSlot) => {
      if (isEditable && onCellClick) {
        onCellClick(day, timeSlot)
      }
    }
    
    const handleItemClick = (item: TimetableItem) => {
      if (onItemClick) {
        onItemClick(item)
      }
    }
    
    const handleItemEdit = (e: React.MouseEvent, item: TimetableItem) => {
      e.stopPropagation()
      if (onItemEdit) {
        onItemEdit(item)
      }
    }
    
    const handleItemDelete = (e: React.MouseEvent, item: TimetableItem) => {
      e.stopPropagation()
      if (onItemDelete) {
        onItemDelete(item)
      }
    }
    
    return (
      <BaseWidget
        ref={ref}
        className={`base-timetable ${className}`}
        {...props}
      >
        <div className="timetable-container">
          {/* 요일 헤더 */}
          <div className="timetable-header">
            <div className="time-column-header"></div>
            {dayLabels.map((label, index) => (
              <div key={daysOfWeek[index]} className="day-header">
                <Label variant="default" size="small">
                  {label}
                </Label>
              </div>
            ))}
          </div>
          
          {/* 시간표 그리드 */}
          <div className="timetable-grid" style={{ ['--rows' as any]: timeSlots.length }}>
            {timeSlots.map((timeSlot) => (
              <div key={timeSlot.id} className="time-row">
                {/* 시간 열 */}
                <div className="time-column">
                  <Label variant="secondary" size="small" className="time-label">
                    {timeSlot.startTime}
                  </Label>
                </div>
                
                {/* 각 요일별 셀 */}
                {daysOfWeek.map((day) => {
                  const items = getItemsForCell(day, timeSlot)
                  
                  return (
                    <div 
                      key={`${day}-${timeSlot.id}`} 
                      className={`timetable-cell ${isEditable ? 'editable' : ''}`}
                      onClick={() => handleCellClick(day, timeSlot)}
                    >
                      {items.map((item) => (
                        <div 
                          key={item.id} 
                          className={`timetable-item ${item.status}`}
                          onClick={() => handleItemClick(item)}
                        >
                          <div className="item-content">
                            <Label variant="default" size="small" className="item-title">
                              {item.classId} {/* 실제로는 수업명을 표시해야 함 */}
                            </Label>
                            {isEditable && (
                              <div className="item-actions">
                                <button 
                                  className="edit-btn"
                                  onClick={(e) => handleItemEdit(e, item)}
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="delete-btn"
                                  onClick={(e) => handleItemDelete(e, item)}
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </BaseWidget>
    )
  }
)

BaseTimetable.displayName = 'BaseTimetable'
