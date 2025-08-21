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

# 현재 선택된 프로젝트 정보 표시
echo -e "${GREEN}🔍 현재 Firebase 프로젝트 확인...${NC}"
CURRENT_PROJECT=$(firebase use --json 2>/dev/null | grep '"current"' | cut -d'"' -f4)
if [ ! -z "$CURRENT_PROJECT" ]; then
    echo -e "${BLUE}📍 현재 선택된 프로젝트: ${CURRENT_PROJECT}${NC}"
else
    echo -e "${YELLOW}⚠️  현재 선택된 프로젝트가 없습니다.${NC}"
fi
echo ""

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

# 프로젝트 선택 (빌드 전에 먼저 선택)
echo -e "${GREEN}🔍 [3/6] 배포할 프로젝트 선택...${NC}"
echo -e "${YELLOW}📋 배포할 프로젝트를 선택하세요:${NC}"
echo -e "${BLUE}1) wiseupmanagementsystem-a6189 (프로덕션)${NC}"
echo -e "${BLUE}2) test_project (테스트)${NC}"
echo -e "${BLUE}3) 취소${NC}"

read -p "프로젝트 선택 (1-3): " project_choice

case $project_choice in
    1)
        echo -e "${GREEN}🚀 프로덕션 프로젝트로 배포합니다...${NC}"
        if firebase use wiseupmanagementsystem-a6189; then
            echo -e "${GREEN}✅ 프로덕션 프로젝트 선택 완료${NC}"
            BUILD_ENV="production"
            BUILD_COMMAND="npm run build"
            echo -e "${BLUE}🔧 .env 파일의 환경 변수를 사용합니다.${NC}"
        else
            echo -e "${RED}❌ 프로덕션 프로젝트 선택 실패${NC}"
            exit 1
        fi
        ;;
    2)
        echo -e "${GREEN}🧪 테스트 프로젝트로 배포합니다...${NC}"
        # test_project 별칭이 .firebaserc에 등록되어 있는지 확인
        if grep -q "test_project" .firebaserc; then
            echo -e "${GREEN}✅ test_project 별칭이 등록되어 있습니다.${NC}"
            if firebase use test_project; then
                echo -e "${GREEN}✅ 테스트 프로젝트 선택 완료${NC}"
                BUILD_ENV="test"
                BUILD_COMMAND="npm run build:test"
                echo -e "${BLUE}🔧 .env.test 파일의 환경 변수를 사용합니다.${NC}"
            else
                echo -e "${RED}❌ 테스트 프로젝트 선택 실패${NC}"
                exit 1
            fi
        else
            echo -e "${YELLOW}⚠️  test_project가 존재하지 않습니다.${NC}"
            echo -e "${BLUE}💡 새 테스트 프로젝트를 생성하시겠습니까? (y/n)${NC}"
            read -p "새 프로젝트 생성: " create_project
            if [[ $create_project =~ ^[Yy]$ ]]; then
                echo -e "${GREEN}🔧 새 테스트 프로젝트 생성 중...${NC}"
                if firebase projects:create test_project --display-name "WiseUp Test Project"; then
                    echo -e "${GREEN}✅ 테스트 프로젝트 생성 완료${NC}"
                    if firebase use test_project; then
                        echo -e "${GREEN}✅ 테스트 프로젝트 선택 완료${NC}"
                        BUILD_ENV="test"
                        BUILD_COMMAND="npm run build:test"
                        echo -e "${BLUE}🔧 .env.test 파일의 환경 변수를 사용합니다.${NC}"
                    else
                        echo -e "${RED}❌ 테스트 프로젝트 선택 실패${NC}"
                        exit 1
                    fi
                else
                    echo -e "${RED}❌ 테스트 프로젝트 생성 실패${NC}"
                    exit 1
                fi
            else
                echo -e "${YELLOW}❌ 프로젝트 생성이 취소되었습니다.${NC}"
                exit 0
            fi
        fi
        ;;
    3)
        echo -e "${YELLOW}❌ 배포가 취소되었습니다.${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ 잘못된 선택입니다.${NC}"
        exit 1
        ;;
esac

# 환경별 빌드 설정 확인
echo -e "${BLUE}🔧 빌드 환경: ${BUILD_ENV}${NC}"
echo -e "${BLUE}🔧 빌드 명령: ${BUILD_COMMAND}${NC}"

# 기존 빌드 파일 정리
echo -e "${GREEN}🧹 [4/6] 기존 빌드 파일 정리...${NC}"
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

# 프론트엔드 빌드 (환경별)
echo -e "${GREEN}📦 [5/6] 프론트엔드 빌드 (${BUILD_ENV} 환경)...${NC}"
cd "$ROOT_DIR/frontend"

