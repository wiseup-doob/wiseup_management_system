#!/bin/bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ✅ 터미널 컬러 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 [1/8] 모든 개발 서버 완전 종료...${NC}"

# Firebase 관련 프로세스 찾기 (더 포괄적으로)
echo -e "${YELLOW}🔍 Firebase 관련 프로세스 검색 중...${NC}"
FIREBASE_PIDS=$(ps aux | grep -E "(firebase|emulator)" | grep -v grep | awk '{print $2}' | tr '\n' ' ')
FIREBASE_PORT_PIDS=$(lsof -ti:5001,4001,4002,4400,4401,4402,4500,4501,4502,8080,9099 2>/dev/null | tr '\n' ' ')

ALL_PIDS="$FIREBASE_PIDS $FIREBASE_PORT_PIDS"

if [ ! -z "$ALL_PIDS" ]; then
    echo -e "${YELLOW}📋 발견된 Firebase 프로세스:${NC}"
    echo "$ALL_PIDS"
    echo -e "${YELLOW}🛑 Firebase 프로세스 종료 중...${NC}"
    kill -9 $ALL_PIDS 2>/dev/null
    sleep 3
    echo -e "${GREEN}✅ Firebase 프로세스 종료 완료${NC}"
else
    echo -e "${GREEN}✅ 실행 중인 Firebase 프로세스 없음${NC}"
fi

# 프론트엔드 개발 서버 프로세스 찾기 및 종료
echo -e "${YELLOW}🔍 프론트엔드 개발 서버 프로세스 검색 중...${NC}"
FRONTEND_PIDS=$(ps aux | grep -E "(vite|npm.*dev|node.*vite)" | grep -v grep | awk '{print $2}' | tr '\n' ' ')
FRONTEND_PORT_PIDS=$(lsof -ti:5173,3000,4173 2>/dev/null | tr '\n' ' ')

if [ ! -z "$FRONTEND_PIDS" ] || [ ! -z "$FRONTEND_PORT_PIDS" ]; then
    echo -e "${YELLOW}📋 발견된 프론트엔드 프로세스:${NC}"
    echo "$FRONTEND_PIDS $FRONTEND_PORT_PIDS"
    echo -e "${YELLOW}🛑 프론트엔드 프로세스 종료 중...${NC}"
    kill -9 $FRONTEND_PIDS $FRONTEND_PORT_PIDS 2>/dev/null
    sleep 2
    echo -e "${GREEN}✅ 프론트엔드 프로세스 종료 완료${NC}"
else
    echo -e "${GREEN}✅ 실행 중인 프론트엔드 프로세스 없음${NC}"
fi

# 포트 사용 확인 (더 많은 포트 포함)
echo -e "${GREEN}🔍 [2/8] 포트 사용 상태 확인...${NC}"
for port in 5001 4001 4002 4400 4401 4402 4500 4501 4502 8080 9099 5173 3000 4173; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo -e "${RED}⚠️  포트 $port 사용 중${NC}"
        # 강제로 포트 해제 시도
        sudo lsof -ti:$port | xargs kill -9 2>/dev/null || true
    else
        echo -e "${GREEN}✅ 포트 $port 사용 가능${NC}"
    fi
done

echo -e "${GREEN}📦 [3/8] 프론트엔드 빌드...${NC}"
cd "$ROOT_DIR/frontend"
# 프론트엔드 빌드 시 오류가 있으면 스크립트 중단
if ! npm run build; then
    echo -e "${RED}❌ 프론트엔드 빌드 실패. 스크립트를 중단합니다.${NC}"
    echo -e "${YELLOW}💡 TypeScript 오류를 수정한 후 다시 시도하세요.${NC}"
    exit 1
fi

echo -e "${GREEN}📚 [4/8] Shared 모듈 빌드...${NC}"
cd "$ROOT_DIR/shared"
# TypeScript가 설치되어 있지 않으면 npm install typescript 실행
if ! command -v tsc &> /dev/null; then
    echo -e "${YELLOW}📦 TypeScript 설치 중...${NC}"
    npm install typescript --save-dev
fi
# Shared 모듈 빌드 시 오류가 있으면 스크립트 중단
if ! npx tsc; then
    echo -e "${RED}❌ Shared 모듈 빌드 실패. 스크립트를 중단합니다.${NC}"
    echo -e "${YELLOW}💡 TypeScript 오류를 수정한 후 다시 시도하세요.${NC}"
    exit 1
fi

echo -e "${GREEN}🧠 [5/8] 백엔드 빌드...${NC}"
cd "$ROOT_DIR/functions"
# 빌드 시 오류가 있으면 스크립트 중단
if ! npm run build; then
    echo -e "${RED}❌ 백엔드 빌드 실패. 스크립트를 중단합니다.${NC}"
    echo -e "${YELLOW}💡 TypeScript 오류를 수정한 후 다시 시도하세요.${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 [6/8] Firebase Emulator 시작...${NC}"
# 환경 변수 설정
export JWT_SECRET="dev-secret-key-change-in-production"
export NODE_ENV="development"

