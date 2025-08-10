import React, { forwardRef, useMemo } from 'react';
import type { BaseWidgetProps } from '../../../types/components';
import type { 
  TimetableBlock, 
  TimetableCell, 
  TimetableGrid, 
  TimetableRenderOptions, 
  TimetableEventHandlers,
  TimetableStyles,
  DayOfWeek
} from '@shared/types/timetable.types';
import type { TimeString } from '@shared/types/common.types';
import './TimeTable.css';

export interface TimeTableProps extends BaseWidgetProps {
  blocks: TimetableBlock[];
  options?: Partial<TimetableRenderOptions>;
  eventHandlers?: TimetableEventHandlers;
  styles?: Partial<TimetableStyles>;
  className?: string;
}

// 기본 렌더링 옵션
const defaultOptions: TimetableRenderOptions = {
  showTimeHeaders: true,
  showDayHeaders: true,
  cellHeight: 30,
  cellWidth: 65,
  headerHeight: 28,
  headerWidth: 50,
  borderColor: '#e0e0e0',
  backgroundColor: '#ffffff',
  emptyCellColor: '#fafafa',
  hoverEffect: true,
  responsive: true
};

// 기본 스타일
const defaultStyles: TimetableStyles = {
  grid: {
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    headerBackgroundColor: '#f5f5f5',
    headerTextColor: '#333333',
    cellBorderColor: '#e0e0e0',
    emptyCellColor: '#fafafa'
  },
  block: {
    defaultColor: '#e3f2fd',
    defaultTextColor: '#1976d2',
    defaultBorderColor: '#2196f3',
    hoverEffect: false,
    borderRadius: '1px', // 더 작은 둥근 모서리
    padding: '0px 2px', // 패딩 줄임
    fontSize: '9px',
    fontWeight: '500'
  },
  timeHeader: {
    backgroundColor: '#f5f5f5',
    textColor: '#333333',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px'
  },
  dayHeader: {
    backgroundColor: '#f5f5f5',
    textColor: '#333333',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px'
  }
};

// 요일 순서
const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// 요일 한글 표시
const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: '월',
  tuesday: '화',
  wednesday: '수',
  thursday: '목',
  friday: '금',
  saturday: '토',
  sunday: '일'
};

// 시간대 생성 (백엔드 데이터 기반으로 동적 생성)
const generateTimeSlots = (blocks: TimetableBlock[]): TimeString[] => {
  const timeSet = new Set<TimeString>();
  
  // 기본 시간대 (9:00 ~ 23:00)
  for (let hour = 9; hour <= 23; hour++) {
    timeSet.add(`${hour.toString().padStart(2, '0')}:00`);
  }
  
  // 블록에서 사용되는 시간대 추가
  blocks.forEach(block => {
    timeSet.add(block.startTime);
    timeSet.add(block.endTime);
  });
  
  // 시간순으로 정렬
  const sortedTimes = Array.from(timeSet).sort((a, b) => {
    const timeA = timeToMinutes(a);
    const timeB = timeToMinutes(b);
    return timeA - timeB;
  });
  
  console.log('generateTimeSlots - 생성된 시간대:', sortedTimes);
  return sortedTimes;
};

// 시간을 분으로 변환
const timeToMinutes = (time: TimeString): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 분을 시간으로 변환
const minutesToTime = (minutes: number): TimeString => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// 시작 시각 기준 경과 분
const minutesFromStart = (time: TimeString, startTime: TimeString): number => {
  return timeToMinutes(time) - timeToMinutes(startTime);
};

// 균일 시간 슬롯(표시용) 생성
const buildUniformSlots = (
  startTime: TimeString,
  endTime: TimeString,
  slotMinutes: number
): TimeString[] => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const slots: TimeString[] = [];
  for (let m = start; m <= end; m += slotMinutes) {
    slots.push(minutesToTime(m));
  }
  return slots;
};

