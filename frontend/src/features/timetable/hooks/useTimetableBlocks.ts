import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { TimetableItem, TimeSlot, Class, Teacher } from '@shared/types';
import type { TimetableBlock } from '@shared/types/timetable.types';

// 블록 타입별 색상 매핑
const BLOCK_COLORS = {
  class: {
    backgroundColor: '#e3f2fd',
    textColor: '#1976d2',
    borderColor: '#2196f3'
  },
  exam: {
    backgroundColor: '#ffebee',
    textColor: '#d32f2f',
    borderColor: '#f44336'
  },
  break: {
    backgroundColor: '#fff3e0',
    textColor: '#f57c00',
    borderColor: '#ff9800'
  },
  meal: {
    backgroundColor: '#f3e5f5',
    textColor: '#7b1fa2',
    borderColor: '#9c27b0'
  },
  study: {
    backgroundColor: '#e8f5e8',
    textColor: '#388e3c',
    borderColor: '#4caf50'
  },
  custom: {
    backgroundColor: '#f5f5f5',
    textColor: '#616161',
    borderColor: '#9e9e9e'
  }
};

// 과목별 색상 매핑
const SUBJECT_COLORS = {
  korean: {
    backgroundColor: '#e0f2f1',
    textColor: '#00695c',
    borderColor: '#4db6ac'
  },
  math: {
    backgroundColor: '#e8eaf6',
    textColor: '#3f51b5',
    borderColor: '#9fa8da'
  },
  english: {
    backgroundColor: '#fce4ec',
    textColor: '#c2185b',
    borderColor: '#f48fb1'
  },
  science: {
    backgroundColor: '#e8f5e8',
    textColor: '#2e7d32',
    borderColor: '#66bb6a'
  },
  social: {
    backgroundColor: '#fff3e0',
    textColor: '#ef6c00',
    borderColor: '#ffb74d'
  },
  art: {
    backgroundColor: '#f3e5f5',
    textColor: '#7b1fa2',
    borderColor: '#ba68c8'
  },
  computer: {
    backgroundColor: '#e0f7fa',
    textColor: '#00838f',
    borderColor: '#4dd0e1'
  },
  counseling: {
    backgroundColor: '#f1f8e9',
    textColor: '#558b2f',
    borderColor: '#8bc34a'
  },
  test_prep: {
    backgroundColor: '#ffebee',
    textColor: '#c62828',
    borderColor: '#ef5350'
  },
  homework: {
    backgroundColor: '#fff8e1',
    textColor: '#f57f17',
    borderColor: '#ffca28'
  },
  review: {
    backgroundColor: '#e8eaf6',
    textColor: '#3949ab',
    borderColor: '#7986cb'
  },
  custom: {
    backgroundColor: '#f5f5f5',
    textColor: '#616161',
    borderColor: '#9e9e9e'
  }
};

// 수업 유형별 색상 매핑
const CLASS_TYPE_COLORS = {
  regular: {
    backgroundColor: '#e3f2fd',
    textColor: '#1976d2',
    borderColor: '#2196f3'
  },
  special: {
    backgroundColor: '#f3e5f5',
    textColor: '#7b1fa2',
    borderColor: '#9c27b0'
  },
  makeup: {
    backgroundColor: '#fff3e0',
    textColor: '#f57c00',
    borderColor: '#ff9800'
  },
  test: {
    backgroundColor: '#ffebee',
    textColor: '#d32f2f',
    borderColor: '#f44336'
  },
  counseling: {
    backgroundColor: '#e8f5e8',
    textColor: '#388e3c',
    borderColor: '#4caf50'
  },
  activity: {
    backgroundColor: '#fce4ec',
    textColor: '#c2185b',
    borderColor: '#f48fb1'
  }
};

