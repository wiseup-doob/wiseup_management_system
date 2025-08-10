import { useEffect } from 'react'
import { BaseWidget } from '../../../components/base/BaseWidget'
import { Label } from '../../../components/labels/Label'
import { TimeTable } from '../../../components/business/timetable/TimeTable'
import { useTimetableBlocks } from '../hooks/useTimetableBlocks'
import { useTimetableEditor } from '../hooks/useTimetableEditor'
import { timetableService } from '../../../services/timetableService'
import type { TimetableBlock } from '@shared/types/timetable.types'
import { useNavigate, useLocation } from 'react-router-dom'
import { EditBlockModal } from '../components/EditBlockModal'
import { useState } from 'react'

function TimetableEditPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { blocks: apiBlocks, isLoading, error } = useTimetableBlocks()
  const {
    draftBlocks,
    addBlock,
    updateBlock,
    deleteBlock,
    hasChanges,
    saveChanges,
    saving,
    setCreateContext
  } = useTimetableEditor(apiBlocks)

  const [modalState, setModalState] = useState<{ open: boolean; mode: 'create' | 'edit'; target?: TimetableBlock | null; seed?: any }>({ open: false, mode: 'create' })
  const [classOptions, setClassOptions] = useState<Array<{ id: string; name: string }>>([])
  const [teacherOptions, setTeacherOptions] = useState<Array<{ id: string; name: string }>>([])
  const [roomOptions, setRoomOptions] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    // 편집에 필요한 마스터 데이터 로드
    (async () => {
      const [classes, teachers, rooms] = await Promise.all([
        timetableService.getAllClasses(),
        timetableService.getAllTeachers(),
        timetableService.getAllClassrooms()
      ])
      if (classes.success && classes.data) setClassOptions(classes.data.map(c => ({ id: c.id as string, name: c.name })))
      if (teachers.success && teachers.data) setTeacherOptions(teachers.data.map(t => ({ id: t.id as string, name: t.name })))
      if (rooms.success && rooms.data) setRoomOptions(rooms.data.map(r => ({ id: r.id as string, name: r.name })))
    })()
  }, [])

  useEffect(() => {
    // TimetablePage에서 seed가 넘어온 경우 즉시 생성 모달을 오픈
    const seed = (location.state as any)?.seed
    if (seed) {
      setModalState({ open: true, mode: 'create', seed })
    }
  }, [location.state])

  const onBlockClick = (block: TimetableBlock) => {
    setModalState({ open: true, mode: 'edit', target: block })
  }

  const onCellClick = (cell: any) => {
    setModalState({ open: true, mode: 'create', seed: cell })
  }

  const onSave = async () => {
    if (!hasChanges) {
      alert('변경 사항이 없습니다.')
      return
    }
    try {
      await saveChanges()
      alert('저장 완료')
      // 편집하던 학생으로 복귀 + 재조회 트리거
      const studentId = (location.state as any)?.studentId
      if (studentId) {
        navigate(`/timetable?studentId=${studentId}&refresh=1`)
      } else {
        navigate('/timetable?refresh=1')
      }
    } catch (e: any) {
      console.error('저장 실패:', e)
      alert(`저장 실패: ${e?.message || '알 수 없는 오류'}`)
    }
  }

  const onCancel = () => {
    const studentId = (location.state as any)?.studentId
    if (studentId) navigate(`/timetable?studentId=${studentId}`)
    else navigate('/timetable')
  }

  return (
    <BaseWidget className="timetable-edit-page">
      <div className="toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Label variant="heading" size="medium">시간표 편집</Label>
        <div>
          <button style={{ marginRight: 8 }} onClick={onCancel}>취소</button>
          <button disabled={!hasChanges || saving} onClick={onSave}>저장</button>
        </div>
      </div>

      {isLoading ? (
        <Label variant="secondary">불러오는 중...</Label>
      ) : error ? (
        <Label variant="error">{error}</Label>
      ) : (
        <TimeTable
          blocks={draftBlocks}
          eventHandlers={{
            onCellClick: onCellClick,
            onBlockClick: onBlockClick
          }}
          options={{
            responsive: true,
            startTime: '09:00' as any,
            endTime: '23:00' as any,
            slotMinutes: 60
          }}
          className="editable-timetable"
        />
      )}

      <EditBlockModal
        open={modalState.open}
        initial={modalState.mode === 'edit' ? modalState.target! : {
          title: '',
          dayOfWeek: modalState.seed?.dayOfWeek,
          startTime: modalState.seed?.time,
          endTime: '10:00'
        }}
        classOptions={classOptions}
        teacherOptions={teacherOptions}
        roomOptions={roomOptions}
        onClose={() => setModalState(s => ({ ...s, open: false }))}
        onSubmit={(data) => {
          if (modalState.mode === 'edit' && modalState.target) {
            updateBlock(modalState.target.id, data.block)
          } else {
            const id = `tmp_${Date.now()}`
            // 모달에서 선택한 수업/교사/강의실을 컨텍스트로 저장
            if (!data.context?.classId || !data.context?.teacherId) {
              alert('수업과 교사를 선택하세요.')
              return
            }
            const timetableId = (location.state as any)?.timetableId || (location.state as any)?.selectedTimetableId
            setCreateContext(id, {
              timetableId,
              classId: data.context.classId,
              teacherId: data.context.teacherId,
              roomId: data.context.roomId,
              startDate: new Date().toISOString().slice(0,10)
            })
            addBlock({
              id,
              title: data.block.title || '새 블록',
              dayOfWeek: data.block.dayOfWeek!,
              startTime: data.block.startTime!,
              endTime: data.block.endTime!,
              backgroundColor: '#e3f2fd',
              textColor: '#1976d2',
              borderColor: '#2196f3',
              type: 'custom'
            })
          }
          setModalState(s => ({ ...s, open: false }))
        }}
        onDelete={modalState.mode === 'edit' && modalState.target ? () => {
          deleteBlock(modalState.target!.id)
          setModalState(s => ({ ...s, open: false }))
        } : undefined}
      />
    </BaseWidget>
  )
}

export default TimetableEditPage


