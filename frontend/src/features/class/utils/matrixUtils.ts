import type { ClassSectionWithDetails } from '../types/class.types';
import type { DayOfWeek } from '@shared/types/common.types';
import type { EnrolledStudent } from '../types/class.types';

// --- Constants ---

export const SUBJECT_MAP: Record<string, string> = {
    korean: '국어',
    english: '영어',
    mathematics: '수학',
    science: '과학',
    social: '사회',
    other: '기타'
};

export const SUBJECT_ORDER: string[] = ['korean', 'english', 'mathematics', 'science', 'social', 'other'];

export const DAY_MAP: Record<string, string> = {
    monday: '월',
    tuesday: '화',
    wednesday: '수',
    thursday: '목',
    friday: '금',
    saturday: '토',
    sunday: '일'
};

export const DAY_ORDER: DayOfWeek[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

// --- Types ---

export interface MatrixItem {
    id: string; // `${classId}-${dayOfWeek}`
    originalClass: ClassSectionWithDetails;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
}

export interface TeacherGroup {
    teacherId: string;
    teacherName: string;
    activeDays: string[]; // ['월', '수', '금']
    items: MatrixItem[];
}

export interface SubjectGroup {
    subject: string; // '국어', '영어' ...
    teachers: TeacherGroup[];
}

// --- Logic ---

/**
 * 1. 과목 정렬 우선순위 반환 (0 ~ N or 999)
 */
export const getSubjectPriority = (subjectCode: string): number => {
    const index = SUBJECT_ORDER.indexOf(subjectCode);
    return index === -1 ? 999 : index;
};

/**
 * 2. 수업 스케줄 Flattening
 * 하나의 수업이 [월 14:00, 수 16:00]에 있다면 2개의 MatrixItem으로 분리합니다.
 */
export const flattenClassSchedules = (classes: ClassSectionWithDetails[]): MatrixItem[] => {
    const flatItems: MatrixItem[] = [];

    classes.forEach(cls => {
        // 스케줄이 없으면 제외
        if (!cls.schedule || cls.schedule.length === 0) return;

        cls.schedule.forEach(sch => {
            flatItems.push({
                id: `${cls.id}-${sch.dayOfWeek}`, // Unique Key for React
                originalClass: cls,
                day: sch.dayOfWeek,
                startTime: sch.startTime,
                endTime: sch.endTime
            });
        });
    });

    return flatItems;
};

/**
 * 3. 데이터 그룹화 (Subject > Teacher)
 * 성능을 위해 Student Data에는 의존하지 않습니다.
 */
export const groupClasses = (classes: ClassSectionWithDetails[]): SubjectGroup[] => {
    const flatItems = flattenClassSchedules(classes);
    const subjectGroups: Record<string, SubjectGroup> = {};

    // 3-1. 과목별로 모으기
    flatItems.forEach(item => {
        // 과목 결정 (없으면 'other')
        let subjectCode = 'other';
        // 선생님의 담당 과목 중 첫 번째를 가져온다고 가정하거나,
        // course.subject를 사용할 수도 있음. 기획상 Teacher 기준이므로 Teacher Subject 사용.
        const teacherSubjects = item.originalClass.teacher?.subjects;

        if (teacherSubjects && teacherSubjects.length > 0) {
            subjectCode = teacherSubjects[0];
        } else if (item.originalClass.course?.subject) {
            subjectCode = item.originalClass.course.subject;
        }

        const subjectName = SUBJECT_MAP[subjectCode] || '기타';

        // 그룹 초기화
        if (!subjectGroups[subjectCode]) {
            subjectGroups[subjectCode] = {
                subject: subjectName,
                teachers: []
            };
        }

        // 선생님 그룹 찾기
        const teacherId = item.originalClass.teacher?.id || 'unknown';
        const teacherName = item.originalClass.teacher?.name || '미배정';

        let teacherGroup = subjectGroups[subjectCode].teachers.find(t => t.teacherId === teacherId);

        if (!teacherGroup) {
            teacherGroup = {
                teacherId,
                teacherName,
                activeDays: [],
                items: []
            };
            subjectGroups[subjectCode].teachers.push(teacherGroup);
        }

        teacherGroup.items.push(item);
    });

    // 3-2. 정렬 및 메타데이터 계산
    return Object.keys(subjectGroups)
        .sort((a, b) => getSubjectPriority(a) - getSubjectPriority(b))
        .map(key => {
            const group = subjectGroups[key];

            // 선생님 정렬 (이름순)
            group.teachers.sort((a, b) => a.teacherName.localeCompare(b.teacherName));

            // 각 선생님의 Active Days 계산
            group.teachers.forEach(t => {
                // 아이템 시간순 정렬
                t.items.sort((a, b) => a.startTime.localeCompare(b.startTime));

                // 요일 집계
                const days = Array.from(new Set(t.items.map(i => i.day)));
                // 요일 순서대로 정렬
                days.sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

                t.activeDays = days.map(d => DAY_MAP[d]);
            });

            return group;
        });
};

/**
 * 4. 동시성 제어 유틸 (Promise.allSettled + Concurrency Limit)
 * 한 번에 너무 많은 요청을 보내지 않도록 제한합니다.
 */
export async function runWithConcurrency<T, R>(
    items: T[],
    fn: (item: T) => Promise<R>,
    limit: number = 5
): Promise<PromiseSettledResult<R>[]> {
    const results: Promise<PromiseSettledResult<R>>[] = [];
    const executing: Promise<void>[] = [];

    for (const item of items) {
        const p = Promise.resolve().then(() => fn(item));

        // Create a promise that resolves to a PromiseSettledResult
        const resultPromise = p.then(
            value => ({ status: 'fulfilled', value } as PromiseSettledResult<R>),
            reason => ({ status: 'rejected', reason } as PromiseSettledResult<R>)
        );

        // 실행 중인 배열 관리
        const e: Promise<void> = p.then(() => {
            executing.splice(executing.indexOf(e), 1);
        }, () => {
            executing.splice(executing.indexOf(e), 1);
        });

        executing.push(e);

        // 결과 배열에 Promise 자체를 push
        results.push(resultPromise);

        if (executing.length >= limit) {
            await Promise.race(executing);
        }
    }

    // 모든 Promise가 완료되기를 기다림
    return Promise.all(results);
}

/**
 * 5. 학생 정렬 (학년 DESC -> 이름 ASC)
 */
export const sortStudents = (students: EnrolledStudent[]): EnrolledStudent[] => {
    return [...students].sort((a, b) => {
        const gradeA = a.grade || '';
        const gradeB = b.grade || '';

        // 학년 내림차순 (고3 > 고2 > 고1 ...)
        // 단순 문자열 비교 시 '고3' > '고2'이므로 내림차순은 b.localeCompare(a)
        if (gradeA !== gradeB) {
            return gradeB.localeCompare(gradeA);
        }

        return a.name.localeCompare(b.name);
    });
};