export const useTimetableBlocks = () => {
  const timetableState = useSelector((state: any) => state.timetable);

  // 디버깅을 위한 로그
  console.log('useTimetableBlocks - timetableState:', {
    timetableItems: timetableState.timetableItems?.length || 0,
    timeSlots: timetableState.timeSlots?.length || 0,
    classes: timetableState.classes?.length || 0,
    teachers: timetableState.teachers?.length || 0,
    loading: timetableState.loading,
    error: timetableState.error
  });

  // 백엔드 데이터 상태 확인
  console.log('useTimetableBlocks - 백엔드 데이터 상태:', {
    hasTimetableItems: !!timetableState.timetableItems && timetableState.timetableItems.length > 0,
    hasTimeSlots: !!timetableState.timeSlots && timetableState.timeSlots.length > 0,
    hasClasses: !!timetableState.classes && timetableState.classes.length > 0,
    hasTeachers: !!timetableState.teachers && timetableState.teachers.length > 0,
    loading: timetableState.loading,
    error: timetableState.error
  });

  // TimetableItem을 TimetableBlock으로 변환
  const convertToBlocks = useMemo(() => {
    const { timetableItems, timeSlots, classes, teachers } = timetableState;
    
    console.log('convertToBlocks - 입력 데이터:', {
      timetableItems: timetableItems?.length || 0,
      timeSlots: timeSlots?.length || 0,
      classes: classes?.length || 0,
      teachers: teachers?.length || 0
    });
    
    if (!timetableItems || timetableItems.length === 0) {
      console.log('convertToBlocks - timetableItems가 없음, 빈 배열 반환');
      return [];
    }

    const blocks = timetableItems.map((item: TimetableItem) => {
      // 수업 정보 찾기
      const classInfo = classes?.find((c: Class) => c.id === item.classId);
      const teacherInfo = teachers?.find((t: Teacher) => t.id === item.teacherId);
      
      // 시간대 정보 찾기
      const timeSlot = timeSlots?.find((ts: TimeSlot) => ts.id === item.timeSlotId);
      
      console.log('convertToBlocks - 아이템 처리:', {
        itemId: item.id,
        classId: item.classId,
        teacherId: item.teacherId,
        timeSlotId: item.timeSlotId,
        classInfo: classInfo?.name,
        teacherInfo: teacherInfo?.name,
        timeSlot: timeSlot?.name,
        timeSlotStart: timeSlot?.startTime,
        timeSlotEnd: timeSlot?.endTime,
        notes: item.notes
      });
      
      // 블록 제목 생성
      let title = classInfo?.name || '수업';
      if (teacherInfo) {
        title += ` (${teacherInfo.name})`;
      }
      
      // 색상 결정 (과목 우선, 없으면 수업 유형)
      let colors = SUBJECT_COLORS.custom;
      if (classInfo?.subject) {
        colors = SUBJECT_COLORS[classInfo.subject as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.custom;
      } else if (classInfo?.classType) {
        colors = CLASS_TYPE_COLORS[classInfo.classType as keyof typeof CLASS_TYPE_COLORS] || CLASS_TYPE_COLORS.regular;
      }
      
      // 블록 타입 결정
      let blockType: 'class' | 'break' | 'meal' | 'study' | 'exam' | 'custom' = 'class';
      if (classInfo?.classType === 'test') {
        blockType = 'exam';
      } else if (classInfo?.subject === 'counseling') {
        blockType = 'custom';
      }
      
      // 시간대 결정 (notes에서 시간 추출 시도, 실패하면 기본값 사용)
      let startTime = timeSlot?.startTime || '09:00';
      let endTime = timeSlot?.endTime || '10:00';
      
      // notes에서 시간 정보 추출 시도
      if (item.notes) {
        const timeMatch = item.notes.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          const startHour = timeMatch[1].padStart(2, '0');
          const startMin = timeMatch[2];
          const endHour = timeMatch[3].padStart(2, '0');
          const endMin = timeMatch[4];
          startTime = `${startHour}:${startMin}`;
          endTime = `${endHour}:${endMin}`;
          console.log('convertToBlocks - notes에서 시간 추출:', { startTime, endTime });
        }
      }
      
      const block: TimetableBlock = {
        id: item.id,
        title,
        startTime,
        endTime,
        dayOfWeek: item.dayOfWeek,
        backgroundColor: colors.backgroundColor,
        textColor: colors.textColor,
        borderColor: colors.borderColor,
        type: blockType,
        notes: item.notes,
        className: `timetable-item-${item.id}`
      };
      
      return block;
    });

    console.log('convertToBlocks - 변환된 블록:', blocks.length, '개');
    return blocks;
  }, [timetableState.timetableItems, timetableState.timeSlots, timetableState.classes, timetableState.teachers]);

  // 필터링된 블록들
  const getFilteredBlocks = useMemo(() => {
    const filtered = convertToBlocks.filter(() => {
      // 여기에 필터링 로직 추가 가능
      return true;
    });
    console.log('getFilteredBlocks - 필터링된 블록:', filtered.length, '개');
    return filtered;
  }, [convertToBlocks]);

  return {
    blocks: getFilteredBlocks,
    allBlocks: convertToBlocks,
    isLoading: timetableState.loading,
    error: timetableState.error,
    hasData: convertToBlocks.length > 0
  };
};
