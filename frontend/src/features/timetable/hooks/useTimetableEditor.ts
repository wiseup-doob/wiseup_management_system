import { useEffect, useMemo, useState } from 'react'
import type { TimetableBlock } from '@shared/types/timetable.types'
import type { TimetableItem, CreateTimetableItemRequest, TimeSlot } from '@shared/types'
import { timetableService } from '../../../services/timetableService'
import { omitUndefined, nullifyOptionals } from '../../../utils/sanitize'

type Diff = {
  toCreate: TimetableBlock[]
  toUpdate: TimetableBlock[]
  toDelete: TimetableBlock[]
}

export function useTimetableEditor(initialBlocks: TimetableBlock[] = []) {
  const [draftBlocks, setDraftBlocks] = useState<TimetableBlock[]>(initialBlocks)
  const [saving, setSaving] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [contextMap, setContextMap] = useState<Record<string, { timetableId?: string; classId: string; teacherId: string; roomId?: string; startDate: string; endDate?: string }>>({})

  useEffect(() => {
    // 초기 타임슬롯 로드 (캐시)
    (async () => {
      const res = await timetableService.getAllTimeSlots()
      if (res.success && res.data) setTimeSlots(res.data)
    })()
  }, [])

  const addBlock = (b: TimetableBlock) => setDraftBlocks(prev => [...prev, b])
  const updateBlock = (id: string, partial: Partial<TimetableBlock>) =>
    setDraftBlocks(prev => prev.map(b => (b.id === id ? { ...b, ...partial } : b)))
  const deleteBlock = (id: string) => setDraftBlocks(prev => prev.filter(b => b.id !== id))

  const hasChanges = useMemo(() => {
    const a = JSON.stringify([...initialBlocks].sort((x,y)=>x.id.localeCompare(y.id)))
    const b = JSON.stringify([...draftBlocks].sort((x,y)=>x.id.localeCompare(y.id)))
    return a !== b
  }, [initialBlocks, draftBlocks])

  const buildDiff = (): Diff => {
    const initialMap = new Map(initialBlocks.map(b => [b.id, b]))
    const draftMap = new Map(draftBlocks.map(b => [b.id, b]))

    const toCreate: TimetableBlock[] = []
    const toUpdate: TimetableBlock[] = []
    const toDelete: TimetableBlock[] = []

    for (const [id, b] of draftMap) {
      if (!initialMap.has(id)) toCreate.push(b)
      else if (JSON.stringify(initialMap.get(id)) !== JSON.stringify(b)) toUpdate.push(b)
    }
    for (const [id, b] of initialMap) {
      if (!draftMap.has(id)) toDelete.push(b)
    }
    return { toCreate, toUpdate, toDelete }
  }

  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const resolveTimeSlotId = async (startTime: string, endTime: string) => {
    let found = timeSlots.find(ts => ts.startTime === startTime && ts.endTime === endTime)
    if (found) return found.id
    const created = await timetableService.createTimeSlot({
      name: `${startTime}-${endTime}`,
      startTime,
      endTime,
      duration: toMinutes(endTime) - toMinutes(startTime),
      isBreak: false,
      order: (timeSlots?.length || 0) + 1
    })
    if (created.success && created.data) {
      setTimeSlots(prev => [...prev, created.data!])
      return created.data.id
    }
    throw new Error(created.error || '타임슬롯 생성 실패')
  }

  const setCreateContext = (blockId: string, ctx: { timetableId?: string; classId: string; teacherId: string; roomId?: string; startDate: string; endDate?: string }) => {
    setContextMap(prev => ({ ...prev, [blockId]: ctx }))
  }

  const saveChanges = async () => {
    setSaving(true)
    try {
      const diff = buildDiff()
      console.log('[SAVE] diff', diff)
      console.log('[SAVE] contextMap', contextMap)
      if (diff.toCreate.length === 0 && diff.toUpdate.length === 0 && diff.toDelete.length === 0) {
        return
      }
      // 예시: 서버 계약이 TimetableItem 기반이면 매핑 필요
      // 여기서는 간단히 create/update/delete API 호출 순차 처리
      for (const b of diff.toCreate) {
        const ctx = contextMap[b.id]
        if (!ctx?.classId || !ctx?.teacherId) throw new Error('새 블록의 수업/교사 정보가 없습니다.')
        const timeSlotId = await resolveTimeSlotId(b.startTime, b.endTime)
        let payload: CreateTimetableItemRequest = {
          timetableId: ctx.timetableId as any,
          classId: ctx.classId,
          teacherId: ctx.teacherId,
          dayOfWeek: b.dayOfWeek,
          timeSlotId,
          roomId: ctx.roomId,
          startDate: ctx.startDate,
          endDate: ctx.endDate,
          isRecurring: false,
          notes: b.notes
        }
        payload = omitUndefined(payload)
        payload = nullifyOptionals(payload as any, ['endDate','roomId','notes'])
        const res = await timetableService.createTimetableItem(payload)
        console.log('[SAVE][CREATE] payload', payload, 'res', res)
        if (!res.success) throw new Error(res.error || '항목 생성 실패')
      }
      for (const b of diff.toUpdate) {
        let update: Partial<TimetableItem> = {}
        update.dayOfWeek = b.dayOfWeek
        update.timeSlotId = await resolveTimeSlotId(b.startTime, b.endTime)
        if (b.notes !== undefined) update.notes = b.notes
        update = omitUndefined(update)
        update = nullifyOptionals(update as any, ['notes'])
        const res = await timetableService.updateTimetableItem(b.id, update)
        console.log('[SAVE][UPDATE] id', b.id, 'payload', update, 'res', res)
        if (!res.success) throw new Error(res.error || '항목 수정 실패')
      }
      for (const b of diff.toDelete) {
        const res = await timetableService.deleteTimetableItem(b.id)
        console.log('[SAVE][DELETE] id', b.id, 'res', res)
        if (!res.success) throw new Error(res.error || '항목 삭제 실패')
      }
    } finally {
      setSaving(false)
    }
  }

  return { draftBlocks, setDraftBlocks, addBlock, updateBlock, deleteBlock, hasChanges, saveChanges, saving, setCreateContext }
}


