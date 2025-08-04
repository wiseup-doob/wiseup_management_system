import * as admin from "firebase-admin";

// Firebase Admin 초기화
export const initializeFirebase = (): void => {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
};

export const getFirestore = (): FirebaseFirestore.Firestore => {
  // Firebase가 초기화되지 않았다면 초기화
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore();
}; 