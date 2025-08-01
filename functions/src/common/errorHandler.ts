import {Request, Response, NextFunction} from "express";
import {logger} from "firebase-functions/v2";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(err);
  const status = err.status ?? 500;
  res.status(status).json({error: err.message ?? "internal_error"});
}
