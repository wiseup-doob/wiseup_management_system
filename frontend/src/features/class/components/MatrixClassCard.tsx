import React from 'react';
import type { ClassSectionWithDetails, EnrolledStudent } from '../types/class.types';
import { sortStudents } from '../utils/matrixUtils';

interface MatrixClassCardProps {
    classData: ClassSectionWithDetails;
    students?: EnrolledStudent[];
    isLoadingStudents?: boolean;
    onEditClass: (classItem: ClassSectionWithDetails) => void;
    startTime: string;
}

export function MatrixClassCard({
    classData,
    students = [],
    isLoadingStudents = false,
    onEditClass,
    startTime
}: MatrixClassCardProps) {

    // 학생 정렬
    const sortedStudents = sortStudents(students);

    const handleCardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEditClass(classData);
    };

    return (
        <div
            className="matrix-card"
            onClick={handleCardClick}
            style={{ borderLeftColor: classData.color || '#339af0' }}
            title="클릭하여 수업 수정"
        >
            <div className="card-header">
                <span className="time">{startTime}</span>
                <span className="count-badge">
                    👥 {sortedStudents.length}/{classData.maxStudents}
                </span>
            </div>

            <div className="card-title">{classData.name}</div>

            <div className="student-list">
                {isLoadingStudents ? (
                    <div className="cell-loading">로딩 중...</div>
                ) : sortedStudents.length > 0 ? (
                    sortedStudents.map(student => (
                        <span key={student.id} className="student-badge">
                            {student.name}
                            {student.grade && <span style={{ opacity: 0.7, fontSize: '0.9em', marginLeft: '2px' }}>({student.grade})</span>}
                        </span>
                    ))
                ) : (
                    <span className="student-badge empty" style={{ background: 'transparent', color: '#adb5bd' }}>
                        학생 없음
                    </span>
                )}
            </div>
        </div>
    );
}
