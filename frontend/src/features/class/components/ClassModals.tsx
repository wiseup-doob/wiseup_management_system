import React, { Suspense } from 'react'
import type { ClassSectionWithDetails } from '../types/class.types'
import type { ClassSectionDependencies } from '@shared/types/class-section.types'

// 동적 import로 번들 크기 최적화
const AddClassPage = React.lazy(() => import('../pages/AddClassPage'))
const EditClassPage = React.lazy(() => import('../pages/EditClassPage'))
const AddStudentPage = React.lazy(() => import('../pages/AddStudentPage'))

interface SuccessToastProps {
  show: boolean
  message: { title: string; description: string }
}

function SuccessToast({ show, message }: SuccessToastProps) {
  if (!show) return null

  return (
    <div className="success-toast">
      <div className="success-toast-content">
        <div className="success-toast-icon">✓</div>
        <div className="success-toast-message">
          <h4>{message.title}</h4>
          <p>{message.description}</p>
        </div>
      </div>
    </div>
  )
}

interface DeleteConfirmModalProps {
  isOpen: boolean
  classToDelete: ClassSectionWithDetails | null
  classDependencies: ClassSectionDependencies | null
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

function DeleteConfirmModal({
  isOpen,
  classToDelete,
  classDependencies,
  isDeleting,
  onClose,
  onConfirm
}: DeleteConfirmModalProps) {
  if (!isOpen || !classToDelete) return null

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <h2>수업 삭제 확인</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="delete-modal-body">
          <div className="warning-icon">⚠️</div>
          <h3>정말로 이 수업을 삭제하시겠습니까?</h3>
          <p>삭제된 수업은 복구할 수 없습니다.</p>
          
          <div className="class-info-preview">
            <div className="info-row">
              <span className="label">수업명:</span>
              <span className="value">{classToDelete.name}</span>
            </div>
            <div className="info-row">
              <span className="label">담당 교사:</span>
              <span className="value">{classToDelete.teacherId}</span>
            </div>
            <div className="info-row">
              <span className="label">강의실:</span>
              <span className="value">{classToDelete.classroomId}</span>
            </div>
          </div>
          
          {/* 수업 의존성 정보 표시 */}
          {classDependencies && (
            <div className="class-dependencies-info">
              <h4>삭제될 관련 데이터:</h4>
              <div className="dependencies-list">
                {classDependencies.hasStudentTimetables && (
                  <div className="dependency-item">
                    👥 영향받는 학생: {classDependencies.affectedStudentCount}명
                  </div>
                )}
                {classDependencies.hasAttendanceRecords && (
                  <div className="dependency-item">
                    📊 출석 기록: {classDependencies.attendanceCount}개
                  </div>
                )}
              </div>
              <div className="total-impact">
                <strong>총 {classDependencies.totalRelatedRecords + 1}개의 데이터가 삭제됩니다.</strong>
              </div>
            </div>
          )}
        </div>
        
        <div className="delete-modal-actions">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={isDeleting}
          >
            취소
          </button>
          <button 
            className="btn-delete" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface ClassModalsProps {
  // Success Toast
  showSuccessMessage: boolean
  successMessage: { title: string; description: string }

  // Add Class Modal
  isAddClassModalOpen: boolean
  onCloseAddClassModal: () => void
  onClassCreated: () => void

  // Add Student Modal
  isAddStudentModalOpen: boolean
  selectedClass: ClassSectionWithDetails | null
  onCloseAddStudentModal: () => void
  onStudentAdded: () => void

  // Delete Modal
  isDeleteModalOpen: boolean
  classToDelete: ClassSectionWithDetails | null
  classDependencies: ClassSectionDependencies | null
  isDeleting: boolean
  onCloseDeleteModal: () => void
  onConfirmDelete: () => void

  // Edit Modal
  isEditModalOpen: boolean
  classToEdit: ClassSectionWithDetails | null
  onCloseEditModal: () => void
  onClassUpdated: () => void
}

export function ClassModals({
  showSuccessMessage,
  successMessage,
  isAddClassModalOpen,
  onCloseAddClassModal,
  onClassCreated,
  isAddStudentModalOpen,
  selectedClass,
  onCloseAddStudentModal,
  onStudentAdded,
  isDeleteModalOpen,
  classToDelete,
  classDependencies,
  isDeleting,
  onCloseDeleteModal,
  onConfirmDelete,
  isEditModalOpen,
  classToEdit,
  onCloseEditModal,
  onClassUpdated
}: ClassModalsProps) {
  return (
    <>
      {/* 성공 메시지 */}
      <SuccessToast 
        show={showSuccessMessage} 
        message={successMessage} 
      />

      {/* 수업 추가 모달 */}
      <Suspense fallback={<div className="modal-loading">모달 로딩 중...</div>}>
        <AddClassPage 
          isOpen={isAddClassModalOpen}
          onClose={onCloseAddClassModal}
          onClassCreated={onClassCreated}
        />
      </Suspense>

      {/* 학생 추가 모달 */}
      {isAddStudentModalOpen && selectedClass && (
        <Suspense fallback={<div className="modal-loading">모달 로딩 중...</div>}>
          <AddStudentPage
            isOpen={isAddStudentModalOpen}
            onClose={onCloseAddStudentModal}
            classData={selectedClass}
            onStudentAdded={onStudentAdded}
          />
        </Suspense>
      )}

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        classToDelete={classToDelete}
        classDependencies={classDependencies}
        isDeleting={isDeleting}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
      />

      {/* 수업 편집 모달 */}
      {isEditModalOpen && classToEdit && (
        <Suspense fallback={<div className="modal-loading">모달 로딩 중...</div>}>
          <EditClassPage
            isOpen={isEditModalOpen}
            onClose={onCloseEditModal}
            classData={classToEdit}
            onClassUpdated={onClassUpdated}
          />
        </Suspense>
      )}
    </>
  )
}