# 환경별 빌드 실행
if [ "$BUILD_ENV" = "production" ]; then
    echo -e "${BLUE}🔧 프로덕션 환경으로 빌드 중...${NC}"
    echo -e "${GREEN}✅ .env 파일을 사용하여 빌드합니다.${NC}"
    
    # .env 파일을 명시적으로 사용하여 빌드
    if [ -f ".env" ]; then
        echo -e "${BLUE}📄 .env 파일 내용 확인:${NC}"
        echo "VITE_API_BASE_URL=$(grep 'VITE_API_BASE_URL' .env | cut -d'=' -f2)"
        echo "VITE_FIREBASE_PROJECT_ID=$(grep 'VITE_FIREBASE_PROJECT_ID' .env | cut -d'=' -f2)"
        
        # 환경변수를 명시적으로 설정하여 빌드
        echo -e "${BLUE}🔧 환경변수를 명시적으로 설정하여 빌드 중...${NC}"
        export VITE_API_BASE_URL=$(grep 'VITE_API_BASE_URL' .env | cut -d'=' -f2)
        export VITE_FIREBASE_PROJECT_ID=$(grep 'VITE_FIREBASE_PROJECT_ID' .env | cut -d'=' -f2)
        
        # 환경변수 설정 확인
        echo -e "${GREEN}✅ 설정된 환경변수:${NC}"
        echo "VITE_API_BASE_URL=$VITE_API_BASE_URL"
        echo "VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID"
        
        # 환경변수를 사용하여 빌드
        VITE_API_BASE_URL="$VITE_API_BASE_URL" VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID" npm run build
    else
        echo -e "${RED}❌ .env 파일이 없습니다.${NC}"
        exit 1
    fi
elif [ "$BUILD_ENV" = "test" ]; then
    echo -e "${BLUE}🔧 테스트 환경으로 빌드 중...${NC}"
    echo -e "${GREEN}✅ .env.test 파일을 사용하여 빌드합니다.${NC}"
    
    # .env.test 파일을 명시적으로 사용하여 빌드
    if [ -f ".env.test" ]; then
        echo -e "${BLUE}📄 .env.test 파일 내용 확인:${NC}"
        echo "VITE_API_BASE_URL=$(grep 'VITE_API_BASE_URL' .env.test | cut -d'=' -f2)"
        echo "VITE_FIREBASE_PROJECT_ID=$(grep 'VITE_FIREBASE_PROJECT_ID' .env.test | cut -d'=' -f2)"
        
        # 환경변수를 명시적으로 설정하여 빌드
        echo -e "${BLUE}🔧 환경변수를 명시적으로 설정하여 빌드 중...${NC}"
        export VITE_API_BASE_URL=$(grep 'VITE_API_BASE_URL' .env.test | cut -d'=' -f2)
        export VITE_FIREBASE_PROJECT_ID=$(grep 'VITE_FIREBASE_PROJECT_ID' .env.test | cut -d'=' -f2)
        
        # 환경변수 설정 확인
        echo -e "${GREEN}✅ 설정된 환경변수:${NC}"
        echo "VITE_API_BASE_URL=$VITE_API_BASE_URL"
        echo "VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID"
        
        # 환경변수를 사용하여 빌드
        VITE_API_BASE_URL="$VITE_API_BASE_URL" VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID" npm run build:test
    else
        echo -e "${RED}❌ .env.test 파일이 없습니다.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  알 수 없는 빌드 환경입니다. 기본 환경으로 빌드합니다.${NC}"
    npm run build
fi

# 프론트엔드 빌드 시 오류가 있으면 스크립트 중단
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 프론트엔드 빌드 실패. 스크립트를 중단합니다.${NC}"
    echo -e "${YELLOW}💡 TypeScript 오류를 수정한 후 다시 시도하세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 프론트엔드 빌드 완료 (${BUILD_ENV} 환경)${NC}"

# Shared 모듈 빌드
echo -e "${GREEN}📚 [6/6] Shared 모듈 빌드...${NC}"
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
echo -e "${GREEN}🧠 [7/6] Firebase Functions 빌드...${NC}"
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
CURRENT_PROJECT=$(firebase use --json | grep '"current"')
if [ ! -z "$CURRENT_PROJECT" ]; then
    PROJECT_ID=$(echo $CURRENT_PROJECT | cut -d'"' -f4)
    echo -e "${BLUE}🌐 프로젝트 URL: https://${PROJECT_ID}.web.app${NC}"
    echo -e "${BLUE}📊 Firebase Console: https://console.firebase.google.com/project/${PROJECT_ID}${NC}"
    
    if [ "$PROJECT_ID" = "test_project" ]; then
        echo -e "${YELLOW}🧪 테스트 프로젝트에 배포되었습니다.${NC}"
    else
        echo -e "${GREEN}🚀 프로덕션 프로젝트에 배포되었습니다.${NC}"
    fi
fi

echo -e "${GREEN}================================${NC}"
echo -e "${BLUE}💡 배포된 앱을 확인하려면 위 URL을 방문하세요.${NC}"
echo -e "${BLUE}🔧 문제가 있다면 Firebase Console에서 로그를 확인하세요.${NC}"
