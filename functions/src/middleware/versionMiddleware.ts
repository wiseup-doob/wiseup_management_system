import { Request, Response, NextFunction } from 'express';
import { API_VERSIONS } from '@shared/constants';

// API 버전 관리 미들웨어
export const versionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // API 버전을 요청 헤더에서 추출
  const apiVersion = req.headers['x-api-version'] || req.headers['accept-version'] || API_VERSIONS.CURRENT;
  
  // 요청 객체에 버전 정보 추가
  (req as any).apiVersion = apiVersion;
  
  // 응답 헤더에 현재 API 버전 추가
  res.set('X-API-Version', API_VERSIONS.CURRENT);
  
  // 지원하지 않는 버전에 대한 처리
  if (apiVersion !== API_VERSIONS.CURRENT) {
    res.status(400).json({
      success: false,
      error: 'UNSUPPORTED_API_VERSION',
      message: `API 버전 ${apiVersion}은 지원되지 않습니다. 현재 버전: ${API_VERSIONS.CURRENT}`,
      meta: {
        requestedVersion: apiVersion,
        currentVersion: API_VERSIONS.CURRENT,
        supportedVersions: [API_VERSIONS.CURRENT]
      }
    });
    return;
  }
  
  next();
};

// 버전별 라우팅 미들웨어
export const versionRouter = (version: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if ((req as any).apiVersion === version) {
      next();
    } else {
      next('route'); // 다음 라우트로 넘어감
    }
  };
};
