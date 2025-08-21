import * as admin from 'firebase-admin';

export abstract class BaseService {
  protected _db: admin.firestore.Firestore | null = null;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Firestore 인스턴스를 지연 초기화
  protected get db(): admin.firestore.Firestore {
    if (!this._db) {
      this._db = admin.firestore();
    }
    return this._db;
  }

  // 문서 생성
  protected async create<T extends admin.firestore.DocumentData>(data: T): Promise<string> {
    const docRef = await this.db.collection(this.collectionName).add(data);
    return docRef.id;
  }

  // ID로 문서 조회
  protected async getById<T>(id: string): Promise<T | null> {
    const doc = await this.db.collection(this.collectionName).doc(id).get();
    
    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() } as T;
  }

  // 문서 수정
  protected async update<T>(id: string, data: Partial<T>): Promise<void> {
    await this.db.collection(this.collectionName).doc(id).update(data);
  }

  // 문서 삭제
  protected async delete(id: string): Promise<void> {
    await this.db.collection(this.collectionName).doc(id).delete();
  }

  // 모든 문서 조회
  protected async getAll<T>(): Promise<T[]> {
    const snapshot = await this.db.collection(this.collectionName).get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  }

  // 쿼리로 문서 검색
  protected async search<T>(query: admin.firestore.Query): Promise<T[]> {
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  }

  // 배치로 여러 문서 생성
  protected async batchCreate<T extends admin.firestore.DocumentData>(dataList: T[]): Promise<string[]> {
    const batch = this.db.batch();
    const docRefs: admin.firestore.DocumentReference[] = [];

    dataList.forEach(data => {
      const docRef = this.db.collection(this.collectionName).doc();
      docRefs.push(docRef);
      batch.set(docRef, data);
    });

    await batch.commit();
    return docRefs.map(ref => ref.id);
  }

  // 트랜잭션 실행
  protected async runTransaction<T>(
    updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
  ): Promise<T> {
    return this.db.runTransaction(updateFunction);
  }
}
