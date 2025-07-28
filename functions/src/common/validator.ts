import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (e: any) {
      next({ status: 400, message: 'invalid_request', details: e.issues })
    }
  }

// Query parameter 검증용 미들웨어
export const validateQuery =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      // 검증된 데이터를 별도 속성에 저장하여 타입 충돌 방지
      const validatedQuery = schema.parse(req.query)
      ;(req as any).validatedQuery = validatedQuery
      next()
    } catch (e: any) {
      next({ status: 400, message: 'invalid_query_parameters', details: e.issues })
    }
  }

