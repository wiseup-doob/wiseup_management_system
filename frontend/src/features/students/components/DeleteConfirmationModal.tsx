import React from 'react';
import { Button } from '../../../components/buttons/Button';
import './DeleteConfirmationModal.css';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemName: string;
  itemType: 'student' | 'teacher' | 'classroom';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  // 학생 의존성 정보 (학생인 경우에만)
  studentDependencies?: {
    hasAttendanceRecords: boolean;
    attendanceCount: number;
    hasTimetable: boolean;
    hasClassEnrollments: boolean;
    classEnrollmentCount: number;
    hasSeatAssignments: boolean;
    seatAssignmentCount: number;
    hasStudentSummary: boolean;
    totalRelatedRecords: number;
  } | null;
  // 교사 의존성 정보 (교사인 경우에만)
  teacherDependencies?: {
    hasClassSections: boolean;
    classSectionCount: number;
    hasStudentTimetables: boolean;
    affectedStudentCount: number;
    hasAttendanceRecords: boolean;
    attendanceCount: number;
    totalRelatedRecords: number;
  } | null;
  // 강의실 의존성 정보 (강의실인 경우에만)
  classroomDependencies?: {
    hasClassSections: boolean;
    classSectionCount: number;
    hasStudentTimetables: boolean;
    affectedStudentCount: number;
    hasAttendanceRecords: boolean;
    attendanceCount: number;
    totalRelatedRecords: number;
  } | null;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  itemName,
  itemType,
  onConfirm,
  onCancel,
  isLoading = false,
  studentDependencies = null,
  teacherDependencies = null,
  classroomDependencies = null
}) => {
  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // 아이템 타입에 따른 메시지 생성
  const getItemTypeText = () => {
    switch (itemType) {
      case 'student':
        return '학생';
      case 'teacher':
        return '교사';
      case 'classroom':
        return '강의실';
      default:
        return '항목';
    }
  };

  const getWarningMessage = () => {
    switch (itemType) {
      case 'student':
        return '이 학생과 관련된 모든 데이터(출석 기록, 성적 등)가 함께 삭제됩니다.';
      case 'teacher':
        return '이 교사와 관련된 모든 수업 정보가 함께 삭제됩니다.';
      case 'classroom':
        return '이 강의실과 관련된 모든 수업 정보가 함께 삭제됩니다.';
      default:
        return '이 항목과 관련된 모든 데이터가 함께 삭제됩니다.';
    }
  };

  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <h3>삭제 확인</h3>
        </div>

        <div className="delete-modal-body">
          <div className="warning-icon">⚠️</div>
          <p className="delete-message">
            <strong>"{itemName}"</strong> {getItemTypeText()}을(를) 정말로 삭제하시겠습니까?
          </p>
          <p className="warning-message">
            {getWarningMessage()}
          </p>
          <p className="caution-message">
            이 작업은 되돌릴 수 없습니다.
          </p>

          {/* 학생 의존성 정보 표시 */}
          {itemType === 'student' && studentDependencies && (
            <div className="student-dependencies-info">
              <h4>삭제될 관련 데이터:</h4>
              <div className="dependencies-list">
                {studentDependencies.hasAttendanceRecords && (
                  <div className="dependency-item">
                    📊 출석 기록: {studentDependencies.attendanceCount}개
                  </div>
                )}
                {studentDependencies.hasTimetable && (
                  <div className="dependency-item">
                    📅 개인 시간표: 1개
                  </div>
                )}
                {studentDependencies.hasClassEnrollments && (
                  <div className="dependency-item">
                    📚 수업 등록: {studentDependencies.classEnrollmentCount}개
                  </div>
                )}
                {studentDependencies.hasSeatAssignments && (
                  <div className="dependency-item">
                    🪑 좌석 배정: {studentDependencies.seatAssignmentCount}개
                  </div>
                )}
                {studentDependencies.hasStudentSummary && (
                  <div className="dependency-item">
                    📊 학생 요약 정보: 1개
                  </div>
                )}
              </div>
              <div className="total-impact">
                <strong>총 {studentDependencies.totalRelatedRecords + 1}개의 데이터가 삭제됩니다.</strong>
              </div>
            </div>
          )}

          {/* 교사 의존성 정보 표시 */}
          {itemType === 'teacher' && teacherDependencies && (
            <div className="teacher-dependencies-info">
              <h4>삭제될 관련 데이터:</h4>
              <div className="dependencies-list">
                {teacherDependencies.hasClassSections && (
                  <div className="dependency-item">
                    📚 담당 수업: {teacherDependencies.classSectionCount}개
                  </div>
                )}
                {teacherDependencies.hasStudentTimetables && (
                  <div className="dependency-item">
                    👥 영향받는 학생: {teacherDependencies.affectedStudentCount}명
                  </div>
                )}
                {teacherDependencies.hasAttendanceRecords && (
                  <div className="dependency-item">
                    📊 출석 기록: {teacherDependencies.attendanceCount}개
                  </div>
                )}
              </div>
              <div className="total-impact">
                <strong>총 {teacherDependencies.totalRelatedRecords + 1}개의 데이터가 삭제됩니다.</strong>
              </div>
            </div>
          )}

          {/* 강의실 의존성 정보 표시 */}
          {itemType === 'classroom' && classroomDependencies && (
            <div className="classroom-dependencies-info">
              <h4>삭제될 관련 데이터:</h4>
              <div className="dependencies-list">
                {classroomDependencies.hasClassSections && (
                  <div className="dependency-item">
                    📚 진행 수업: {classroomDependencies.classSectionCount}개
                  </div>
                )}
                {classroomDependencies.hasStudentTimetables && (
                  <div className="dependency-item">
                    👥 영향받는 학생: {classroomDependencies.affectedStudentCount}명
                  </div>
                )}
                {classroomDependencies.hasAttendanceRecords && (
                  <div className="dependency-item">
                    📊 출석 기록: {classroomDependencies.attendanceCount}개
                  </div>
                )}
              </div>
              <div className="total-impact">
                <strong>총 {classroomDependencies.totalRelatedRecords + 1}개의 데이터가 삭제됩니다.</strong>
              </div>
            </div>
          )}
        </div>

        <div className="delete-modal-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="cancel-btn"
          >
            취소
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
            className="confirm-btn"
          >
            {isLoading ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </div>
    </div>
  );
};