// 블록의 지속 시간 계산 (분 단위)
const getBlockDuration = (block: TimetableBlock): number => {
  const startMinutes = timeToMinutes(block.startTime);
  const endMinutes = timeToMinutes(block.endTime);
  return endMinutes - startMinutes;
};

// 블록의 시작 시간을 기준으로 정확한 위치를 계산
const getBlockPosition = (block: TimetableBlock, options: TimetableRenderOptions, timeSlots: TimeString[]): { top: number } => {
  // 블록의 시작 시간이 timeSlots에서 몇 번째 인덱스인지 찾기
  const timeIndex = timeSlots.findIndex(time => time === block.startTime);
  
  if (timeIndex === -1) {
    // 시간대를 찾을 수 없으면 0으로 설정
    console.warn(`시간대를 찾을 수 없음: ${block.startTime}`, block);
    return { top: 0 };
  }
  
  // 해당 인덱스에 셀 높이를 곱해서 위치 계산
  const top = timeIndex * options.cellHeight;
  
  return { top };
};

// 시간표 그리드 생성
const createTimetableGrid = (blocks: TimetableBlock[]): TimetableGrid => {
  const timeSlots = generateTimeSlots(blocks);
  const daysOfWeek = DAYS_OF_WEEK;
  const cells: TimetableCell[][] = [];

  // 각 시간대별로 셀 생성
  for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
    const time = timeSlots[timeIndex];
    const row: TimetableCell[] = [];

    // 각 요일별로 셀 생성
    for (let dayIndex = 0; dayIndex < daysOfWeek.length; dayIndex++) {
      const dayOfWeek = daysOfWeek[dayIndex];
      
      // 해당 시간대와 요일에 시작하는 블록들 찾기
      const cellBlocks = blocks.filter(block => 
        block.dayOfWeek === dayOfWeek && 
        block.startTime === time
      );

      const cell: TimetableCell = {
        time,
        dayOfWeek,
        blocks: cellBlocks,
        isEmpty: cellBlocks.length === 0
      };

      row.push(cell);
    }

    cells.push(row);
  }

  return {
    timeSlots,
    daysOfWeek,
    cells
  };
};

// 블록 절대 배치 스타일 계산
const getAbsoluteBlockStyle = (
  block: TimetableBlock,
  styles: TimetableStyles,
  top: number,
  height: number,
  leftPercent: number,
  widthPercent: number
) => {
  const baseStyle: React.CSSProperties = {
    backgroundColor: block.backgroundColor || styles.block.defaultColor,
    color: block.textColor || styles.block.defaultTextColor,
    border: `1px solid ${block.borderColor || styles.block.defaultBorderColor}`,
    borderRadius: styles.block.borderRadius,
    padding: styles.block.padding,
    fontSize: styles.block.fontSize,
    fontWeight: styles.block.fontWeight,
    textAlign: 'center' as const,
    cursor: 'pointer',
    userSelect: 'none' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    position: 'absolute' as const,
    top: `${top}px`,
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    height: `${height}px`,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box' as const
  };
  return baseStyle;
};

// 요일 컬럼 컨테이너 스타일
const getDayColumnStyle = (totalHeight: number, styles: TimetableStyles, cellWidth: number, responsive?: boolean) => {
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    height: `${totalHeight}px`,
    borderLeft: `1px solid ${styles.grid.cellBorderColor}`,
    borderRight: `1px solid ${styles.grid.cellBorderColor}`,
    width: responsive ? '100%' : `${cellWidth}px`,
    boxSizing: 'border-box'
  };
  return baseStyle;
};

type LaidOutBlock = TimetableBlock & {
  top: number;
  height: number;
  columnIndex: number;
  columnCount: number;
  leftPercent: number;
  widthPercent: number;
};

// 블록 사각형(top/height) 계산
const computeBlockRect = (
  block: TimetableBlock,
  startTime: TimeString,
  pixelsPerMinute: number,
  minBlockHeight: number
) => {
  const start = minutesFromStart(block.startTime, startTime);
  const end = minutesFromStart(block.endTime, startTime);
  const top = Math.max(0, Math.round(start * pixelsPerMinute));
  const height = Math.max(Math.round((end - start) * pixelsPerMinute), minBlockHeight);
  return { top, height };
};

