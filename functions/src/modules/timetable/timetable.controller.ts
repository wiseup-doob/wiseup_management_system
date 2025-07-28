import { Request, Response } from 'express'
import * as svc from './timetable.service'

export const create = async (req: Request, res: Response): Promise<void> => {
  await svc.createOrReplace(req.params.id, {
    studentId: req.params.id,
    entries: req.body.entries,
    semester: req.body.semester,
    academicYear: req.body.academicYear
  })
  res.status(201).json({ message: 'created' })
}

export const list = async (_: Request, res: Response): Promise<void> => {
  const timetables = await svc.list()
  res.json(timetables)
}

export const detail = async (req: Request, res: Response): Promise<void> => {
  const tt = await svc.get(req.params.id)
  if (!tt) {
    const error = new Error('Timetable not found')
    ;(error as any).status = 404
    throw error
  }
  res.json(tt)
}

export const update = async (req: Request, res: Response): Promise<void> => {
  await svc.update(req.params.id, req.body)
  res.status(200).json({ message: 'updated' })
}

export const remove = async (req: Request, res: Response): Promise<void> => {
  await svc.remove(req.params.id)
  res.status(200).json({ message: 'deleted' })
}

export const getByFilter = async (req: Request, res: Response): Promise<void> => {
  // route에서 검증된 query parameter 사용
  const filterData = {
    studentId: req.params.id,
    ...(req as any).validatedQuery
  }
  
  const entries = await svc.getByFilter(filterData)
  res.json(entries)
}