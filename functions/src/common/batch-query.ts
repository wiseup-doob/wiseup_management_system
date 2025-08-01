import { db } from '../config/firebase';
import * as admin from 'firebase-admin';

export interface BatchQueryResult<T> {
  success: boolean;
  data: T[];
  errors?: string[];
}

export async function batchGetDocuments<T>(
  collection: string,
  ids: string[],
  converter: (doc: admin.firestore.DocumentSnapshot) => T
): Promise<BatchQueryResult<T>> {
  const results: T[] = [];
  const errors: string[] = [];

  // Firestore batch size limit is 10
  const batchSize = 10;
  const batches: string[][] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    batches.push(ids.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const docRefs = batch.map(id => db.collection(collection).doc(id));
    
    try {
      const snapshot = await db.getAll(...docRefs);
      snapshot.forEach((doc) => {
        if (doc.exists) {
          results.push(converter(doc));
        } else {
          errors.push(`Document ${doc.id} not found`);
        }
      });
    } catch (error) {
      errors.push(`Batch get failed: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    data: results,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export async function batchCreateDocuments<T extends admin.firestore.DocumentData>(
  collection: string,
  documents: { id?: string; data: T }[]
): Promise<BatchQueryResult<string>> {
  const results: string[] = [];
  const errors: string[] = [];

  // Firestore batch size limit is 500
  const batchSize = 500;
  const batches: { id?: string; data: T }[][] = [];

  for (let i = 0; i < documents.length; i += batchSize) {
    batches.push(documents.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const batchWrite = db.batch();
    
    batch.forEach(({ id, data }) => {
      const docRef = id 
        ? db.collection(collection).doc(id)
        : db.collection(collection).doc();
      
      batchWrite.set(docRef, data);
      results.push(docRef.id);
    });

    try {
      await batchWrite.commit();
    } catch (error) {
      errors.push(`Batch create failed: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    data: results,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export async function batchUpdateDocuments<T>(
  collection: string,
  updates: { id: string; data: Partial<T> }[]
): Promise<BatchQueryResult<string>> {
  const results: string[] = [];
  const errors: string[] = [];

  // Firestore batch size limit is 500
  const batchSize = 500;
  const batches: { id: string; data: Partial<T> }[][] = [];

  for (let i = 0; i < updates.length; i += batchSize) {
    batches.push(updates.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const batchWrite = db.batch();
    
    batch.forEach(({ id, data }) => {
      const docRef = db.collection(collection).doc(id);
      batchWrite.update(docRef, data);
      results.push(id);
    });

    try {
      await batchWrite.commit();
    } catch (error) {
      errors.push(`Batch update failed: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    data: results,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export async function batchDeleteDocuments(
  collection: string,
  ids: string[]
): Promise<BatchQueryResult<string>> {
  const results: string[] = [];
  const errors: string[] = [];

  // Firestore batch size limit is 500
  const batchSize = 500;
  const batches: string[][] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    batches.push(ids.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const batchWrite = db.batch();
    
    batch.forEach((id) => {
      const docRef = db.collection(collection).doc(id);
      batchWrite.delete(docRef);
      results.push(id);
    });

    try {
      await batchWrite.commit();
    } catch (error) {
      errors.push(`Batch delete failed: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    data: results,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export class OptimizedQueryBuilder<T> {
  private query: admin.firestore.Query;

  constructor(collection: string) {
    this.query = db.collection(collection);
  }

  where(field: string, op: admin.firestore.WhereFilterOp, value: any): OptimizedQueryBuilder<T> {
    this.query = this.query.where(field, op, value);
    return this;
  }

  orderBy(field: string, direction: admin.firestore.OrderByDirection = 'asc'): OptimizedQueryBuilder<T> {
    this.query = this.query.orderBy(field, direction);
    return this;
  }

  limit(limit: number): OptimizedQueryBuilder<T> {
    this.query = this.query.limit(limit);
    return this;
  }

  offset(offset: number): OptimizedQueryBuilder<T> {
    this.query = this.query.offset(offset);
    return this;
  }

  async get(converter: (doc: admin.firestore.QueryDocumentSnapshot) => T): Promise<T[]> {
    const snapshot = await this.query.get();
    return snapshot.docs.map(converter);
  }

  async getOne(converter: (doc: admin.firestore.QueryDocumentSnapshot) => T): Promise<T | null> {
    const snapshot = await this.query.limit(1).get();
    return snapshot.empty ? null : converter(snapshot.docs[0]);
  }

  // 내부 쿼리 객체에 접근하기 위한 getter
  get queryObject(): admin.firestore.Query {
    return this.query;
  }
} 