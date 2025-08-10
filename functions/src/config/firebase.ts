import * as admin from 'firebase-admin';

// Firebase 인스턴스 캐싱
let firestoreInstance: admin.firestore.Firestore | null = null;

const ensureEmulatorEnv = () => {
  const useEmulator = process.env.USE_EMULATOR === 'true';
  if (useEmulator) {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      // 기본 Firestore 에뮬레이터 호스트 설정
      process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    }
    if (!process.env.FIREBASE_PROJECT_ID) {
      process.env.FIREBASE_PROJECT_ID = 'wiseupmanagementsystem';
    }
    console.log(
      `[Firestore] 에뮬레이터 사용: host=${process.env.FIRESTORE_EMULATOR_HOST}, projectId=${process.env.FIREBASE_PROJECT_ID}`
    );
  }
  return useEmulator;
};

// Firebase Admin 초기화
export const initializeFirebase = (): void => {
  try {
    if (!admin.apps.length) {
      const useEmulator = ensureEmulatorEnv();
      if (useEmulator) {
        admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
      } else {
        admin.initializeApp();
      }
      console.log('Firebase Admin 초기화 완료');
    } else {
      console.log('Firebase Admin 이미 초기화됨');
    }
  } catch (error) {
    console.error('Firebase Admin 초기화 오류:', error);
    throw error;
  }
};

export const getFirestore = (): admin.firestore.Firestore => {
  try {
    if (!firestoreInstance) {
      // Firebase가 초기화되지 않았다면 초기화 (에뮬레이터 설정 포함)
      if (!admin.apps.length) {
        const useEmulator = ensureEmulatorEnv();
        if (useEmulator) {
          admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
          console.log('Firebase Admin 초기화 완료 (getFirestore, emulator)');
        } else {
          admin.initializeApp();
          console.log('Firebase Admin 초기화 완료 (getFirestore)');
        }
      }

      firestoreInstance = admin.firestore();
      
      // 에뮬레이터 연결 상태 확인
      const useEmulator = process.env.USE_EMULATOR === 'true';
      if (useEmulator) {
        console.log('🔍 Firestore 에뮬레이터 설정 확인:', {
          host: process.env.FIRESTORE_EMULATOR_HOST,
          projectId: process.env.FIREBASE_PROJECT_ID,
          useEmulator
        });
        
        // 에뮬레이터 연결 테스트
        firestoreInstance.collection('_test_connection').doc('test').get()
          .then(() => console.log('✅ Firestore 에뮬레이터 연결 성공'))
          .catch((error) => {
            console.warn('⚠️ Firestore 에뮬레이터 연결 경고:', error.message);
            console.log('💡 에뮬레이터가 실행 중인지 확인하세요: firebase emulators:start --only firestore');
          });
      }
      
      // undefined 값을 문서에 쓸 때 오류가 나지 않도록 무시 설정
      try {
        firestoreInstance.settings({ ignoreUndefinedProperties: true } as any);
        console.log('Firestore 설정: ignoreUndefinedProperties=true 적용');
      } catch (e) {
        console.warn('Firestore 설정 적용 경고:', e);
      }
      console.log('Firestore 인스턴스 생성 완료');
    }

    return firestoreInstance;
  } catch (error) {
    console.error('Firestore 인스턴스 생성 오류:', error);
    throw error;
  }
};