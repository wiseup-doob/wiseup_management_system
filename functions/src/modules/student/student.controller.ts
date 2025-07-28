import { Request, Response } from 'express'
import * as svc from './student.service'

/**
 * POST /students/:id
 * body: Student
 */
export const create = async (req: Request,res: Response): Promise<void> => {
  await svc.createStudent(req.params.id, req.body)
  res.status(201).json({ message: 'created' })
}

/**
 * GET /students
 */
export const list = async (_req: Request, res: Response): Promise<void> => {
  const all = await svc.getAllStudents()
  res.json(all)
}

/**
 * GET /students/:id
 */
export const detail = async ( req: Request,res: Response ): Promise<void> => {
  const student = await svc.getStudent(req.params.id)
  if (!student) {
    res.status(404).json({ error: 'not_found' })
    return 
  }

  res.json(student) // void 반환
}

/**
 * GET /students/user/:user_id
 * 특정 user_id로 학생 조회
 */
export const getByUserId = async (req: Request, res: Response): Promise<void> => {
  const student = await svc.getStudentByUserId(req.params.user_id)
  if (!student) {
    res.status(404).json({ error: 'student_not_found' })
    return
  }
  res.json(student)
}

/**
 * GET /students/search?user_id=...&name=...&school=...&grade=...
 * 필터로 학생 검색
 */
export const searchStudents = async (req: Request, res: Response): Promise<void> => {
  const students = await svc.getStudentsByFilter((req as any).validatedQuery)
  res.json(students)
}

/**
 * PUT /students/:id
 * body: Partial<Student>
 */
export const update = async (req: Request,res: Response): Promise<void> => {
  await svc.updateStudent(req.params.id, req.body)
  res.json({ message: 'updated' })
}

/**
 * DELETE /students/:id
 */
export const remove = async (req: Request,res: Response): Promise<void> => {
  await svc.deleteStudent(req.params.id)
  res.json({ message: 'deleted' })
}