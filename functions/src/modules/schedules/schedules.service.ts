import * as admin from 'firebase-admin';
import { db } from '../../config/firebase';
import {
  Schedule,
  FirestoreSchedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleFilter,
  ScheduleWithDetails,
  ScheduleStats,
  DailyScheduleSummary,
  StudentScheduleSummary,
  ClassScheduleSummary,
} from './schedules.types';
import { OptimizedQueryBuilder, batchGetDocuments } from '../../common/batch-query';
import { createDatabaseError } from '../../common/errors';

const COL = 'schedules';

// Firestore 데이터를 Schedule로 변환
function convertScheduleFromFirestore(doc: admin.firestore.QueryDocumentSnapshot): Schedule {
  const data = doc.data() as FirestoreSchedule;
  return {
    schedule_id: data.schedule_id,
    user_id: data.user_id,
    class_id: data.class_id,
    subject_id: data.subject_id,
    student_id: data.student_id,
    start_date: data.start_date,
    end_date: data.end_date,
    title: data.title,
    description: data.description,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}



// 일정 생성
export async function createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
  try {
    const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = admin.firestore.Timestamp.now();

    const firestoreData: FirestoreSchedule = {
      id: scheduleId,
      schedule_id: scheduleId,
      user_id: data.user_id,
      class_id: data.class_id,
      subject_id: data.subject_id,
      student_id: data.student_id,
      start_date: data.start_date,
      end_date: data.end_date,
      title: data.title,
      description: data.description,
      created_at: now,
      updated_at: now,
    };

    await db.collection(COL).doc(scheduleId).set(firestoreData);

    return {
      schedule_id: scheduleId,
      user_id: data.user_id,
      class_id: data.class_id,
      subject_id: data.subject_id,
      student_id: data.student_id,
      start_date: data.start_date,
      end_date: data.end_date,
      title: data.title,
      description: data.description,
      created_at: now,
      updated_at: now,
    };
  } catch (error) {
    throw createDatabaseError(`Failed to create schedule: ${error}`, error as Error);
  }
}

// 일정 조회
export async function getSchedule(scheduleId: string): Promise<Schedule | null> {
  try {
    const doc = await db.collection(COL).doc(scheduleId).get();
    return doc.exists ? convertScheduleFromFirestore(doc as admin.firestore.QueryDocumentSnapshot) : null;
  } catch (error) {
    throw createDatabaseError(`Failed to get schedule: ${error}`, error as Error);
  }
}

// 일정 목록 조회
export async function getSchedules(filter: ScheduleFilter): Promise<Schedule[]> {
  try {
    const queryBuilder = new OptimizedQueryBuilder<Schedule>(COL);

    if (filter.user_id) {
      queryBuilder.where('user_id', '==', filter.user_id);
    }

    if (filter.class_id) {
      queryBuilder.where('class_id', '==', filter.class_id);
    }

    if (filter.subject_id) {
      queryBuilder.where('subject_id', '==', filter.subject_id);
    }

    if (filter.student_id) {
      queryBuilder.where('student_id', '==', filter.student_id);
    }

    if (filter.title) {
      queryBuilder.where('title', '>=', filter.title).where('title', '<=', filter.title + '\uf8ff');
    }

    if (filter.date_range) {
      queryBuilder.where('start_date', '>=', filter.date_range.from);
      queryBuilder.where('end_date', '<=', filter.date_range.to);
    }

    queryBuilder.orderBy('start_date', 'asc');
    queryBuilder.limit(20);

    const snapshot = await queryBuilder.queryObject.get();
    return snapshot.docs.map(convertScheduleFromFirestore);
  } catch (error) {
    throw createDatabaseError(`Failed to get schedules: ${error}`, error as Error);
  }
}

// 일정 업데이트
export async function updateSchedule(scheduleId: string, data: UpdateScheduleRequest): Promise<Schedule | null> {
  try {
    const updateData: Partial<FirestoreSchedule> = {
      updated_at: admin.firestore.Timestamp.now(),
    };

    if (data.start_date) updateData.start_date = data.start_date;
    if (data.end_date) updateData.end_date = data.end_date;
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;

    await db.collection(COL).doc(scheduleId).update(updateData);
    return getSchedule(scheduleId);
  } catch (error) {
    throw createDatabaseError(`Failed to update schedule: ${error}`, error as Error);
  }
}

// 일정 삭제
export async function deleteSchedule(scheduleId: string): Promise<boolean> {
  try {
    await db.collection(COL).doc(scheduleId).delete();
    return true;
  } catch (error) {
    throw createDatabaseError(`Failed to delete schedule: ${error}`, error as Error);
  }
}

