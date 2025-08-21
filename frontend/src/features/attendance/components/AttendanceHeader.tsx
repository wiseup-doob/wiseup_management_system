import { Button } from '../../../components/buttons/Button'
import { Label } from '../../../components/labels/Label'
import type { SeatHealthStatus } from '../types/attendance.types'
import './AttendanceHeader.css'

interface AttendanceHeaderProps {
  editingMode: 'none' | 'remove' | 'move'
  isEditing: boolean
  sourceSeatId: string | null
  currentMode: 'view' | 'edit'
  pendingChangesCount: number
  isAddingMode: boolean // 추가
  onRefresh: () => void
  onEditModeChange: (mode: 'remove' | 'move') => void
  onEditComplete: () => void
  onEnterEditMode: () => void
  onCancelEditMode: () => void
  onToggleAddingMode: () => void // 추가
  onCheckHealth: () => void
  onAutoRepair: () => void
  isCheckingHealth: boolean
  isRepairing: boolean
  seatHealth: SeatHealthStatus | null
}

export const AttendanceHeader = ({
  editingMode,
  sourceSeatId,
  currentMode,
  pendingChangesCount,
  isAddingMode, // 추가
  onRefresh,
  onEditModeChange,
  onEditComplete,
  onEnterEditMode,
  onCancelEditMode,
  onToggleAddingMode, // 추가
  onCheckHealth,
  onAutoRepair,
  isCheckingHealth,
  isRepairing,
  seatHealth
}: AttendanceHeaderProps) => {
  return (
    <>
      {/* 좌측 상단: 새로고침, 모드 전환, 편집 컨트롤, 헬스체크 */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onRefresh}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          새로고침
        </button>
        
        {/* 모드 전환 버튼 */}
        {currentMode === 'view' ? (
          <button
            onClick={onEnterEditMode}
            className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            편집 모드
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onCancelEditMode}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              편집 취소
            </button>
            <button
              onClick={onEditComplete}
              disabled={pendingChangesCount === 0}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              편집 완료 ({pendingChangesCount})
            </button>
          </div>
        )}
        
        {/* 편집 모드 내에서의 세부 편집 모드 */}
        {currentMode === 'edit' && editingMode === 'none' && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                console.log('🗑️ === 제거 모드 버튼 클릭 ===');
                console.log('📍 이전 편집 모드:', editingMode);
                onEditModeChange('remove');
                console.log('✅ 제거 모드로 변경 완료');
              }}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              제거 모드
            </button>
            <button
              onClick={() => {
                console.log('🔄 === 이동 모드 버튼 클릭 ===');
                console.log('📍 이전 편집 모드:', editingMode);
                onEditModeChange('move');
                console.log('✅ 이동 모드로 변경 완료');
              }}
              className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              이동 모드
            </button>
            <button
              onClick={() => {
                console.log('➕ === 좌석 추가 모드 토글 ===');
                console.log('📍 현재 추가 모드:', isAddingMode);
                onToggleAddingMode();
                console.log('✅ 추가 모드 토글 완료');
              }}
              className={`px-3 py-2 rounded transition-colors ${
                isAddingMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isAddingMode ? '추가 모드 ON' : '추가 모드 OFF'}
            </button>
          </div>
        )}

        {/* 헬스체크 버튼 */}
        <button
          onClick={onCheckHealth}
          disabled={isCheckingHealth}
          className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
        >
          {isCheckingHealth ? '체크중...' : '헬스체크'}
        </button>

        {/* 자동복구 버튼 (헬스체크 결과가 있고 문제가 있을 때만 표시) */}
        {seatHealth && seatHealth.status !== 'HEALTHY' && (
          <button
            onClick={onAutoRepair}
            disabled={isRepairing}
            className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {isRepairing ? '복구중...' : '자동복구'}
          </button>
        )}
      </div>

      {/* 편집 모드 상태 표시 */}
      {editingMode !== 'none' && (
        <div className={`mb-4 p-3 rounded border ${
          editingMode === 'remove' ? 'bg-red-100 border-red-300 text-red-800' :
          'bg-purple-100 border-purple-300 text-purple-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <strong>현재 편집 모드:</strong> {
                editingMode === 'remove' ? '제거 모드 - 자리를 클릭하면 학생이 제거됩니다' :
                '이동 모드 - 첫 번째 자리를 클릭하여 선택한 후, 두 번째 자리를 클릭하면 이동/교환됩니다'
              }
            </div>
            {editingMode === 'move' && sourceSeatId && (
              <span className="text-sm font-medium">
                선택된 자리: {sourceSeatId}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 헬스 상태 표시 */}
      {seatHealth && (
        <div className={`mb-4 p-3 rounded border ${
          seatHealth.status === 'HEALTHY' ? 'bg-green-100 border-green-300 text-green-800' :
          seatHealth.status === 'DEGRADED' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
          'bg-red-100 border-red-300 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <strong>좌석 데이터 상태:</strong> {seatHealth.status === 'HEALTHY' ? '정상' : seatHealth.status === 'DEGRADED' ? '주의' : '위험'}
              <span className="ml-4">
                총 {seatHealth.totalSeats}개 좌석, 배정 {seatHealth.assignedSeats}개, 문제 {seatHealth.mismatchedSeats}개
              </span>
            </div>
            <span className="text-sm">
              마지막 체크: {new Date(seatHealth.lastChecked).toLocaleString('ko-KR')}
            </span>
          </div>
          
          {seatHealth.issues.length > 0 && (
            <div className="mt-2 text-sm">
              <strong>발견된 문제:</strong>
              <ul className="mt-1 ml-4 list-disc">
                {seatHealth.issues.slice(0, 3).map((issue, index) => (
                  <li key={index} className="truncate" title={issue.description}>
                    {issue.description}
                  </li>
                ))}
                {seatHealth.issues.length > 3 && (
                  <li>... 외 {seatHealth.issues.length - 3}개 문제</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  )
}
