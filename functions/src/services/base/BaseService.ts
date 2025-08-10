import { getFirestore } from '../../config/firebase';
import * as admin from 'firebase-admin';

export abstract class BaseService {
  protected db: admin.firestore.Firestore;
  
  constructor() {
    this.db = getFirestore();
  }
  
  protected getCollection(collectionName: string) {
    return this.db.collection(collectionName);
  }

  protected generateId(): string {
    return this.db.collection('_temp').doc().id;
  }
} 