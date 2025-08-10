const fs = require('fs-extra');
const path = require('path');

async function postBuild() {
  try {
    console.log('🔄 Post-build process started...');
    
    // 1. shared 폴더를 lib로 복사
    const sharedSource = path.resolve(__dirname, '../../shared');
    const sharedDest = path.resolve(__dirname, '../lib/shared');
    
    if (await fs.pathExists(sharedSource)) {
      await fs.copy(sharedSource, sharedDest);
      console.log('✅ Shared modules copied to lib/shared');
    } else {
      console.log('⚠️  Shared folder not found, skipping...');
    }
    
    // 2. 불필요한 파일들 제거
    const libPath = path.resolve(__dirname, '../lib');
    
    // TypeScript 소스 파일들 제거
    const tsFiles = await findFiles(libPath, '.ts');
    for (const file of tsFiles) {
      await fs.remove(file);
    }
    
    // TypeScript 빌드 정보 파일들 제거
    const tsbuildinfoFiles = await findFiles(libPath, '.tsbuildinfo');
    for (const file of tsbuildinfoFiles) {
      await fs.remove(file);
    }
    
    // 3. 중복 구조 정리
    const functionsSrcPath = path.join(libPath, 'functions', 'src');
    if (await fs.pathExists(functionsSrcPath)) {
      // functions/src의 내용을 lib 루트로 이동
      const items = await fs.readdir(functionsSrcPath);
      for (const item of items) {
        const sourcePath = path.join(functionsSrcPath, item);
        const destPath = path.join(libPath, item);
        await fs.move(sourcePath, destPath, { overwrite: true });
      }
      
      // 빈 functions 폴더 제거
      await fs.remove(path.join(libPath, 'functions'));
      console.log('✅ Duplicate structure cleaned up');
    }
    
    // 4. @shared 경로를 상대 경로로 변경
    await fixSharedImports(libPath);
    
    // 5. 빈 폴더들 정리
    await removeEmptyDirectories(libPath);
    
    console.log('✅ Post-build cleanup completed');
    console.log('📁 Final lib structure:');
    await printDirectoryStructure(libPath);
    
  } catch (error) {
    console.error('❌ Post-build process failed:', error);
    process.exit(1);
  }
}

async function findFiles(dir, extension) {
  const files = [];
  
  async function scan(currentDir) {
    const items = await fs.readdir(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await scan(fullPath);
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }
  
  await scan(dir);
  return files;
}

async function removeEmptyDirectories(dir) {
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      await removeEmptyDirectories(fullPath);
      
      // 빈 폴더인지 확인하고 제거
      const contents = await fs.readdir(fullPath);
      if (contents.length === 0) {
        await fs.remove(fullPath);
      }
    }
  }
}

async function fixSharedImports(libPath) {
  console.log('🔄 Fixing @shared imports...');
  
  const jsFiles = await findFiles(libPath, '.js');
  let fixedCount = 0;
  
  for (const file of jsFiles) {
    let content = await fs.readFile(file, 'utf8');
    let modified = false;
    
    // @shared/* 경로를 상대 경로로 변경
    const sharedImportRegex = /require\(["']@shared\/([^"']+)["']\)/g;
    const matches = content.match(sharedImportRegex);
    
    if (matches) {
      for (const match of matches) {
        const importPath = match.match(/@shared\/([^"']+)/)[1];
        const relativePath = path.relative(path.dirname(file), path.join(libPath, 'shared', importPath));
        const newImport = `require("${relativePath}")`;
        
        content = content.replace(match, newImport);
        modified = true;
      }
    }
    
    if (modified) {
      await fs.writeFile(file, content, 'utf8');
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed ${fixedCount} files with @shared imports`);
}

async function printDirectoryStructure(dir, prefix = '') {
  const items = await fs.readdir(dir);
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    const isLast = i === items.length - 1;
    
    console.log(`${prefix}${isLast ? '└── ' : '├── '}${item}`);
    
    if (stat.isDirectory()) {
      await printDirectoryStructure(fullPath, prefix + (isLast ? '    ' : '│   '));
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  postBuild();
}

module.exports = { postBuild };
