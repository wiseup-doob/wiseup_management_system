# WiseUp Management System - 환경 설정 가이드

> 새로운 개발자를 위한 프로젝트 초기 설정 가이드입니다.

## 📋 목차

- [필수 요구사항](#-필수-요구사항)
- [프로젝트 클론](#-프로젝트-클론)
- [의존성 설치](#-의존성-설치)
- [환경 변수 설정](#-환경-변수-설정)
- [Firebase 설정](#-firebase-설정)
- [개발 환경 실행](#-개발-환경-실행)
- [트러블슈팅](#-트러블슈팅)
- [다음 단계](#-다음-단계)

---

## 🔧 필수 요구사항

### 1. Node.js 설치
- **버전**: 20.x 이상
- **확인**: `node --version`

```bash
# Node.js 설치 (macOS - Homebrew)
brew install node@20

# Node.js 설치 (Windows - nvm-windows)
nvm install 20
nvm use 20

# Node.js 설치 (Linux)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Firebase CLI 설치
```bash
npm install -g firebase-tools

# 설치 확인
firebase --version
```

### 3. Git 설치 확인
```bash
git --version
```

---

## 📦 프로젝트 클론

```bash
# 저장소 클론
git clone <repository-url>
cd wiseUp_management_system_online_academy

# 브랜치 확인
git branch -a
```

---

## 📚 의존성 설치

```bash
# 루트 의존성 설치
npm install

# 프론트엔드 의존성 설치
cd frontend
npm install
cd ..

# 백엔드 의존성 설치
cd functions
npm install
cd ..

# Shared 모듈 의존성 설치
cd shared
npm install
cd ..
```

**예상 소요 시간**: 5-10분

---

## 🔐 환경 변수 설정

### 1. Frontend 환경 변수

#### Step 1: 템플릿 파일 확인
프로젝트에 이미 `.env`, `.env.test` 파일이 있는지 확인:

```bash
ls -la frontend/.env*
```

#### Step 2: 환경 변수 파일 생성/수정

**Option A: 기존 파일이 있는 경우**
- 프로젝트 관리자에게 실제 Firebase 프로젝트 정보 확인
- 필요 시 값 수정

**Option B: 기존 파일이 없는 경우**

##### `frontend/.env` (프로덕션)
```bash
cat > frontend/.env << 'EOF'
# 프로덕션 환경 설정
VITE_API_BASE_URL=https://asia-northeast3-[PROD_PROJECT_ID].cloudfunctions.net/api
VITE_FIREBASE_PROJECT_ID=[PROD_PROJECT_ID]
VITE_ENVIRONMENT=production
EOF
```

##### `frontend/.env.test` (테스트)
```bash
cat > frontend/.env.test << 'EOF'
# 테스트 환경 설정
VITE_API_BASE_URL=https://asia-northeast3-[TEST_PROJECT_ID].cloudfunctions.net/api
VITE_FIREBASE_PROJECT_ID=[TEST_PROJECT_ID]
VITE_ENVIRONMENT=test
EOF
```

##### `frontend/.env.local` (로컬 개발 - 선택사항)
```bash
cat > frontend/.env.local << 'EOF'
# 로컬 개발 환경 설정
VITE_API_BASE_URL=http://localhost:5001/[PROJECT_ID]/us-central1/wiseupApi/api
VITE_FIREBASE_PROJECT_ID=[PROJECT_ID]
VITE_ENVIRONMENT=local
EOF
```

#### Step 3: 플레이스홀더 값 교체

**교체해야 할 값:**
- `[PROD_PROJECT_ID]`: 프로덕션 Firebase 프로젝트 ID
- `[TEST_PROJECT_ID]`: 테스트 Firebase 프로젝트 ID
- `[PROJECT_ID]`: 기본 Firebase 프로젝트 ID

**값 확인 방법:**
1. Firebase Console (https://console.firebase.google.com) 접속
2. 프로젝트 설정 → 프로젝트 ID 확인
3. 또는 `.firebaserc` 파일 확인:
   ```bash
   cat .firebaserc
   ```

---

### 2. Backend 환경 변수

Backend(Functions)는 별도 `.env` 파일이 필요 없습니다.

#### 로컬 개발
`dev.sh` 스크립트가 자동으로 설정:
```bash
JWT_SECRET="dev-secret-key-change-in-production"
NODE_ENV="development"
```

#### 프로덕션/테스트 배포
Firebase Functions 환경 변수 설정 필요 (배포 시 안내됨)

---

## 🔥 Firebase 설정

### 1. Firebase 로그인
```bash
firebase login
```

브라우저가 열리면 Google 계정으로 로그인하세요.

### 2. Firebase 프로젝트 확인
```bash
# 사용 가능한 프로젝트 확인
firebase projects:list

# .firebaserc에 정의된 프로젝트 확인
cat .firebaserc
```

**출력 예시:**
```json
{
  "projects": {
    "default": "[PRODUCTION_PROJECT_ID]",
    "test": "[TEST_PROJECT_ID]"
  }
}
```

### 3. 프로젝트 선택
```bash
# 기본(프로덕션) 프로젝트 선택
firebase use default

# 또는 테스트 프로젝트 선택
firebase use test
```

### 4. Firebase 프로젝트 권한 확인
프로젝트 관리자에게 다음 권한 요청:
- **Editor** 또는 **Owner** 역할
- **Functions 배포 권한**
- **Firestore 읽기/쓰기 권한**

권한이 없으면 `firebase deploy` 시 에러 발생합니다.

---

## 🚀 개발 환경 실행

### 방법 1: 자동 스크립트 (권장)

```bash
# 루트 디렉토리에서 실행
./dev.sh
```

**스크립트가 자동으로 수행하는 작업:**
1. ✅ 기존 프로세스 종료 (포트 충돌 방지)
2. ✅ Shared 모듈 빌드
3. ✅ Frontend 빌드
4. ✅ Backend 빌드
5. ✅ Firebase Emulators 시작
6. ✅ 헬스 체크
7. ✅ 샘플 데이터 초기화
8. ✅ Frontend 개발 서버 시작

**예상 소요 시간**: 2-3분

**성공 시 출력:**
```
✅ All services are healthy!
🔥 Firebase Emulators running...
🌐 Frontend dev server starting...
```

**접속 주소:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/[PROJECT_ID]/us-central1/wiseupApi/api
- Firestore Emulator: http://localhost:8080
- Emulator UI: http://localhost:4001 (또는 4002 - 포트 충돌 시 자동 변경됨)

---

### 방법 2: 수동 실행

#### 터미널 1: Shared 모듈 빌드
```bash
cd shared
npx tsc --watch
```

#### 터미널 2: Backend 실행
```bash
cd functions

# JWT_SECRET 환경 변수 설정
export JWT_SECRET="dev-secret-key-change-in-production"
export NODE_ENV="development"

# Firebase Emulator 시작
npm run serve
```

#### 터미널 3: Frontend 실행
```bash
cd frontend
npm run dev
```

---

## 🧪 환경 확인

### 1. Frontend 확인
브라우저에서 http://localhost:5173 접속

**예상 화면:**
- 로그인 페이지 또는 홈 화면
- 사이드바가 표시됨

### 2. Backend API 확인
```bash
# Health check
curl http://localhost:5001/[PROJECT_ID]/us-central1/wiseupApi/api/health

# 예상 응답
{"status":"ok","timestamp":"2025-01-07T..."}
```

### 3. Firestore Emulator 확인
브라우저에서 http://localhost:4001 접속 (포트 충돌 시 4002로 자동 변경됨)

**예상 화면:**
- Firebase Emulator Suite UI
- Firestore 데이터 확인 가능
- Functions 로그 확인 가능

**참고**: `firebase.json`에서 UI 포트가 4001로 설정되어 있지만, 포트 충돌 시 자동으로 4002로 변경됩니다.

---

## 🐛 트러블슈팅

### 문제 1: `./dev.sh` 실행 권한 에러
```bash
# 에러
-bash: ./dev.sh: Permission denied

# 해결
chmod +x dev.sh
./dev.sh
```

---

### 문제 2: 포트 이미 사용 중
```bash
# 에러
Port 5173 is already in use

# 해결 (각 포트별)
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:5001 | xargs kill -9  # Functions
lsof -ti:8080 | xargs kill -9  # Firestore
lsof -ti:4001 | xargs kill -9  # Emulator UI

# 또는 dev.sh 재실행 (자동으로 포트 정리)
./dev.sh
```

---

### 문제 3: Firebase 권한 에러
```bash
# 에러
Error: HTTP Error: 403, The caller does not have permission

# 해결
1. 프로젝트 관리자에게 권한 요청
2. Firebase Console에서 권한 확인
3. firebase login 재실행
```

---

### 문제 4: Node.js 버전 에러
```bash
# 에러
Error: The engines field in the package.json file for this function specifies that it requires Node.js 20

# 해결
# Node.js 버전 확인
node --version

# Node.js 20 설치
nvm install 20
nvm use 20
```

---

### 문제 5: 환경 변수 로드 안됨
```bash
# 확인
cd frontend
cat .env

# .env 파일이 없거나 비어있으면
# "환경 변수 설정" 섹션 다시 진행
```

---

### 문제 6: Shared 모듈 에러
```bash
# 에러
Cannot find module '@wiseup/shared'

# 해결
cd shared
npm install
npx tsc
cd ..
```

---

### 문제 7: Firebase Emulator 시작 실패
```bash
# 에러
Error: Could not start Firestore Emulator

# 해결 1: Java 설치 확인 (Firestore Emulator 필요)
java -version

# Java 설치 (macOS)
brew install openjdk@11

# 해결 2: 포트 충돌 확인
lsof -ti:8080 | xargs kill -9

# 해결 3: Emulator 캐시 삭제
rm -rf ~/.cache/firebase/emulators
```

---

### 문제 8: `npm install` 실패
```bash
# 에러
npm ERR! code EACCES

# 해결 1: npm 캐시 정리
npm cache clean --force

# 해결 2: node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 해결 3: 권한 문제 (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
```

---

## ✅ 설정 완료 체크리스트

완료된 항목에 체크하세요:

### 필수 요구사항
- [ ] Node.js 20.x 이상 설치 확인
- [ ] Firebase CLI 설치 확인
- [ ] Git 설치 확인

### 프로젝트 설정
- [ ] 프로젝트 클론 완료
- [ ] 루트 의존성 설치
- [ ] Frontend 의존성 설치
- [ ] Backend 의존성 설치
- [ ] Shared 의존성 설치

### 환경 변수
- [ ] `frontend/.env` 파일 생성/확인
- [ ] `frontend/.env.test` 파일 생성/확인
- [ ] Firebase 프로젝트 ID 확인 및 입력
- [ ] API URL 확인 및 입력

### Firebase
- [ ] Firebase 로그인 완료
- [ ] Firebase 프로젝트 권한 확인
- [ ] Firebase 프로젝트 선택 (`firebase use`)

### 개발 환경
- [ ] `./dev.sh` 실행 성공
- [ ] Frontend 접속 확인 (localhost:5173)
- [ ] Backend API 응답 확인
- [ ] Firestore Emulator UI 접속 확인 (localhost:4001 또는 4002)

---

## 📝 다음 단계

환경 설정이 완료되었다면 다음 문서들을 참고하세요:

### 1. 프로젝트 이해하기
- **[README.md](README.md)**: 프로젝트 전체 개요
- **[CLAUDE.md](CLAUDE.md)**: 개발 가이드 (가장 중요!)
- **[database_structure.md](database_structure.md)**: 데이터베이스 스키마

### 2. 아키텍처 이해하기
- **[timetable-version-system-plan.md](timetable-version-system-plan.md)**: 버전 시스템
- **[VERSION_BASED_CLASS_TEACHER_PLAN.md](VERSION_BASED_CLASS_TEACHER_PLAN.md)**: 수업/교사 관리

### 3. 개발 시작하기
- Feature 브랜치 생성: `git checkout -b feature/my-feature`
- 코딩 컨벤션 확인: [README.md - 코딩 컨벤션](README.md#-코딩-컨벤션)
- 첫 번째 이슈 선택 및 작업 시작

### 4. 유용한 명령어
```bash
# Frontend 개발
cd frontend
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run lint         # 린트 체크

# Backend 개발
cd functions
npm run serve        # Emulator 시작
npm run build        # 빌드
npm run logs         # Functions 로그

# Shared 모듈
cd shared
npx tsc             # 빌드
npm run dev         # Watch 모드
```

---

## 🆘 도움이 필요한 경우

### 팀 문의
- **Slack**: #dev-wiseup 채널
- **이메일**: dev-team@wiseup.com
- **GitHub Issues**: 버그 리포트 및 기능 요청

### 자주 하는 질문

**Q: Firebase 프로젝트 권한은 어떻게 받나요?**
A: 프로젝트 관리자(PM 또는 Tech Lead)에게 이메일 주소와 함께 요청하세요.

**Q: 테스트 데이터는 어떻게 생성하나요?**
A: `./dev.sh` 실행 시 자동으로 샘플 데이터가 생성됩니다. 또는 Emulator UI에서 수동으로 추가 가능합니다.

**Q: 프로덕션 데이터베이스에 접근할 수 있나요?**
A: 로컬 개발은 Emulator만 사용합니다. 프로덕션 데이터 접근은 제한되어 있습니다.

**Q: 커밋 컨벤션은 무엇인가요?**
A: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:` 접두사를 사용합니다. 자세한 내용은 [README.md](README.md#git-commit)를 참고하세요.

**Q: 브랜치 전략은 무엇인가요?**
A: `main` (프로덕션), `develop` (개발), `feature/*` (기능 개발)을 사용합니다.

---

## 🎉 환영합니다!

설정이 완료되었습니다! WiseUp 프로젝트에 오신 것을 환영합니다.

Happy Coding! 🚀

---

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-01-07
**작성자**: WiseUp Dev Team
