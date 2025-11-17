# 환경 변수 설정 가이드

이 문서는 WiseUp Management System의 환경 변수 구조와 설정 방법을 설명합니다.

## 📋 목차

- [환경 변수 개요](#환경-변수-개요)
- [Frontend 환경 변수](#frontend-환경-변수)
- [Backend 환경 변수](#backend-환경-변수)
- [환경별 설정](#환경별-설정)
- [보안 모범 사례](#보안-모범-사례)

---

## 환경 변수 개요

### 프로젝트 구조
```
wiseUp_management_system_online_academy/
├── frontend/
│   ├── .env                 # 프로덕션 환경 변수
│   ├── .env.test            # 테스트 환경 변수
│   ├── .env.local           # 로컬 환경 변수 (선택사항)
│   └── .env.example         # 환경 변수 템플릿
├── functions/               # Backend - 별도 .env 파일 없음
├── .firebaserc              # Firebase 프로젝트 설정
└── dev.sh                   # 로컬 개발 환경 스크립트
```

### 환경 변수 우선순위

**Vite (Frontend) 로드 순서:**
1. `.env.[mode].local` (예: `.env.production.local`)
2. `.env.[mode]` (예: `.env.production`, `.env.test`)
3. `.env.local`
4. `.env`

**빌드 명령어별 사용 파일:**
- `npm run dev` → `.env.local` → `.env`
- `npm run build` → `.env`
- `npm run build:test` → `.env.test`
- `npm run build:local` → `.env.local` → `.env`

---

## Frontend 환경 변수

### 필수 변수

#### `VITE_API_BASE_URL`
**설명**: Firebase Functions API의 엔드포인트 URL

**형식**:
- 프로덕션/테스트: `https://[REGION]-[PROJECT_ID].cloudfunctions.net/api`
- 로컬: `http://localhost:5001/[PROJECT_ID]/us-central1/wiseupApi/api`

**예시**:
```env
# 프로덕션
VITE_API_BASE_URL=https://asia-northeast3-wiseupmanagementsystem-a6189.cloudfunctions.net/api

# 테스트
VITE_API_BASE_URL=https://asia-northeast3-wiseupmanagementprogramtest.cloudfunctions.net/api

# 로컬
VITE_API_BASE_URL=http://localhost:5001/wiseupmanagementsystem-a6189/us-central1/wiseupApi/api
```

---

#### `VITE_FIREBASE_PROJECT_ID`
**설명**: Firebase 프로젝트 고유 ID

**확인 방법**:
1. Firebase Console → 프로젝트 설정
2. `.firebaserc` 파일 확인
3. `firebase projects:list` 명령어

**예시**:
```env
# 프로덕션
VITE_FIREBASE_PROJECT_ID=wiseupmanagementsystem-a6189

# 테스트
VITE_FIREBASE_PROJECT_ID=wiseupmanagementprogramtest
```

---

#### `VITE_ENVIRONMENT`
**설명**: 현재 실행 환경

**가능한 값**:
- `production`: 프로덕션 환경
- `test`: 테스트 환경
- `local`: 로컬 개발 환경

**예시**:
```env
VITE_ENVIRONMENT=production
```

---

### 환경별 파일 설정

#### `.env` (프로덕션)
```env
# 프로덕션 환경 설정
VITE_API_BASE_URL=https://asia-northeast3-[PROD_PROJECT_ID].cloudfunctions.net/api
VITE_FIREBASE_PROJECT_ID=[PROD_PROJECT_ID]
VITE_ENVIRONMENT=production
```

**사용 시점**:
- `npm run build` 실행 시
- 프로덕션 배포 시

---

#### `.env.test` (테스트)
```env
# 테스트 환경 설정
VITE_API_BASE_URL=https://asia-northeast3-[TEST_PROJECT_ID].cloudfunctions.net/api
VITE_FIREBASE_PROJECT_ID=[TEST_PROJECT_ID]
VITE_ENVIRONMENT=test
```

**사용 시점**:
- `npm run build:test` 실행 시
- 테스트 환경 배포 시

---

#### `.env.local` (로컬 개발 - 선택사항)
```env
# 로컬 개발 환경 설정
VITE_API_BASE_URL=http://localhost:5001/[PROJECT_ID]/us-central1/wiseupApi/api
VITE_FIREBASE_PROJECT_ID=[PROJECT_ID]
VITE_ENVIRONMENT=local
```

**사용 시점**:
- `npm run dev` 실행 시 (Emulator 사용)
- `npm run build:local` 실행 시

**참고**:
- 이 파일은 `.gitignore`에 포함되어 개인별로 관리됩니다
- 필수는 아니며, 없으면 `.env` 사용

---

### 환경 변수 생성 방법

#### 방법 1: 템플릿 복사
```bash
cd frontend

# 프로덕션
cp .env.example .env

# 테스트
cp .env.example .env.test

# 로컬
cp .env.example .env.local
```

#### 방법 2: 직접 생성
```bash
cd frontend

# .env 파일 생성
cat > .env << 'EOF'
VITE_API_BASE_URL=https://asia-northeast3-[PROJECT_ID].cloudfunctions.net/api
VITE_FIREBASE_PROJECT_ID=[PROJECT_ID]
VITE_ENVIRONMENT=production
EOF
```

#### 방법 3: 에디터로 생성
```bash
cd frontend
nano .env  # 또는 vim, code, 등
```

---

## Backend 환경 변수

### 로컬 개발 환경

Backend는 별도 `.env` 파일이 없습니다. `dev.sh` 스크립트에서 자동으로 설정됩니다.

**`dev.sh` 94-95줄:**
```bash
export JWT_SECRET="dev-secret-key-change-in-production"
export NODE_ENV="development"
```

**사용되는 변수:**
- `JWT_SECRET`: JWT 토큰 서명에 사용되는 비밀 키
- `NODE_ENV`: Node.js 실행 환경

---

### 프로덕션/테스트 환경

Firebase Console 또는 Firebase CLI로 설정해야 합니다.

#### Firebase CLI 사용
```bash
# 프로덕션 환경
firebase use default
firebase functions:config:set jwt.secret="[PRODUCTION_SECRET_KEY]"

# 테스트 환경
firebase use test
firebase functions:config:set jwt.secret="[TEST_SECRET_KEY]"

# 설정 확인
firebase functions:config:get

# 배포
firebase deploy --only functions
```

#### Firebase Console 사용
1. Firebase Console 접속
2. Functions → 환경 변수
3. 새 환경 변수 추가:
   - 키: `JWT_SECRET`
   - 값: `[SECRET_KEY]`
4. 저장 후 Functions 재배포

---

## 환경별 설정

### 1. 로컬 개발 환경

#### Frontend
```env
# frontend/.env.local (또는 .env)
VITE_API_BASE_URL=http://localhost:5001/[PROJECT_ID]/us-central1/wiseupApi/api
VITE_FIREBASE_PROJECT_ID=[PROJECT_ID]
VITE_ENVIRONMENT=local
```

#### Backend
```bash
# dev.sh가 자동으로 설정
JWT_SECRET="dev-secret-key-change-in-production"
NODE_ENV="development"
```

#### 실행
```bash
./dev.sh
```

**포트**:
- Frontend: `localhost:5173`
- Functions: `localhost:5001`
- Firestore: `localhost:8080`
- Emulator UI: `localhost:4001`

---

### 2. 테스트 환경

#### Frontend
```env
# frontend/.env.test
VITE_API_BASE_URL=https://asia-northeast3-[TEST_PROJECT_ID].cloudfunctions.net/api
VITE_FIREBASE_PROJECT_ID=[TEST_PROJECT_ID]
VITE_ENVIRONMENT=test
```

#### Backend
```bash
# Firebase Console에서 설정
JWT_SECRET=[TEST_SECRET_KEY]
```

#### 빌드 및 배포
```bash
# Firebase 프로젝트 선택
firebase use test

# Frontend 빌드
cd frontend && npm run build:test

# Backend 빌드
cd ../functions && npm run build

# 배포
firebase deploy
```

---

### 3. 프로덕션 환경

#### Frontend
```env
# frontend/.env
VITE_API_BASE_URL=https://asia-northeast3-[PROD_PROJECT_ID].cloudfunctions.net/api
VITE_FIREBASE_PROJECT_ID=[PROD_PROJECT_ID]
VITE_ENVIRONMENT=production
```

#### Backend
```bash
# Firebase Console에서 설정
JWT_SECRET=[PRODUCTION_SECRET_KEY]
```

#### 빌드 및 배포
```bash
# Firebase 프로젝트 선택
firebase use default

# Frontend 빌드
cd frontend && npm run build

# Backend 빌드
cd ../functions && npm run build

# 배포
firebase deploy
```

---

## 보안 모범 사례

### 1. Git 관리

#### `.gitignore` 설정
```gitignore
# Environment files
.env
.env.local
.env.test
.env.production
```

#### 현재 상태 확인
```bash
# Git에 추적되는 .env 파일 확인
git ls-files | grep "\.env"

# 추적 중이면 제거
git rm --cached frontend/.env
git rm --cached frontend/.env.test
git commit -m "chore: remove sensitive env files"
```

---

### 2. 템플릿 사용

**Git에 포함할 파일:**
- ✅ `.env.example` (템플릿)

**Git에서 제외할 파일:**
- ❌ `.env` (실제 값)
- ❌ `.env.test` (실제 값)
- ❌ `.env.local` (실제 값)
- ❌ `.env.production` (실제 값)

---

### 3. 민감 정보 관리

**절대 Git에 커밋하지 말아야 할 정보:**
- ❌ API 키
- ❌ 비밀 키 (JWT_SECRET 등)
- ❌ 데이터베이스 비밀번호
- ❌ 개인 액세스 토큰
- ❌ OAuth 클라이언트 시크릿

**Git에 커밋해도 괜찮은 정보:**
- ✅ 프로젝트 ID (공개 정보)
- ✅ 리전 정보
- ✅ API 엔드포인트 URL (공개 정보)

---

### 4. 팀 협업

#### 새로운 팀원 온보딩
1. `.env.example` 파일 제공
2. 실제 환경 변수 값은 보안 채널로 전달 (Slack DM, 1Password 등)
3. 각자 로컬에서 `.env` 파일 생성

#### 환경 변수 변경 시
1. `.env.example` 파일 업데이트
2. 팀에 공지 (Slack, 이메일 등)
3. 각자 로컬 `.env` 파일 업데이트

---

### 5. CI/CD 환경

#### GitHub Actions 예시
```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    steps:
      - name: Set environment variables
        run: |
          echo "VITE_API_BASE_URL=${{ secrets.VITE_API_BASE_URL }}" >> frontend/.env
          echo "VITE_FIREBASE_PROJECT_ID=${{ secrets.VITE_FIREBASE_PROJECT_ID }}" >> frontend/.env
          echo "VITE_ENVIRONMENT=production" >> frontend/.env
```

#### GitHub Secrets 설정
1. Repository → Settings → Secrets and variables → Actions
2. New repository secret 추가:
   - `VITE_API_BASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`

---

## 환경 변수 검증

### Frontend 환경 변수 확인
```typescript
// frontend/src/config/environment.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  environment: import.meta.env.VITE_ENVIRONMENT,
}

// 개발 중 콘솔에서 확인
console.log('Environment Config:', config)

// 빌드 시 검증
if (!config.apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is not defined')
}
```

### Backend 환경 변수 확인
```typescript
// functions/src/index.ts
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set')
console.log('NODE_ENV:', process.env.NODE_ENV)

if (!process.env.JWT_SECRET) {
  console.error('Warning: JWT_SECRET is not set')
}
```

---

## 트러블슈팅

### 문제: 환경 변수가 로드되지 않음

**증상:**
```javascript
console.log(import.meta.env.VITE_API_BASE_URL) // undefined
```

**해결:**
1. 파일명 확인: `.env` (앞에 점 있어야 함)
2. 변수 접두사 확인: `VITE_` 로 시작해야 함
3. 파일 위치 확인: `frontend/.env`에 있어야 함
4. 개발 서버 재시작: `npm run dev` 재실행

---

### 문제: 프로덕션에서 로컬 API 호출

**증상:**
```
Failed to fetch: http://localhost:5001/...
```

**원인:** 잘못된 `.env` 파일 사용

**해결:**
1. `.env` 파일 확인
2. `VITE_API_BASE_URL`이 프로덕션 URL인지 확인
3. `npm run build` 재실행

---

### 문제: Firebase Functions에서 JWT_SECRET 없음

**증상:**
```
Error: JWT_SECRET is not defined
```

**해결:**
```bash
# Firebase CLI로 설정
firebase functions:config:set jwt.secret="your-secret-key"

# 설정 확인
firebase functions:config:get

# Functions 재배포
firebase deploy --only functions
```

---

## 추가 리소스

- [Vite 환경 변수 가이드](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Functions 환경 변수](https://firebase.google.com/docs/functions/config-env)
- [SETUP_GUIDE.md](SETUP_GUIDE.md): 초기 설정 가이드
- [README.md](README.md): 프로젝트 개요

---

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-01-07
**작성자**: WiseUp Dev Team
