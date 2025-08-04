import { getFirestore } from '../../config/firebase';

export abstract class BaseService {
  protected db: FirebaseFirestore.Firestore;
  
  constructor() {
    this.db = getFirestore();
  }
  
  protected getCollection(collectionName: string) {
    return this.db.collection(collectionName);
  }
} 