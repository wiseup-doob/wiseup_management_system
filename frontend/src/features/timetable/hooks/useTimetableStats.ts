import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { DayOfWeek, SubjectType } from '@shared/types'
import type { TimetableStats } from '../types/timetable.types'

export const useTimetableStats = () => {
  const timetableState = useSelector((state: any) => state.timetable)

  const stats: TimetableStats = useMemo(() => {
    const { timetableItems, classes, teachers, classrooms } = timetableState

    // 요일별 항목 수 계산
    const itemsByDay: Record<DayOfWeek, number> = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0
    }

    // 과목별 항목 수 계산
    const itemsBySubject: Record<SubjectType, number> = {
      korean: 0,
      math: 0,
      english: 0,
      science: 0,
      social: 0,
      art: 0,
      computer: 0,
      counseling: 0,
      test_prep: 0,
      homework: 0,
      review: 0,
      custom: 0
    }

    // 통계 계산
    timetableItems.forEach((item: any) => {
      // 요일별 카운트
      itemsByDay[item.dayOfWeek as DayOfWeek]++

      // 과목별 카운트 (수업 정보와 연결)
      const classInfo = classes.find((c: any) => c.id === item.classId)
      if (classInfo) {
        itemsBySubject[classInfo.subject as SubjectType]++
      }
    })

    return {
      totalItems: timetableItems.length,
      totalClasses: classes.length,
      totalTeachers: teachers.length,
      totalClassrooms: classrooms.length,
      itemsByDay,
      itemsBySubject
    }
  }, [timetableState.timetableItems, timetableState.classes, timetableState.teachers, timetableState.classrooms])

  return stats
}
