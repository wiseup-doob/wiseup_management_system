import type { ClassSectionWithSchedule, ClassSchedule } from '../types/timetable.types'

// 시간을 분 단위로 변환
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// 두 시간 범위가 겹치는지 확인
export const isTimeOverlapping = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const start1Minutes = timeToMinutes(start1)
  const end1Minutes = timeToMinutes(end1)
  const start2Minutes = timeToMinutes(start2)
  const end2Minutes = timeToMinutes(end2)
  
  // 겹치는 조건: (start1 < end2) && (start2 < end1)
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes
}

// 특정 요일의 시간 충돌 검사
export const checkDayTimeConflict = (
  newSchedule: ClassSchedule,
  existingSchedules: ClassSchedule[]
): { hasConflict: boolean; conflictingClasses: string[] } => {
  const conflicts: string[] = []
  
  for (const existing of existingSchedules) {
    if (isTimeOverlapping(
      newSchedule.startTime,
      newSchedule.endTime,
      existing.startTime,
      existing.endTime
    )) {
      conflicts.push(`${existing.startTime}-${existing.endTime}`)
    }
  }
  
  return {
    hasConflict: conflicts.length > 0,
    conflictingClasses: conflicts
  }
}

// 전체 시간표에서 충돌 검사
export const checkTimetableConflicts = (
  newClassSection: ClassSectionWithSchedule,
  existingTimetable: {
    classSections: ClassSectionWithSchedule[]
  }
): {
  hasConflict: boolean
  conflicts: Array<{
    dayOfWeek: string
    conflictingTime: string
    conflictingClass: string
    message: string
  }>
} => {
  const conflicts: Array<{
    dayOfWeek: string
    conflictingTime: string
    conflictingClass: string
    message: string
  }> = []
  
  // 새로 추가하려는 수업의 각 스케줄에 대해 검사
  if (!newClassSection.schedule) {
    console.warn('⚠️ newClassSection.schedule이 undefined입니다.')
    return { hasConflict: false, conflicts: [] }
  }
  
  newClassSection.schedule.forEach(newSchedule => {
    const dayOfWeek = newSchedule.dayOfWeek
    
    // 해당 요일의 기존 수업들 찾기 (안전한 접근)
    const existingClassesOnDay = existingTimetable.classSections.filter(
      existing => existing && existing.schedule && existing.schedule.some(s => s && s.dayOfWeek === dayOfWeek)
    )
    
    // 각 기존 수업과 시간 충돌 검사
    existingClassesOnDay.forEach(existingClass => {
      if (existingClass.schedule) {
        existingClass.schedule
          .filter(s => s && s.dayOfWeek === dayOfWeek)
          .forEach(existingSchedule => {
          if (isTimeOverlapping(
            newSchedule.startTime,
            newSchedule.endTime,
            existingSchedule.startTime,
            existingSchedule.endTime
          )) {
            conflicts.push({
              dayOfWeek,
              conflictingTime: `${existingSchedule.startTime}-${existingSchedule.endTime}`,
              conflictingClass: existingClass.name,
              message: `${dayOfWeek} ${existingSchedule.startTime}-${existingSchedule.endTime}에 ${existingClass.name} 수업이 있습니다.`
            })
          }
        })
      }
    })
  })
  
  return {
    hasConflict: conflicts.length > 0,
    conflicts
  }
}

// 학생별 시간 충돌 검사 (같은 학생이 같은 시간에 여러 수업을 들을 수 없음)
export const checkStudentTimeConflict = (
  newClassSection: ClassSectionWithSchedule,
  existingTimetable: {
    classSections: ClassSectionWithSchedule[]
  }
): {
  hasConflict: boolean
  conflicts: Array<{
    dayOfWeek: string
    conflictingTime: string
    conflictingClass: string
    message: string
  }>
} => {
  return checkTimetableConflicts(newClassSection, existingTimetable)
}

// 교사별 시간 충돌 검사 (같은 교사가 같은 시간에 여러 수업을 가질 수 없음)
export const checkTeacherTimeConflict = (
  newClassSection: ClassSectionWithSchedule,
  existingTimetables: Array<{
    classSections: ClassSectionWithSchedule[]
  }>,
  teacherName: string
): {
  hasConflict: boolean
  conflicts: Array<{
    dayOfWeek: string
    conflictingTime: string
    conflictingClass: string
    message: string
  }>
} => {
  const conflicts: Array<{
    dayOfWeek: string
    conflictingTime: string
    conflictingClass: string
    message: string
  }> = []
  
  // 안전한 배열 접근
  const safeExistingTimetables = existingTimetables || []
  
  // 새로 추가하려는 수업의 각 스케줄에 대해 검사
  if (newClassSection.schedule) {
    newClassSection.schedule.forEach(newSchedule => {
      const dayOfWeek = newSchedule.dayOfWeek
      
      // 모든 시간표에서 해당 교사의 수업 찾기
      safeExistingTimetables.forEach(timetable => {
        if (timetable && timetable.classSections) {
          const teacherClassesOnDay = timetable.classSections.filter(
            existing => existing && 
                       existing.teacher?.name === teacherName &&
                       existing.schedule && 
                       existing.schedule.some(s => s && s.dayOfWeek === dayOfWeek)
          )
          
          // 각 교사 수업과 시간 충돌 검사
          teacherClassesOnDay.forEach(existingClass => {
            if (existingClass.schedule) {
              existingClass.schedule
                .filter(s => s && s.dayOfWeek === dayOfWeek)
                .forEach(existingSchedule => {
                  if (isTimeOverlapping(
                    newSchedule.startTime,
                    newSchedule.endTime,
                    existingSchedule.startTime,
                    existingSchedule.endTime
                  )) {
                    conflicts.push({
                      dayOfWeek,
                      conflictingTime: `${existingSchedule.startTime}-${existingSchedule.endTime}`,
                      conflictingClass: existingClass.name,
                      message: `${dayOfWeek} ${existingSchedule.startTime}-${existingSchedule.endTime}에 ${existingClass.name} 수업이 있습니다. (${teacherName} 선생님)`
                    })
                  }
                })
            }
          })
        }
      })
    })
  }
  
  return {
    hasConflict: conflicts.length > 0,
    conflicts
  }
}

