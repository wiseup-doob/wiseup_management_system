import React, { useState, useEffect } from 'react'
import type { TimetableBlock } from '@shared/types/timetable.types'

interface Props {
  open: boolean
  initial?: Partial<TimetableBlock>
  onClose: () => void
  onSubmit: (data: { block: Partial<TimetableBlock>, context?: { classId: string; teacherId: string; roomId?: string } }) => void
  onDelete?: () => void
  classOptions?: Array<{ id: string; name: string }>
  teacherOptions?: Array<{ id: string; name: string }>
  roomOptions?: Array<{ id: string; name: string }>
}

export const EditBlockModal: React.FC<Props> = ({ open, initial = {}, onClose, onSubmit, onDelete, classOptions = [], teacherOptions = [], roomOptions = [] }) => {
  const [title, setTitle] = useState(initial.title || '')
  const [dayOfWeek, setDayOfWeek] = useState(initial.dayOfWeek || 'monday')
  const [startTime, setStartTime] = useState(initial.startTime || '09:00')
  const [endTime, setEndTime] = useState(initial.endTime || '10:00')
  const [classId, setClassId] = useState<string>('')
  const [teacherId, setTeacherId] = useState<string>('')
  const [roomId, setRoomId] = useState<string>('')

  useEffect(() => {
    setTitle(initial.title || '')
    setDayOfWeek(initial.dayOfWeek || 'monday')
    setStartTime(initial.startTime || '09:00')
    setEndTime(initial.endTime || '10:00')
    // 초기 컨텍스트는 외부에서 제어
  }, [initial])

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, width: 360 }}>
        <h3 style={{ marginTop: 0 }}>{initial?.id ? '블록 수정' : '블록 추가'}</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="제목" />
          {/* 수업/교사/강의실 선택 (생성 시 필수, 수정 시 선택) */}
          {classOptions.length > 0 && (
            <select value={classId} onChange={e=>setClassId(e.target.value)}>
              <option value="">수업 선택</option>
              {classOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          )}
          {teacherOptions.length > 0 && (
            <select value={teacherId} onChange={e=>setTeacherId(e.target.value)}>
              <option value="">교사 선택</option>
              {teacherOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          )}
          {roomOptions.length > 0 && (
            <select value={roomId} onChange={e=>setRoomId(e.target.value)}>
              <option value="">강의실 선택(선택)</option>
              {roomOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          )}
          <select value={dayOfWeek as string} onChange={e=>setDayOfWeek(e.target.value as any)}>
            <option value="monday">월</option>
            <option value="tuesday">화</option>
            <option value="wednesday">수</option>
            <option value="thursday">목</option>
            <option value="friday">금</option>
            <option value="saturday">토</option>
            <option value="sunday">일</option>
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} />
            <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
          {initial?.id && onDelete && (
            <button style={{ marginRight: 'auto', color: '#d32f2f' }} onClick={onDelete}>삭제</button>
          )}
          <button onClick={onClose}>취소</button>
          <button onClick={()=>onSubmit({ block: { title, dayOfWeek, startTime, endTime }, context: (classId || teacherId || roomId) ? { classId, teacherId, roomId: roomId || undefined } : undefined })}>확인</button>
        </div>
      </div>
    </div>
  )
}


