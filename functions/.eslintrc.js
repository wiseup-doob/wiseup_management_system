module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    // 따옴표 스타일 - 작은따옴표 허용
    "quotes": ["error", "single"],
    
    // 줄 길이 제한 완화
    "max-len": ["error", { "code": 120 }],
    
    // 세미콜론 필수
    "semi": ["error", "always"],
    
    // JSDoc 주석 선택적 적용
    "require-jsdoc": "off",
    
    // camelCase 규칙 완화 (snake_case 허용)
    "camelcase": "off",
    
    // any 타입 허용
    "@typescript-eslint/no-explicit-any": "warn",
    
    // non-null assertion 허용
    "@typescript-eslint/no-non-null-assertion": "warn",
    
    // 사용하지 않는 변수 경고
    "@typescript-eslint/no-unused-vars": "warn",
    
    // import 관련 규칙
    "import/no-unresolved": 0,
    
    // 들여쓰기
    "indent": ["error", 2],
    
    // 함수명 대문자 시작 허용
    "new-cap": "off",
    
    // trailing comma 선택적
    "comma-dangle": ["error", "only-multiline"],
    
    // 공백 규칙
    "object-curly-spacing": ["error", "always"],
    "no-trailing-spaces": "error",
    "eol-last": "error",
  },
};
