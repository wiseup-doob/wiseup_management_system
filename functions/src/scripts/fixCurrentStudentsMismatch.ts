import * as admin from 'firebase-admin';
import { ClassSectionService } from '../services/ClassSectionService';

/**
 * currentStudents와 실제 등록된 학생 수 간의 불일치를 수정하는 스크립트
 * 이 스크립트는 한 번만 실행하여 기존 데이터를 정리합니다.
 */
export async function fixCurrentStudentsMismatch() {
  try {
    console.log('🔄 currentStudents 불일치 데이터 정리 시작...');
    
    const classSectionService = new ClassSectionService();
    
    // 1. 모든 수업 조회
    const allClasses = await classSectionService.getAllClassSections();
    console.log(`📊 총 ${allClasses.length}개 수업 발견`);
    
    let fixedCount = 0;
    let totalMismatches = 0;
    
    for (const classSection of allClasses) {
      try {
        // 2. 실제 등록된 학생 수 조회
        const enrolledStudents = await classSectionService.getEnrolledStudents(classSection.id);
        const actualStudentCount = enrolledStudents.length;
        
        // 3. currentStudents와 실제 학생 수 비교
        if (classSection.currentStudents !== actualStudentCount) {
          totalMismatches++;
          console.log(`📊 수업 "${classSection.name}" (ID: ${classSection.id}):`);
          console.log(`   DB currentStudents: ${classSection.currentStudents || 0}`);
          console.log(`   실제 등록된 학생 수: ${actualStudentCount}`);
          
          // 4. currentStudents를 실제 값으로 수정
          await classSectionService.updateClassSection(classSection.id, {
            currentStudents: actualStudentCount
          });
          
          fixedCount++;
          console.log(`✅ 수업 "${classSection.name}" currentStudents 수정 완료: ${actualStudentCount}`);
        }
      } catch (error) {
        console.error(`❌ 수업 "${classSection.name}" (ID: ${classSection.id}) 처리 실패:`, error);
      }
    }
    
    console.log('\n🎉 데이터 정리 완료!');
    console.log(`📊 총 수업 수: ${allClasses.length}`);
    console.log(`🔧 불일치 발견: ${totalMismatches}`);
    console.log(`✅ 수정 완료: ${fixedCount}`);
    
    if (totalMismatches === 0) {
      console.log('🎯 모든 데이터가 일치합니다!');
    } else {
      console.log(`🔄 ${fixedCount}개 수업의 currentStudents가 실제 학생 수와 일치하도록 수정되었습니다.`);
    }
    
  } catch (error) {
    console.error('❌ 데이터 정리 실패:', error);
    throw error;
  }
}

/**
 * 특정 수업의 데이터 일관성을 검증하는 함수
 */
export async function validateClassSectionConsistency(classSectionId: string) {
  try {
    console.log(`🔍 수업 ${classSectionId} 데이터 일관성 검증 시작...`);
    
    const classSectionService = new ClassSectionService();
    
    // 수업 정보 조회
    const classSection = await classSectionService.getClassSectionById(classSectionId);
    if (!classSection) {
      console.log(`❌ 수업 ${classSectionId}를 찾을 수 없습니다.`);
      return;
    }
    
    // 실제 등록된 학생 수 조회
    const enrolledStudents = await classSectionService.getEnrolledStudents(classSectionId);
    const actualStudentCount = enrolledStudents.length;
    
    console.log(`📊 수업 "${classSection.name}" 검증 결과:`);
    console.log(`   DB currentStudents: ${classSection.currentStudents || 0}`);
    console.log(`   실제 등록된 학생 수: ${actualStudentCount}`);
    
    if (classSection.currentStudents === actualStudentCount) {
      console.log('✅ 데이터가 일치합니다!');
    } else {
      console.log('⚠️ 데이터 불일치 발견!');
      console.log(`   차이: ${Math.abs((classSection.currentStudents || 0) - actualStudentCount)}명`);
      
      // 자동 수정 여부 확인
      const shouldFix = true; // 필요시 사용자 입력 받도록 수정
      if (shouldFix) {
        await classSectionService.updateClassSection(classSectionId, {
          currentStudents: actualStudentCount
        });
        console.log(`✅ currentStudents를 ${actualStudentCount}로 수정 완료`);
      }
    }
    
  } catch (error) {
    console.error(`❌ 수업 ${classSectionId} 검증 실패:`, error);
  }
}

// 스크립트 실행 (직접 실행 시에만)
if (require.main === module) {
  // Firebase 초기화 (필요시)
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  
  // 전체 데이터 정리 실행
  fixCurrentStudentsMismatch()
    .then(() => {
      console.log('🎉 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}