# 로그 파일 생성
LOG_FILE="$ROOT_DIR/firebase-emulator.log"
echo "Firebase Emulator 로그 시작: $(date)" > "$LOG_FILE"

# Firestore, Functions, UI 모두 시작
firebase emulators:start --only functions,firestore,ui --project wiseupmanagementsystem > "$LOG_FILE" 2>&1 &
FIREBASE_PID=$!

# Emulator 시작 대기 (시간 감소)
echo -e "${YELLOW}⏳ Firebase Emulator 시작 대기 중... (5초)${NC}"
sleep 5

# Emulator 상태 확인 (더 정확한 확인)
echo -e "${BLUE}🔍 [7/8] Emulator 상태 확인...${NC}"

# 올바른 API 엔드포인트로 상태 확인
if curl -s http://localhost:5001/wiseupmanagementsystem/us-central1/wiseupApi/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Firebase Functions 정상 동작${NC}"
else
    echo -e "${RED}❌ Firebase Functions 응답 없음${NC}"
    echo -e "${YELLOW}📋 Firebase 로그 확인:${NC}"
    tail -20 "$LOG_FILE"
    exit 1
fi

# Firestore 상태 확인
if curl -s http://localhost:8080/v1/projects/wiseupmanagementsystem/databases/\(default\)/documents >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Firestore 정상 동작${NC}"
else
    echo -e "${RED}❌ Firestore 응답 없음${NC}"
    exit 1
fi

# Emulator UI 상태 확인
if curl -s http://localhost:4002 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Emulator UI 정상 동작${NC}"
else
    echo -e "${YELLOW}⚠️  Emulator UI 응답 없음 (선택사항)${NC}"
fi

echo -e "${GREEN}✅ Firebase Emulator 시작 성공 (PID: $FIREBASE_PID)${NC}"

# 자동 데이터 초기화 (새로운 분리된 API 구조 사용)
echo -e "${BLUE}🔧 [8/8] 모든 데이터 자동 초기화...${NC}"
echo -e "${YELLOW}⏳ 통합 초기화 API 호출 중...${NC}"

# 새로운 통합 초기화 API 사용
INIT_RESPONSE=$(curl -s -X POST http://localhost:5001/wiseupmanagementsystem/us-central1/wiseupApi/api/initialization/all)
echo "통합 초기화 응답: $INIT_RESPONSE"

# 초기화 성공 여부 확인
if echo "$INIT_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ 모든 데이터 초기화 성공${NC}"
    
    # 초기화된 데이터 확인
    sleep 2
    VERIFY_RESPONSE=$(curl -s http://localhost:5001/wiseupmanagementsystem/us-central1/wiseupApi/api/students)
    
    if echo "$VERIFY_RESPONSE" | grep -q '"success":true' && echo "$VERIFY_RESPONSE" | grep -q '"data":\[.*\]'; then
        echo -e "${GREEN}✅ 데이터 검증 성공${NC}"
        echo -e "${GREEN}📊 초기화된 데이터:${NC}"
        echo "$VERIFY_RESPONSE" | jq '.data | length' 2>/dev/null || echo "데이터 개수 확인 중..."
    else
        echo -e "${YELLOW}⚠️  데이터 검증 실패${NC}"
    fi
else
    echo -e "${RED}❌ 데이터 초기화 실패${NC}"
    echo -e "${YELLOW}📋 Firebase Emulator 로그를 확인하세요${NC}"
    echo -e "${YELLOW}🔗 Emulator UI: http://localhost:4002${NC}"
fi

# ===== 개발 환경 완료 안내 =====
echo -e "${BLUE}🎉 [8/8] 개발 환경 준비 완료!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Firebase Emulator 실행 중${NC}"
echo -e "${GREEN}✅ 모든 데이터 자동 초기화 완료${NC}"
echo -e "${GREEN}✅ Frontend 개발 서버 실행 중${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${BLUE}🌐 브라우저에서 확인하세요:${NC}"
echo -e "${YELLOW}   Frontend: http://localhost:5173${NC}"
echo -e "${YELLOW}   Emulator UI: http://localhost:4002${NC}"
echo -e "${BLUE}📊 출결 관리 페이지에서 데이터 확인${NC}"
echo -e "${BLUE}🔄 변경사항은 자동으로 반영됩니다${NC}"
echo -e "${GREEN}================================${NC}"

# 개발 서버 시작 (백그라운드) - 기존 프로세스 강제 종료 후 시작
echo -e "${BLUE}🚀 Frontend 개발 서버 시작...${NC}"
# 기존 프론트엔드 프로세스 강제 종료 (추가 안전장치)
pkill -f "vite" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true
sleep 3

cd "$ROOT_DIR/frontend" && npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend 개발 서버 시작 완료 (PID: $FRONTEND_PID)${NC}"

echo -e "${BLUE}🎯 개발 환경이 완전히 준비되었습니다!${NC}"
echo -e "${YELLOW}💡 팁: Ctrl+C로 서버를 종료할 수 있습니다${NC}"