// 강의실별 시간 충돌 검사 (같은 강의실에서 같은 시간에 여러 수업이 있을 수 없음)
export const checkClassroomTimeConflict = (
  newClassSection: ClassSectionWithSchedule,
  existingTimetables: Array<{
    classSections: ClassSectionWithSchedule[]
  }>,
  classroomName: string
): {
  hasConflict: boolean
  conflicts: Array<{
    dayOfWeek: string
    conflictingTime: string
    conflictingClass: string
    message: string
  }>
} => {
  const conflicts: Array<{
    dayOfWeek: string
    conflictingTime: string
    conflictingClass: string
    message: string
  }> = []
  
  // 새로 추가하려는 수업의 각 스케줄에 대해 검사
  newClassSection.schedule.forEach(newSchedule => {
    const dayOfWeek = newSchedule.dayOfWeek
    
    // 모든 시간표에서 해당 강의실의 수업 찾기
    existingTimetables.forEach(timetable => {
      const classroomClassesOnDay = timetable.classSections.filter(
        existing => existing.classroom?.name === classroomName &&
                   existing.schedule.some(s => s.dayOfWeek === dayOfWeek)
      )
      
      // 각 강의실 수업과 시간 충돌 검사
      classroomClassesOnDay.forEach(existingClass => {
        existingClass.schedule
          .filter(s => s.dayOfWeek === dayOfWeek)
          .forEach(existingSchedule => {
            if (isTimeOverlapping(
              newSchedule.startTime,
              newSchedule.endTime,
              existingSchedule.startTime,
              existingSchedule.endTime
            )) {
              conflicts.push({
                dayOfWeek,
                conflictingTime: `${existingSchedule.startTime}-${existingSchedule.endTime}`,
                conflictingClass: existingClass.name,
                message: `${dayOfWeek} ${existingSchedule.startTime}-${existingSchedule.endTime}에 ${existingClass.name} 수업이 있습니다. (${classroomName})`
              })
            }
          })
      })
    })
  })
  
  return {
    hasConflict: conflicts.length > 0,
    conflicts
  }
}

// 종합 충돌 검사 (모든 타입의 충돌을 한번에 검사)
export const checkAllConflicts = (
  newClassSection: ClassSectionWithSchedule,
  existingTimetables: Array<{
    classSections: ClassSectionWithSchedule[]
  }>,
  options: {
    checkStudent?: boolean
    checkTeacher?: boolean
    checkClassroom?: boolean
  } = { checkStudent: true, checkTeacher: true, checkClassroom: true }
): {
  hasConflict: boolean
  studentConflicts: Array<{ dayOfWeek: string; conflictingTime: string; conflictingClass: string; message: string }>
  teacherConflicts: Array<{ dayOfWeek: string; conflictingTime: string; conflictingClass: string; message: string }>
  classroomConflicts: Array<{ dayOfWeek: string; conflictingTime: string; conflictingClass: string; message: string }>
  allConflicts: Array<{ dayOfWeek: string; conflictingTime: string; conflictingClass: string; message: string; type: 'student' | 'teacher' | 'classroom' }>
} => {
  try {
    // 안전한 배열 접근을 위한 검증
    const safeExistingTimetables = existingTimetables || []
    const firstTimetable = safeExistingTimetables[0] || { classSections: [] }
    
    // newClassSection의 필수 속성들이 존재하는지 확인
    const safeTeacherName = newClassSection?.teacher?.name || '담당 교사 미정'
    const safeClassroomName = newClassSection?.classroom?.name || '강의실 미정'
    
    const studentConflicts = options.checkStudent 
      ? checkStudentTimeConflict(newClassSection, firstTimetable).conflicts
      : []
    
    const teacherConflicts = options.checkTeacher
      ? checkTeacherTimeConflict(newClassSection, safeExistingTimetables, safeTeacherName).conflicts
      : []
    
    const classroomConflicts = options.checkClassroom
      ? checkClassroomTimeConflict(newClassSection, safeExistingTimetables, safeClassroomName).conflicts
      : []
    
    const allConflicts = [
      ...studentConflicts.map(c => ({ ...c, type: 'student' as const })),
      ...teacherConflicts.map(c => ({ ...c, type: 'teacher' as const })),
      ...classroomConflicts.map(c => ({ ...c, type: 'classroom' as const }))
    ]
    
    return {
      hasConflict: allConflicts.length > 0,
      studentConflicts,
      teacherConflicts,
      classroomConflicts,
      allConflicts
    }
  } catch (error) {
    console.error('❌ checkAllConflicts 함수에서 에러 발생:', error)
    console.error('❌ 에러 발생 데이터:', { newClassSection, existingTimetables, options })
    
    // 에러 발생 시 기본값 반환
    return {
      hasConflict: false,
      studentConflicts: [],
      teacherConflicts: [],
      classroomConflicts: [],
      allConflicts: []
    }
  }
}
