import React, { useEffect, useState, useMemo } from 'react';
import type { ClassSectionWithDetails, EnrolledStudent } from '../types/class.types';
import type { DayOfWeek } from '@shared/types/common.types';
import {
    groupClasses,
    SUBJECT_MAP,
    SUBJECT_ORDER,
    DAY_ORDER,
    runWithConcurrency,
} from '../utils/matrixUtils';
import type { MatrixItem, TeacherGroup } from '../utils/matrixUtils';
import { MatrixClassCard } from './MatrixClassCard';
import { apiService } from '../../../services/api';
import './ClassScheduleMatrix.css';

// --- Props ---
interface ClassScheduleMatrixProps {
    classes: ClassSectionWithDetails[];
    studentCache: Record<string, EnrolledStudent[]>;
    setStudentCache: React.Dispatch<React.SetStateAction<Record<string, EnrolledStudent[]>>>;
    onEditClass: (classItem: ClassSectionWithDetails) => void;
}

// ----------------------------------------------------------------------
// 4. Main Component
// ----------------------------------------------------------------------
export function ClassScheduleMatrix({
    classes,
    studentCache,
    setStudentCache,
    onEditClass
}: ClassScheduleMatrixProps) {

    const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
    const [isVersionLoading, setIsVersionLoading] = useState(true);
    const [loadingClassIds, setLoadingClassIds] = useState<Set<string>>(new Set());

    // 1. Get Active Version ID (Initial Load)
    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const res = await apiService.getActiveTimetableVersion();
                if (res.success && res.data) {
                    setActiveVersionId(res.data.id);
                }
            } catch (e) {
                console.error('Failed to fetch active version', e);
            } finally {
                setIsVersionLoading(false);
            }
        };
        fetchVersion();
    }, []);

    // 2. Compute Structure (Performance Optimized: Depends only on classes)
    const groupedData = useMemo(() => {
        // Only 'active' classes are relevant for the schedule matrix
        const activeClasses = classes.filter(c => c.status === 'active');
        return groupClasses(activeClasses);
    }, [classes]);

    // 3. Fetch Students (Batched & Cached)
    useEffect(() => {
        if (!activeVersionId) return;

        // Find classes that are displayed but not in cache
        // We scan the groupedData to find unique class IDs
        const visibleClassIds = new Set<string>();
        groupedData.forEach(g => {
            g.teachers.forEach(t => {
                t.items.forEach(i => visibleClassIds.add(i.originalClass.id));
            });
        });

        const missingClassIds = Array.from(visibleClassIds).filter(id => !studentCache[id]);

        if (missingClassIds.length === 0) return;

        // Mark as loading
        setLoadingClassIds(prev => {
            const next = new Set(prev);
            missingClassIds.forEach(id => next.add(id));
            return next;
        });

        // Fetch with concurrency
        const fetchStudents = async () => {
            const results = await runWithConcurrency(
                missingClassIds,
                async (classId) => {
                    const res = await apiService.getEnrolledStudents(classId, activeVersionId);
                    return { classId, students: res.success ? res.data : [] };
                },
                5 // Concurrency Limit
            );

            // Update Cache
            setStudentCache(prev => {
                const next = { ...prev };
                results.forEach(r => {
                    if (r.status === 'fulfilled' && r.value) {
                        const { classId, students } = r.value;
                        if (classId) {
                            next[classId] = students || [];
                        }
                    }
                });
                return next;
            });

            // Clear loading state
            setLoadingClassIds(prev => {
                const next = new Set(prev);
                missingClassIds.forEach(id => next.delete(id));
                return next;
            });
        };

        fetchStudents();

    }, [groupedData, activeVersionId, studentCache]); // Removed setStudentCache from dep to match standard patterns, though logic safe

    // Render
    if (isVersionLoading) {
        return <div className="loading-overlay">시간표 데이터 로딩 중...</div>;
    }

    return (
        <div className="matrix-container">
            <table className="matrix-table">
                <thead>
                    <tr>
                        <th className="matrix-header-cell" style={{ width: '150px' }}>선생님 / 요일</th>
                        {DAY_ORDER.map(day => (
                            <th key={day} className="matrix-header-cell">
                                {day === 'sunday' ? '일' :
                                    day === 'monday' ? '월' :
                                        day === 'tuesday' ? '화' :
                                            day === 'wednesday' ? '수' :
                                                day === 'thursday' ? '목' :
                                                    day === 'friday' ? '금' : '토'}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {groupedData.map(group => (
                        <React.Fragment key={group.subject}>
                            {/* Subject Header Row */}
                            <tr className="subject-header-row">
                                <td colSpan={8}>
                                    {group.subject}
                                </td>
                            </tr>
                            {/* Teacher Rows */}
                            {group.teachers.map(teacher => (
                                <MatrixRow
                                    key={teacher.teacherId}
                                    teacher={teacher}
                                    days={DAY_ORDER}
                                    studentCache={studentCache}
                                    loadingClassIds={loadingClassIds}
                                    onEditClass={onEditClass}
                                />
                            ))}
                        </React.Fragment>
                    ))}
                    {groupedData.length === 0 && (
                        <tr>
                            <td colSpan={8} style={{ padding: '50px', textAlign: 'center', color: '#888' }}>
                                표시할 수업이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// ----------------------------------------------------------------------
// 5. Sub Components
// ----------------------------------------------------------------------

interface MatrixRowProps {
    teacher: TeacherGroup;
    days: DayOfWeek[];
    studentCache: Record<string, EnrolledStudent[]>;
    loadingClassIds: Set<string>;
    onEditClass: (classItem: ClassSectionWithDetails) => void;
}

function MatrixRow({ teacher, days, studentCache, loadingClassIds, onEditClass }: MatrixRowProps) {
    return (
        <tr>
            <td className="teacher-header">
                <div className="matrix-teacher-name">{teacher.teacherName}</div>
                {teacher.activeDays.length > 0 && (
                    <div className="teacher-days">({teacher.activeDays.join('/')})</div>
                )}
            </td>
            {days.map(day => {
                // Find items for this day
                const items = teacher.items.filter(i => i.day === day);
                return (
                    <MatrixCell
                        key={day}
                        items={items}
                        studentCache={studentCache}
                        loadingClassIds={loadingClassIds}
                        onEditClass={onEditClass}
                    />
                );
            })}
        </tr>
    );
}

interface MatrixCellProps {
    items: MatrixItem[];
    studentCache: Record<string, EnrolledStudent[]>;
    loadingClassIds: Set<string>;
    onEditClass: (classItem: ClassSectionWithDetails) => void;
}

function MatrixCell({ items, studentCache, loadingClassIds, onEditClass }: MatrixCellProps) {
    if (items.length === 0) {
        return <td className="matrix-cell empty"></td>;
    }

    return (
        <td className="matrix-cell">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
                {items.map(item => (
                    <div key={item.id} style={{ flex: 1 }}>
                        <MatrixClassCard
                            classData={item.originalClass}
                            students={studentCache[item.originalClass.id] || []}
                            isLoadingStudents={loadingClassIds.has(item.originalClass.id)}
                            onEditClass={onEditClass}
                            startTime={item.startTime}
                        />
                    </div>
                ))}
            </div>
        </td>
    );
}
