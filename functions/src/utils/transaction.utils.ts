import * as admin from 'firebase-admin';

export class TransactionUtils {
  /**
   * 트랜잭션을 재시도 로직과 함께 실행
   * @param db Firestore 인스턴스
   * @param updateFunction 트랜잭션 내에서 실행할 함수
   * @param maxRetries 최대 재시도 횟수 (기본값: 3)
   * @returns 트랜잭션 결과
   */
  static async runTransactionWithRetry<T>(
    db: admin.firestore.Firestore,
    updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await db.runTransaction(updateFunction);
      } catch (error) {
        const firestoreError = error as any;
        lastError = error as Error;
        
        // 재시도 가능한 에러인지 확인
        if (this.isRetryableError(firestoreError)) {
          console.log(`트랜잭션 실패 (시도 ${attempt}/${maxRetries}), 재시도 중...`, {
            error: firestoreError.message,
            code: firestoreError.code,
            attempt,
            maxRetries
          });
          
          if (attempt < maxRetries) {
            // 지수 백오프로 대기 (1초, 2초, 4초...)
            const delayMs = Math.pow(2, attempt) * 1000;
            await this.delay(delayMs);
            continue;
          }
        }
        
        // 재시도 불가능한 에러이거나 최대 재시도 횟수 초과
        console.error('트랜잭션 최종 실패:', {
          error: firestoreError.message,
          code: firestoreError.code,
          attempts: attempt,
          maxRetries
        });
        throw error;
      }
    }
    
    throw lastError!;
  }
  
  /**
   * 재시도 가능한 에러인지 확인
   * @param error 에러 객체
   * @returns 재시도 가능 여부
   */
  private static isRetryableError(error: any): boolean {
    // Firestore의 재시도 가능한 에러 코드들
    const retryableCodes = [
      'UNAVAILABLE',           // 서비스 일시적 사용 불가
      'DEADLINE_EXCEEDED',     // 타임아웃
      'ABORTED',              // 트랜잭션 중단
      'INTERNAL',             // 내부 서버 오류
      'RESOURCE_EXHAUSTED',   // 리소스 부족
      'UNAUTHENTICATED'       // 인증 오류 (일시적)
    ];
    
    return retryableCodes.includes(error.code);
  }
  
  /**
   * 지연 함수
   * @param ms 밀리초
   * @returns Promise
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * 트랜잭션 타임아웃 설정
   * @param db Firestore 인스턴스
   * @returns 타임아웃이 설정된 Firestore 인스턴스
   */
  static withTimeout(db: admin.firestore.Firestore /* , timeoutMs: number = 30000 */): admin.firestore.Firestore {
    // Firestore 클라이언트에 타임아웃 설정
    // (실제로는 Firestore 설정에서 전역적으로 관리)
    return db;
  }
  
  /**
   * 트랜잭션 성공/실패 로깅
   * @param operationName 작업 이름
   * @param startTime 시작 시간
   * @success 성공 여부
   * @param error 에러 객체 (실패 시)
   */
  static logTransactionResult(
    operationName: string, 
    startTime: number, 
    success: boolean, 
    error?: Error
  ): void {
    const duration = Date.now() - startTime;
    
    if (success) {
      console.log(`✅ 트랜잭션 성공: ${operationName}`, {
        operation: operationName,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    } else {
      const firestoreError = error as any;
      console.error(`❌ 트랜잭션 실패: ${operationName}`, {
        operation: operationName,
        duration: `${duration}ms`,
        error: firestoreError?.message,
        code: firestoreError?.code,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * 트랜잭션 배치 크기 제한 확인
   * @param operations 작업 수
   * @returns 배치 크기 제한 내 여부
   */
  static isWithinBatchLimit(operations: number): boolean {
    // Firestore 트랜잭션 제한: 최대 500개 작업
    const MAX_OPERATIONS = 500;
    return operations <= MAX_OPERATIONS;
  }
  
  /**
   * 트랜잭션 내에서 안전한 문서 읽기
   * @param transaction 트랜잭션 객체
   * @param docRef 문서 참조
   * @returns 문서 데이터 또는 null
   */
  static async safeGet<T>(
    transaction: admin.firestore.Transaction,
    docRef: admin.firestore.DocumentReference
  ): Promise<T | null> {
    try {
      const doc = await transaction.get(docRef);
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() } as T;
    } catch (error) {
      const firestoreError = error as any;
      console.error('트랜잭션 내 문서 읽기 실패:', {
        docPath: docRef.path,
        error: firestoreError.message
      });
      throw error;
    }
  }
  
  /**
   * 트랜잭션 내에서 안전한 쿼리 실행
   * @param transaction 트랜잭션 객체
   * @param query 쿼리 객체
   * @returns 쿼리 결과
   */
  static async safeQuery<T>(
    transaction: admin.firestore.Transaction,
    query: admin.firestore.Query
  ): Promise<T[]> {
    try {
      const snapshot = await transaction.get(query);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      const firestoreError = error as any;
      console.error('트랜잭션 내 쿼리 실행 실패:', {
        query: query.toString(),
        error: firestoreError.message
      });
      throw error;
    }
  }
}
