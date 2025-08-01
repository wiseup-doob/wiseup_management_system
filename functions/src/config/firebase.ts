// functions/src/config/firebase.ts

import * as admin from "firebase-admin";
import {getApps} from "firebase-admin/app";

// Firebase 앱이 중복 초기화되지 않도록 확인
if (!getApps().length) {
  // 에뮬레이터 환경에서는 프로젝트 ID 명시적 설정
  if (process.env.FUNCTIONS_EMULATOR) {
    admin.initializeApp({
      projectId: "wiseupmanagementsystem",
    });
  } else {
    admin.initializeApp();
  }
}

export const db = admin.firestore();

// 에뮬레이터 환경일 때 Firestore 연결 설정
if (process.env.FUNCTIONS_EMULATOR) {
  db.settings({
    host: "localhost:8080",
    ssl: false,
  });
}