// 겹치는 묶음(클러스터) 생성 - dayBlocks의 인덱스 배열들 반환
const buildClusters = (dayBlocks: TimetableBlock[]) => {
  const events: Array<{ t: number; type: 'start' | 'end'; idx: number }> = [];
  dayBlocks.forEach((b, i) => {
    events.push({ t: timeToMinutes(b.startTime), type: 'start', idx: i });
    events.push({ t: timeToMinutes(b.endTime), type: 'end', idx: i });
  });
  events.sort((a, b) => (a.t - b.t) || (a.type === 'end' ? -1 : 1));
  const clusters: number[][] = [];
  const active = new Set<number>();
  let current: number[] = [];
  for (const e of events) {
    if (e.type === 'start') {
      active.add(e.idx);
      current.push(e.idx);
    } else {
      active.delete(e.idx);
    }
    if (active.size === 0 && current.length) {
      clusters.push(current);
      current = [];
    }
  }
  return clusters;
};

// 클러스터 내 컬럼 배치
const layoutCluster = (
  clusterBlocks: TimetableBlock[],
  startTime: TimeString,
  pixelsPerMinute: number,
  minBlockHeight: number
): LaidOutBlock[] => {
  const sorted = [...clusterBlocks].sort((a, b) =>
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime) ||
    timeToMinutes(a.endTime) - timeToMinutes(b.endTime)
  );
  type ActiveItem = { end: number; col: number };
  const active: ActiveItem[] = [];
  const freeCols: number[] = [];
  let maxCols = 0;
  const out: LaidOutBlock[] = [];

  for (const b of sorted) {
    const start = timeToMinutes(b.startTime);
    const end = timeToMinutes(b.endTime);
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].end <= start) {
        freeCols.push(active[i].col);
        active.splice(i, 1);
      }
    }
    const col = freeCols.length ? freeCols.pop()! : active.length;
    active.push({ end, col });
    maxCols = Math.max(maxCols, active.length);
    const { top, height } = computeBlockRect(b, startTime, pixelsPerMinute, minBlockHeight);
    out.push({ ...b, top, height, columnIndex: col, columnCount: 0, leftPercent: 0, widthPercent: 0 });
  }

  return out.map(b => {
    const widthPercent = 100 / maxCols;
    const leftPercent = b.columnIndex * widthPercent;
    return { ...b, columnCount: maxCols, widthPercent, leftPercent };
  });
};

// 요일별 레이아웃 생성
const layoutDay = (
  dayBlocks: TimetableBlock[],
  startTime: TimeString,
  pixelsPerMinute: number,
  minBlockHeight: number
) => {
  const clusters = buildClusters(dayBlocks);
  const result: LaidOutBlock[] = [];
  for (const clusterIdxs of clusters) {
    const blocksInCluster = clusterIdxs.map(i => dayBlocks[i]);
    result.push(...layoutCluster(blocksInCluster, startTime, pixelsPerMinute, minBlockHeight));
  }
  return result;
};

