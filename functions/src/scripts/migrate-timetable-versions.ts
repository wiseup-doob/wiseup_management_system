import * as admin from 'firebase-admin';
import { TimetableVersionService } from '../services/TimetableVersionService';
import { StudentTimetableService } from '../services/StudentTimetableService';

/**
 * 기존 시간표 데이터를 버전 시스템으로 마이그레이션하는 스크립트
 *
 * 작업 내용:
 * 1. 기본 시간표 버전 생성
 * 2. 모든 기존 student_timetables 조회
 * 3. versionId가 없는 문서에 기본 버전 ID 추가
 * 4. Batch 처리로 500개씩 업데이트
 */
export async function migrateTimetableVersions() {
  console.log('🚀 시간표 버전 마이그레이션 시작...\n');

  const versionService = new TimetableVersionService();
  const timetableService = new StudentTimetableService();
  const db = admin.firestore();

  try {
    // ===== 1단계: 기본 버전 생성 =====
    console.log('📝 Step 1: 기본 버전 생성 중...');

    // 기존 버전이 있는지 확인
    const existingVersions = await versionService.getAllVersions();
    let defaultVersionId: string;

    if (existingVersions.length > 0) {
      console.log(`⚠️  이미 ${existingVersions.length}개의 버전이 존재합니다.`);

      // 활성 버전이 있는지 확인
      const activeVersion = await versionService.getActiveVersion();
      if (activeVersion) {
        defaultVersionId = activeVersion.id;
        console.log(`✅ 기존 활성 버전 사용: "${activeVersion.name}" (ID: ${defaultVersionId})`);
      } else {
        // 활성 버전이 없으면 첫 번째 버전 활성화
        defaultVersionId = existingVersions[0].id;
        await versionService.activateVersion(defaultVersionId);
        console.log(`✅ 첫 번째 버전 활성화: "${existingVersions[0].name}" (ID: ${defaultVersionId})`);
      }
    } else {
      // 새 기본 버전 생성
      defaultVersionId = await versionService.createVersion({
        name: '기존 시간표',
        displayName: '기존',
        startDate: admin.firestore.Timestamp.fromDate(new Date('2024-01-01')),
        endDate: admin.firestore.Timestamp.fromDate(new Date('2024-12-31')),
        description: '기존 시간표를 위한 기본 버전 (마이그레이션)',
        order: 0
      });
      console.log(`✅ 기본 버전 생성 완료: ${defaultVersionId}`);

      // 기본 버전 활성화
      console.log('🎯 기본 버전 활성화 중...');
      await versionService.activateVersion(defaultVersionId);
      console.log('✅ 기본 버전 활성화 완료\n');
    }

    // ===== 2단계: 기존 시간표 조회 =====
    console.log('📚 Step 2: 기존 시간표 조회 중...');
    const allTimetables = await timetableService.getAllStudentTimetables();
    console.log(`📊 총 ${allTimetables.length}개의 시간표 발견`);

    // versionId가 없는 시간표만 필터링
    const timetablesToUpdate = allTimetables.filter(t => !(t as any).versionId);
    console.log(`📊 업데이트 대상: ${timetablesToUpdate.length}개`);

    if (timetablesToUpdate.length === 0) {
      console.log('✅ 모든 시간표가 이미 버전을 가지고 있습니다. 마이그레이션이 필요하지 않습니다.\n');
      return {
        success: true,
        message: 'No migration needed',
        updated: 0,
        total: allTimetables.length
      };
    }

    console.log('');

    // ===== 3단계: Batch 업데이트 =====
    console.log('🔄 Step 3: 시간표 업데이트 중...');

    let updatedCount = 0;
    let errorCount = 0;
    const BATCH_SIZE = 500;

    // Batch 처리
    for (let i = 0; i < timetablesToUpdate.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = timetablesToUpdate.slice(i, i + BATCH_SIZE);

      console.log(`\n📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length}개 문서 처리 중...`);

      for (const timetable of chunk) {
        const docRef = db.collection('student_timetables').doc(timetable.id);
        batch.update(docRef, {
          versionId: defaultVersionId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      try {
        await batch.commit();
        updatedCount += chunk.length;

        const progress = Math.round((updatedCount / timetablesToUpdate.length) * 100);
        console.log(`✅ Batch 완료: ${updatedCount}/${timetablesToUpdate.length} (${progress}%)`);
      } catch (error) {
        console.error(`❌ Batch 작업 실패 (인덱스 ${i}부터 ${i + chunk.length}까지):`, error);
        errorCount += chunk.length;
      }
    }

    // ===== 4단계: 결과 요약 =====
    console.log('\n' + '='.repeat(60));
    console.log('🎉 마이그레이션 완료!');
    console.log('='.repeat(60));
    console.log(`✅ 성공: ${updatedCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    console.log(`📊 전체: ${allTimetables.length}개`);
    console.log(`📈 성공률: ${Math.round((updatedCount / timetablesToUpdate.length) * 100)}%`);
    console.log('='.repeat(60) + '\n');

    return {
      success: errorCount === 0,
      message: 'Migration completed',
      updated: updatedCount,
      failed: errorCount,
      total: allTimetables.length
    };

  } catch (error) {
    console.error('\n💥 마이그레이션 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 마이그레이션 상태 확인 함수
 * 현재 몇 개의 시간표에 versionId가 없는지 확인
 */
export async function checkMigrationStatus() {
  console.log('🔍 마이그레이션 상태 확인 중...\n');

  const timetableService = new StudentTimetableService();
  const versionService = new TimetableVersionService();

  try {
    // 버전 정보
    const versions = await versionService.getAllVersions();
    const activeVersion = await versionService.getActiveVersion();

    console.log('📊 버전 정보:');
    console.log(`   총 버전 수: ${versions.length}개`);
    console.log(`   활성 버전: ${activeVersion ? activeVersion.name : '없음'}`);
    console.log('');

    // 시간표 정보
    const allTimetables = await timetableService.getAllStudentTimetables();
    const withVersion = allTimetables.filter(t => !!(t as any).versionId);
    const withoutVersion = allTimetables.filter(t => !(t as any).versionId);

    console.log('📊 시간표 정보:');
    console.log(`   총 시간표 수: ${allTimetables.length}개`);
    console.log(`   versionId 있음: ${withVersion.length}개 (${Math.round((withVersion.length / allTimetables.length) * 100)}%)`);
    console.log(`   versionId 없음: ${withoutVersion.length}개 (${Math.round((withoutVersion.length / allTimetables.length) * 100)}%)`);
    console.log('');

    if (withoutVersion.length > 0) {
      console.log('⚠️  마이그레이션이 필요합니다.');
      console.log(`   ${withoutVersion.length}개의 시간표가 아직 버전을 가지고 있지 않습니다.`);
    } else {
      console.log('✅ 모든 시간표가 버전을 가지고 있습니다.');
    }

  } catch (error) {
    console.error('❌ 상태 확인 실패:', error);
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  // Firebase 초기화
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  // 커맨드 라인 인자 처리
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate';

  if (command === 'check') {
    // 상태 확인만 수행
    checkMigrationStatus()
      .then(() => {
        console.log('🎉 상태 확인 완료');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ 상태 확인 실패:', error);
        process.exit(1);
      });
  } else {
    // 마이그레이션 실행
    migrateTimetableVersions()
      .then((result) => {
        console.log('✨ 마이그레이션이 정상적으로 완료되었습니다.');
        if (result.success) {
          process.exit(0);
        } else {
          console.log('⚠️  일부 오류가 발생했습니다. 로그를 확인하세요.');
          process.exit(1);
        }
      })
      .catch((error) => {
        console.error('💥 마이그레이션 실패:', error);
        process.exit(1);
      });
  }
}
