#!/bin/bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ✅ 터미널 컬러 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Firebase 배포 자동화 스크립트 시작${NC}"
echo -e "${BLUE}================================${NC}"

# Firebase CLI 설치 확인
echo -e "${GREEN}🔍 [1/6] Firebase CLI 설치 확인...${NC}"
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI가 설치되지 않았습니다.${NC}"
    echo -e "${YELLOW}📦 Firebase CLI 설치 중...${NC}"
    npm install -g firebase-tools
    if ! command -v firebase &> /dev/null; then
        echo -e "${RED}❌ Firebase CLI 설치 실패. 수동으로 설치해주세요.${NC}"
        echo -e "${YELLOW}💡 npm install -g firebase-tools${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Firebase CLI 이미 설치됨${NC}"
fi

# Firebase 로그인 상태 확인
echo -e "${GREEN}🔐 [2/6] Firebase 로그인 상태 확인...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}❌ Firebase에 로그인되지 않았습니다.${NC}"
    echo -e "${YELLOW}🔑 Firebase 로그인 중...${NC}"
    firebase login
    if ! firebase projects:list &> /dev/null; then
        echo -e "${RED}❌ Firebase 로그인 실패.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Firebase 로그인 완료${NC}"
fi

# 기존 빌드 파일 정리
echo -e "${GREEN}🧹 [3/6] 기존 빌드 파일 정리...${NC}"
if [ -d "$ROOT_DIR/frontend/dist" ]; then
    echo -e "${YELLOW}🗑️  기존 frontend/dist 폴더 삭제 중...${NC}"
    rm -rf "$ROOT_DIR/frontend/dist"
fi

if [ -d "$ROOT_DIR/shared" ]; then
    echo -e "${YELLOW}🗑️  기존 shared 빌드 파일 삭제 중...${NC}"
    rm -rf "$ROOT_DIR/shared/*.js" "$ROOT_DIR/shared/*.d.ts" "$ROOT_DIR/shared/*.js.map"
fi

if [ -d "$ROOT_DIR/functions/lib" ]; then
    echo -e "${YELLOW}🗑️  기존 functions/lib 폴더 삭제 중...${NC}"
    rm -rf "$ROOT_DIR/functions/lib"
fi

# 프론트엔드 빌드
echo -e "${GREEN}📦 [4/6] 프론트엔드 빌드...${NC}"
cd "$ROOT_DIR/frontend"
# 프론트엔드 빌드 시 오류가 있으면 스크립트 중단
if ! npm run build; then
    echo -e "${RED}❌ 프론트엔드 빌드 실패. 스크립트를 중단합니다.${NC}"
    echo -e "${YELLOW}💡 TypeScript 오류를 수정한 후 다시 시도하세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 프론트엔드 빌드 완료${NC}"

# Shared 모듈 빌드
echo -e "${GREEN}📚 [5/6] Shared 모듈 빌드...${NC}"
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
echo -e "${GREEN}✅ Shared 모듈 빌드 완료${NC}"

# Firebase Functions 빌드
echo -e "${GREEN}🧠 [6/6] Firebase Functions 빌드...${NC}"
cd "$ROOT_DIR/functions"
# 빌드 시 오류가 있으면 스크립트 중단
if ! npm run build; then
    echo -e "${RED}❌ Firebase Functions 빌드 실패. 스크립트를 중단합니다.${NC}"
    echo -e "${YELLOW}💡 TypeScript 오류를 수정한 후 다시 시도하세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Firebase Functions 빌드 완료${NC}"

# 배포 전 최종 확인
echo -e "${BLUE}🔍 배포 전 최종 확인...${NC}"
if [ ! -d "$ROOT_DIR/frontend/dist" ]; then
    echo -e "${RED}❌ frontend/dist 폴더가 존재하지 않습니다.${NC}"
    exit 1
fi

if [ ! -d "$ROOT_DIR/functions/lib" ]; then
    echo -e "${RED}❌ functions/lib 폴더가 존재하지 않습니다.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 모든 빌드 파일 확인 완료${NC}"

# Firebase 배포
echo -e "${BLUE}🚀 Firebase 배포 시작...${NC}"
cd "$ROOT_DIR"

# 배포 옵션 선택
echo -e "${YELLOW}📋 배포 옵션을 선택하세요:${NC}"
echo -e "${BLUE}1) 전체 배포 (hosting + functions)${NC}"
echo -e "${BLUE}2) 호스팅만 배포${NC}"
echo -e "${BLUE}3) Functions만 배포${NC}"
echo -e "${BLUE}4) 취소${NC}"

read -p "선택 (1-4): " choice

case $choice in
    1)
        echo -e "${GREEN}🚀 전체 배포 시작...${NC}"
        if firebase deploy; then
            echo -e "${GREEN}✅ 전체 배포 성공!${NC}"
        else
            echo -e "${RED}❌ 전체 배포 실패.${NC}"
            exit 1
        fi
        ;;
    2)
        echo -e "${GREEN}🌐 호스팅만 배포 시작...${NC}"
        if firebase deploy --only hosting; then
            echo -e "${GREEN}✅ 호스팅 배포 성공!${NC}"
        else
            echo -e "${RED}❌ 호스팅 배포 실패.${NC}"
            exit 1
        fi
        ;;
    3)
        echo -e "${GREEN}⚙️  Functions만 배포 시작...${NC}"
        if firebase deploy --only functions; then
            echo -e "${GREEN}✅ Functions 배포 성공!${NC}"
        else
            echo -e "${RED}❌ Functions 배포 실패.${NC}"
            exit 1
        fi
        ;;
    4)
        echo -e "${YELLOW}❌ 배포가 취소되었습니다.${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ 잘못된 선택입니다.${NC}"
        exit 1
        ;;
esac

# 배포 완료 후 정보 표시
echo -e "${BLUE}🎉 배포 완료!${NC}"
echo -e "${GREEN}================================${NC}"

# 프로젝트 정보 표시
if firebase projects:list --json | grep -q '"projectId"'; then
    PROJECT_ID=$(firebase projects:list --json | grep '"projectId"' | head -1 | cut -d'"' -f4)
    echo -e "${BLUE}🌐 프로젝트 URL: https://${PROJECT_ID}.web.app${NC}"
    echo -e "${BLUE}📊 Firebase Console: https://console.firebase.google.com/project/${PROJECT_ID}${NC}"
fi

echo -e "${GREEN}================================${NC}"
echo -e "${BLUE}💡 배포된 앱을 확인하려면 위 URL을 방문하세요.${NC}"
echo -e "${BLUE}🔧 문제가 있다면 Firebase Console에서 로그를 확인하세요.${NC}"