// 일정 상세 정보 조회 (관계 데이터 포함)
export async function getScheduleWithDetails(scheduleId: string): Promise<ScheduleWithDetails | null> {
  try {
    const schedule = await getSchedule(scheduleId);
    if (!schedule) return null;

    // 사용자 정보 조회
    const userDoc = await db.collection('users').doc(schedule.user_id).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    // 반 정보 조회
    const classDoc = await db.collection('classes').doc(schedule.class_id).get();
    const classData = classDoc.exists ? classDoc.data() : null;

    // 과목 정보 조회
    const subjectDoc = await db.collection('subjects').doc(schedule.subject_id).get();
    const subjectData = subjectDoc.exists ? subjectDoc.data() : null;

    // 학생 정보 조회
    const studentDoc = await db.collection('students').doc(schedule.student_id).get();
    const studentData = studentDoc.exists ? studentDoc.data() : null;

    return {
      ...schedule,
      user_name: userData?.user_name,
      class_name: classData?.class_name,
      subject_name: subjectData?.subject_name,
      student_name: studentData?.student_name,
    };
  } catch (error) {
    throw createDatabaseError(`Failed to get schedule with details: ${error}`, error as Error);
  }
}

// 일정 통계 조회
export async function getScheduleStats(filter?: ScheduleFilter): Promise<ScheduleStats> {
  try {
    const schedules = await getSchedules(filter || {});
    const now = new Date();

    const totalSchedules = schedules.length;
    const upcomingSchedules = schedules.filter(s => new Date(s.start_date) > now).length;
    const completedSchedules = schedules.filter(s => new Date(s.end_date) < now).length;
    const cancelledSchedules = 0; // 취소된 일정은 별도 필드로 관리 필요

    return {
      total_schedules: totalSchedules,
      upcoming_schedules: upcomingSchedules,
      completed_schedules: completedSchedules,
      cancelled_schedules: cancelledSchedules,
    };
  } catch (error) {
    throw createDatabaseError(`Failed to get schedule stats: ${error}`, error as Error);
  }
}

// 일별 일정 요약 조회
export async function getDailyScheduleSummary(date: string, classId?: string, studentId?: string): Promise<DailyScheduleSummary> {
  try {
    const filter: ScheduleFilter = {
      date_range: { from: date, to: date },
    };

    if (classId) filter.class_id = classId;
    if (studentId) filter.student_id = studentId;

    const schedules = await getSchedules(filter);

    const totalSchedules = schedules.length;
    const classSchedules = schedules.filter(s => s.title.toLowerCase().includes('class')).length;
    const examSchedules = schedules.filter(s => s.title.toLowerCase().includes('exam')).length;
    const eventSchedules = schedules.filter(s => s.title.toLowerCase().includes('event')).length;
    const meetingSchedules = schedules.filter(s => s.title.toLowerCase().includes('meeting')).length;

    return {
      date,
      total_schedules: totalSchedules,
      class_schedules: classSchedules,
      exam_schedules: examSchedules,
      event_schedules: eventSchedules,
      meeting_schedules: meetingSchedules,
    };
  } catch (error) {
    throw createDatabaseError(`Failed to get daily schedule summary: ${error}`, error as Error);
  }
}

// 학생별 일정 요약 조회
export async function getStudentScheduleSummary(studentId: string, dateRange?: { from: string; to: string }): Promise<StudentScheduleSummary> {
  try {
    const filter: ScheduleFilter = { student_id: studentId };
    if (dateRange) filter.date_range = dateRange;

    const schedules = await getSchedules(filter);
    const now = new Date();

    const totalSchedules = schedules.length;
    const upcomingSchedules = schedules.filter(s => new Date(s.start_date) > now).length;
    const completedSchedules = schedules.filter(s => new Date(s.end_date) < now).length;

    // 다음 일정 찾기
    const nextSchedule = schedules
      .filter(s => new Date(s.start_date) > now)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];

    // 학생 정보 조회
    const studentDoc = await db.collection('students').doc(studentId).get();
    const studentData = studentDoc.exists ? studentDoc.data() : null;

    return {
      student_id: studentId,
      student_name: studentData?.student_name || '',
      total_schedules: totalSchedules,
      upcoming_schedules: upcomingSchedules,
      completed_schedules: completedSchedules,
      next_schedule: nextSchedule,
    };
  } catch (error) {
    throw createDatabaseError(`Failed to get student schedule summary: ${error}`, error as Error);
  }
}