export const TimeTable = forwardRef<HTMLDivElement, TimeTableProps>(
  ({ 
    blocks, 
    options = {}, 
    eventHandlers = {}, 
    styles = {}, 
    className = '',
    ...props 
  }, ref) => {
    // 옵션과 스타일 병합
    const mergedOptions = { ...defaultOptions, ...options };
    const mergedStyles = { ...defaultStyles, ...styles };

    // 절대 배치용 파생 옵션
    const startTime: TimeString = (options.startTime as TimeString) || '09:00';
    const endTime: TimeString = (options.endTime as TimeString) || '23:00';
    const slotMinutes: number = options.slotMinutes ?? 60;
    const pixelsPerMinute: number = options.pixelsPerMinute ?? (mergedOptions.cellHeight / slotMinutes);
    const gutter: number = options.gutter ?? 2;
    const minBlockHeight: number = options.minBlockHeight ?? 8;

    const slots = useMemo(() => buildUniformSlots(startTime, endTime, slotMinutes), [startTime, endTime, slotMinutes]);
    const totalMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);
    const intervalCount = Math.max(0, Math.floor(totalMinutes / slotMinutes));
    const rowCount = intervalCount + 1; // 마지막 23:00 행까지 포함
    const totalHeightPx = Math.max(0, Math.round(rowCount * slotMinutes * pixelsPerMinute));

    // 요일별 블록 레이아웃 계산
    const blocksByDay = useMemo(() => {
      const map: Record<DayOfWeek, LaidOutBlock[]> = {
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
      };
      DAYS_OF_WEEK.forEach(day => {
        const dayBlocks = blocks.filter(b => b.dayOfWeek === day);
        map[day] = layoutDay(dayBlocks, startTime, pixelsPerMinute, minBlockHeight);
      });
      return map;
    }, [blocks, startTime, pixelsPerMinute, minBlockHeight]);

    // 이벤트 핸들러
    const handleBlockClick = (block: TimetableBlock) => {
      eventHandlers.onBlockClick?.(block);
    };

    const handleCellClick = (cell: TimetableCell) => {
      eventHandlers.onCellClick?.(cell);
    };

    const handleBlockHover = (block: TimetableBlock) => {
      eventHandlers.onBlockHover?.(block);
    };

    const handleCellHover = (cell: TimetableCell) => {
      eventHandlers.onCellHover?.(cell);
    };

    const onDayColumnClick = (e: React.MouseEvent<HTMLDivElement>, day: DayOfWeek) => {
      if (!eventHandlers.onCellClick) return;
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const totalMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);
      const minutes = Math.max(0, Math.min(totalMinutes, Math.round(y / pixelsPerMinute)));
      const snapped = Math.round(minutes / slotMinutes) * slotMinutes;
      const snappedTime = minutesToTime(timeToMinutes(startTime) + snapped) as TimeString;
      const cellBlocks = blocks.filter(b => b.dayOfWeek === day && b.startTime === snappedTime);
      const cell: TimetableCell = { time: snappedTime, dayOfWeek: day, blocks: cellBlocks, isEmpty: cellBlocks.length === 0 };
      handleCellClick(cell);
    };

    const onDayColumnHover = (e: React.MouseEvent<HTMLDivElement>, day: DayOfWeek) => {
      if (!eventHandlers.onCellHover) return;
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const totalMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);
      const minutes = Math.max(0, Math.min(totalMinutes, Math.round(y / pixelsPerMinute)));
      const snapped = Math.round(minutes / slotMinutes) * slotMinutes;
      const snappedTime = minutesToTime(timeToMinutes(startTime) + snapped) as TimeString;
      const cellBlocks = blocks.filter(b => b.dayOfWeek === day && b.startTime === snappedTime);
      const cell: TimetableCell = { time: snappedTime, dayOfWeek: day, blocks: cellBlocks, isEmpty: cellBlocks.length === 0 };
      handleCellHover(cell);
    };

    return (
      <div 
        ref={ref}
        className={`timetable ${className}`}
        style={{
          border: `1px solid ${mergedStyles.grid.borderColor}`,
          backgroundColor: mergedStyles.grid.backgroundColor,
          overflow: 'auto',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
        {...props}
      >
        {/* 헤더 */}
        {mergedOptions.showDayHeaders && (
          <div style={{ display: 'grid', gridTemplateColumns: `${mergedOptions.headerWidth}px repeat(${DAYS_OF_WEEK.length}, ${mergedOptions.responsive ? '1fr' : `${mergedOptions.cellWidth}px`})` }}>
            <div
              style={{
                width: `${mergedOptions.headerWidth}px`,
                height: `${mergedOptions.headerHeight}px`,
                backgroundColor: mergedStyles.grid.headerBackgroundColor,
                color: mergedStyles.grid.headerTextColor,
                border: `1px solid ${mergedStyles.grid.borderColor}`,
                fontSize: mergedStyles.dayHeader.fontSize,
                fontWeight: mergedStyles.dayHeader.fontWeight,
                padding: mergedStyles.dayHeader.padding,
                textAlign: 'center' as const
              }}
            >
              시간
            </div>
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                style={{
                  width: mergedOptions.responsive ? '100%' : `${mergedOptions.cellWidth}px`,
                  height: `${mergedOptions.headerHeight}px`,
                  backgroundColor: mergedStyles.grid.headerBackgroundColor,
                  color: mergedStyles.grid.headerTextColor,
                  border: `1px solid ${mergedStyles.grid.borderColor}`,
                  fontSize: mergedStyles.dayHeader.fontSize,
                  fontWeight: mergedStyles.dayHeader.fontWeight,
                  padding: mergedStyles.dayHeader.padding,
                  textAlign: 'center' as const
                }}
              >
                {DAY_LABELS[day]}
              </div>
            ))}
          </div>
        )}

        {/* 본문: 좌측 시간 레일 + 7개 요일 컬럼 */}
        <div style={{ display: 'grid', gridTemplateColumns: `${mergedOptions.headerWidth}px repeat(${DAYS_OF_WEEK.length}, ${mergedOptions.responsive ? '1fr' : `${mergedOptions.cellWidth}px`})` }}>
          {/* 시간 레일 */}
          <div style={{ position: 'relative', height: `${rowCount * slotMinutes * pixelsPerMinute}px` }}>
            {mergedOptions.showTimeHeaders && (
              <>
                {Array.from({ length: rowCount }).map((_, idx) => (
                  <div
                    key={`time-cell-${idx}`}
                    style={{
                      width: `${mergedOptions.headerWidth}px`,
                      height: `${slotMinutes * pixelsPerMinute}px`,
                      backgroundColor: mergedStyles.timeHeader.backgroundColor,
                      color: mergedStyles.timeHeader.textColor,
                      border: `1px solid ${mergedStyles.grid.borderColor}`,
                      fontSize: mergedStyles.timeHeader.fontSize,
                      fontWeight: mergedStyles.timeHeader.fontWeight,
                      padding: mergedStyles.timeHeader.padding,
                      textAlign: 'center' as const,
                      boxSizing: 'border-box' as const
                    }}
                  >
                    {slots[idx] ?? endTime}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* 요일 컬럼들 */}
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              style={{ ...getDayColumnStyle(totalHeightPx, mergedStyles, mergedOptions.cellWidth, mergedOptions.responsive), paddingBottom: `${mergedOptions.headerHeight}px` }}
              onClick={(e) => onDayColumnClick(e, day)}
              onMouseMove={(e) => onDayColumnHover(e, day)}
            >
              {/* 슬롯 가이드 라인 */}
              {Array.from({ length: rowCount }).map((_, idx) => (
                <div key={`${day}-${idx}`} style={{
                  position: 'absolute',
                  top: `${idx * slotMinutes * pixelsPerMinute}px`,
                  left: 0,
                  right: 0,
                  height: `${slotMinutes * pixelsPerMinute}px`,
                  borderTop: `1px solid ${mergedStyles.grid.cellBorderColor}`,
                  boxSizing: 'border-box'
                }} />
              ))}

              {/* 블록 렌더링 */}
              {blocksByDay[day].map((block) => {
                const style = getAbsoluteBlockStyle(
                  block,
                  mergedStyles,
                  block.top,
                  block.height,
                  block.leftPercent,
                  block.widthPercent
                );
                return (
                  <div
                    key={block.id}
                    style={style}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBlockClick(block);
                    }}
                    onMouseEnter={() => handleBlockHover(block)}
                    className={`timetable-block ${block.className || ''}`}
                    data-type={block.type || 'custom'}
                    title={block.notes || block.title}
                  >
                    {block.title}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

TimeTable.displayName = 'TimeTable';
