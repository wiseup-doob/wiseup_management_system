# #!/bin/bash

# # ✅ 터미널 컬러 정의
# GREEN='\033[0;32m'
# NC='\033[0m' # No Color

# echo -e "${GREEN}🔧 [1/4] 프론트엔드 빌드 시작...${NC}"
# cd frontend || exit
# npm install
# npm run build || { echo "❌ 프론트 빌드 실패"; exit 1; }
# cd ..

# echo -e "${GREEN}🧠 [2/4] 백엔드 타입스크립트 빌드 시작...${NC}"
# cd functions || exit
# npm install
# npm run build || { echo "❌ 백엔드 빌드 실패"; exit 1; }
# cd ..

# echo -e "${GREEN}🚀 [3/4] Firebase Emulator 실행...${NC}"
# firebase emulators:start --only functions,firestore
#!/bin/bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📦 Building frontend..."
cd "$ROOT_DIR/frontend"
npm run build

echo "🚀 Starting backend emulator in background..."
cd "$ROOT_DIR/functions"
npm run build
firebase emulators:start &

# 📌 다음 명령어 계속 실행 가능
echo "🧪 Running frontend dev server..."
cd "$ROOT_DIR/frontend"
npm run dev