// 반별 일정 요약 조회
export async function getClassScheduleSummary(classId: string, dateRange?: { from: string; to: string }): Promise<ClassScheduleSummary> {
  try {
    const filter: ScheduleFilter = { class_id: classId };
    if (dateRange) filter.date_range = dateRange;

    const schedules = await getSchedules(filter);
    const now = new Date();

    const totalSchedules = schedules.length;
    const upcomingSchedules = schedules.filter(s => new Date(s.start_date) > now).length;
    const completedSchedules = schedules.filter(s => new Date(s.end_date) < now).length;

    // 다음 일정 찾기
    const nextSchedule = schedules
      .filter(s => new Date(s.start_date) > now)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];

    // 반 정보 조회
    const classDoc = await db.collection('classes').doc(classId).get();
    const classData = classDoc.exists ? classDoc.data() : null;

    return {
      class_id: classId,
      class_name: classData?.class_name || '',
      total_schedules: totalSchedules,
      upcoming_schedules: upcomingSchedules,
      completed_schedules: completedSchedules,
      next_schedule: nextSchedule,
    };
  } catch (error) {
    throw createDatabaseError(`Failed to get class schedule summary: ${error}`, error as Error);
  }
}

// 배치 처리를 활용한 일정 상세 정보 조회 (개선된 버전)
export async function getSchedulesWithDetailsBatch(scheduleIds: string[]): Promise<ScheduleWithDetails[]> {
  try {
    if (scheduleIds.length === 0) return [];

    // 배치로 일정 조회
    const schedulesResult = await batchGetDocuments(
      COL,
      scheduleIds,
      (doc) => convertScheduleFromFirestore(doc as admin.firestore.QueryDocumentSnapshot)
    );

    if (!schedulesResult.success || schedulesResult.data.length === 0) {
      return [];
    }

    const schedules = schedulesResult.data;
    
    // 관련 ID들 수집
    const userIds = [...new Set(schedules.map(s => s.user_id))];
    const classIds = [...new Set(schedules.map(s => s.class_id))];
    const subjectIds = [...new Set(schedules.map(s => s.subject_id))];
    const studentIds = [...new Set(schedules.map(s => s.student_id))];

    // 배치로 관련 데이터 조회
    const [usersResult, classesResult, subjectsResult, studentsResult] = await Promise.all([
      batchGetDocuments('users', userIds, (doc) => doc.data()),
      batchGetDocuments('classes', classIds, (doc) => doc.data()),
      batchGetDocuments('subjects', subjectIds, (doc) => doc.data()),
      batchGetDocuments('students', studentIds, (doc) => doc.data()),
    ]);

    // 데이터 매핑
    const usersMap = new Map(usersResult.data.map((user: any) => [user.id, user]));
    const classesMap = new Map(classesResult.data.map((cls: any) => [cls.id, cls]));
    const subjectsMap = new Map(subjectsResult.data.map((subject: any) => [subject.id, subject]));
    const studentsMap = new Map(studentsResult.data.map((student: any) => [student.id, student]));

    // 상세 정보 조합
    return schedules.map(schedule => ({
      ...schedule,
      user_name: usersMap.get(schedule.user_id)?.user_name,
      class_name: classesMap.get(schedule.class_id)?.class_name,
      subject_name: subjectsMap.get(schedule.subject_id)?.subject_name,
      student_name: studentsMap.get(schedule.student_id)?.student_name,
    }));
  } catch (error) {
    throw createDatabaseError(`Failed to get schedules with details batch: ${error}`, error as Error);
  }
}

// 일정 통계 조회 (배치 처리 활용)
export async function getScheduleStatsBatch(filter?: ScheduleFilter): Promise<ScheduleStats> {
  try {
    const schedules = await getSchedules(filter || {});
    const now = new Date();

    const totalSchedules = schedules.length;
    const upcomingSchedules = schedules.filter(s => new Date(s.start_date) > now).length;
    const completedSchedules = schedules.filter(s => new Date(s.end_date) < now).length;
    const cancelledSchedules = 0; // 취소된 일정은 별도 필드로 관리 필요

    return {
      total_schedules: totalSchedules,
      upcoming_schedules: upcomingSchedules,
      completed_schedules: completedSchedules,
      cancelled_schedules: cancelledSchedules,
    };
  } catch (error) {
    throw createDatabaseError(`Failed to get schedule stats batch: ${error}`, error as Error);
  }
} 