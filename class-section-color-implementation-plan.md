# 🎨 점진적 마이그레이션 + 색상 추가 구현 계획

## 개요

TimetableWidget에서 표시되는 수업 셀의 색깔을 현재의 동적 생성 방식에서 DB 저장 방식으로 변경하여 성능을 향상시키고 일관성을 보장하는 프로젝트입니다.

### 현재 상황
- **색깔 생성 위치**: `StudentTimetableController.generateClassColor()`
- **생성 시점**: 학생 시간표 조회 시에만 동적 생성
- **저장 방식**: DB에 저장하지 않고 응답 시점에 계산

### 목표
- 수업 생성 시 색깔 자동 생성 및 DB 저장
- 기존 수업들의 점진적 색깔 마이그레이션
- 모든 API에서 일관된 색깔 시스템 사용

---

## 📋 **Phase 1: 기반 작업 (1-2일)**

### 1.1 색깔 생성 로직 이동

**작업**: `StudentTimetableController`의 색깔 생성 로직을 `ClassSectionService`로 이동

```typescript
// ✅ TODO: ClassSectionService에 색깔 생성 메서드 추가
private generateClassColor(classId: string, courseName: string): string {
  const colors = [
    '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a',
    '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94',
    '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d',
    '#17becf', '#9edae5', '#393b79', '#637939', '#8c6d31', '#b5cf6b',
    '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', '#ad494a', '#a6cee3'
  ];
  
  const combined = `${classId}_${courseName}`;
  let hash = 0;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// ✅ TODO: CourseService 의존성 추가
private courseService: CourseService;

constructor() {
  super('class_sections');
  this.courseService = new CourseService();
}
```

### 1.2 점진적 색깔 생성 로직 구현

**작업**: API 조회 시점에 색깔이 없는 수업에 대해 자동으로 색깔 생성 및 저장

```typescript
// ✅ TODO: 색깔 자동 생성 헬퍼 메서드
private async ensureClassSectionHasColor(classSection: any): Promise<any> {
  if (classSection.color) {
    return classSection; // 이미 색깔 있음
  }
  
  try {
    // 과목 정보 조회
    const course = await this.courseService.getCourseById(classSection.courseId);
    const courseName = course?.name || 'Unknown';
    
    // 색깔 생성
    const color = this.generateClassColor(classSection.id, courseName);
    
    // DB에 저장
    await this.updateClassSection(classSection.id, { color });
    
    console.log(`🎨 수업 "${classSection.name}" 색깔 자동 생성: ${color}`);
    
    return {
      ...classSection,
      color
    };
  } catch (error) {
    console.error(`색깔 생성 실패 (${classSection.id}):`, error);
    return classSection; // 실패해도 원본 데이터 반환
  }
}
```

---

## 📋 **Phase 2: 기존 API 수정 (2-3일)**

### 2.1 개별 조회 API 수정

**파일**: `functions/src/services/ClassSectionService.ts`
**메서드**: `getClassSectionWithDetailsById`

```typescript
// ✅ TODO: getClassSectionWithDetailsById 수정
async getClassSectionWithDetailsById(id: string): Promise<any> {
  try {
    const classSection = await this.getClassSectionById(id);
    if (!classSection) return null;
    
    // 🔄 점진적 색깔 생성
    const updatedSection = await this.ensureClassSectionHasColor(classSection);
    
    // 기존 로직 (Course, Teacher, Classroom 조회)
    const [courseDoc, teacherDoc, classroomDoc] = await Promise.all([
      this.db.collection('courses').doc(updatedSection.courseId).get(),
      this.db.collection('teachers').doc(updatedSection.teacherId).get(),
      this.db.collection('classrooms').doc(updatedSection.classroomId).get()
    ]);
    
    // ✅ currentStudents 정합성 검사
    const finalSection = await this.validateAndUpdateCurrentStudents(updatedSection);
    
    return {
      ...finalSection,
      course: courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null,
      teacher: teacherDoc.exists ? { id: teacherDoc.id, ...teacherDoc.data() } : null,
      classroom: classroomDoc.exists ? { id: classroomDoc.id, ...classroomDoc.data() } : null
    };
  } catch (error) {
    console.error(`수업 ${id} 상세 정보 조회 실패:`, error);
    throw new Error('수업 상세 정보 조회에 실패했습니다.');
  }
}
```

### 2.2 전체 목록 조회 API 수정

**메서드**: `getClassSectionsWithDetails`

```typescript
// ✅ TODO: getClassSectionsWithDetails 수정
async getClassSectionsWithDetails(): Promise<any[]> {
  try {
    const classSections = await this.getAllClassSections();
    
    const enrichedData = await Promise.all(
      classSections.map(async (section) => {
        try {
          // 🔄 점진적 색깔 생성
          const sectionWithColor = await this.ensureClassSectionHasColor(section);
          
          // 기존 로직 (Course, Teacher, Classroom 조회)
          const [courseDoc, teacherDoc, classroomDoc] = await Promise.all([
            this.db.collection('courses').doc(section.courseId).get(),
            this.db.collection('teachers').doc(section.teacherId).get(),
            this.db.collection('classrooms').doc(section.classroomId).get()
          ]);
          
          // ✅ currentStudents 정합성 검사
          const updatedSection = await this.validateAndUpdateCurrentStudents(sectionWithColor);
          
          return {
            ...updatedSection,
            course: courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null,
            teacher: teacherDoc.exists ? { id: teacherDoc.id, ...teacherDoc.data() } : null,
            classroom: classroomDoc.exists ? { id: classroomDoc.id, ...classroomDoc.data() } : null
          };
        } catch (error) {
          console.error(`수업 ${section.id} 처리 실패:`, error);
          // 에러 발생해도 기본 정보는 반환
          return { ...section, course: null, teacher: null, classroom: null };
        }
      })
    );
    
    return enrichedData;
  } catch (error) {
    console.error('수업 상세 정보 조회 실패:', error);
    throw new Error('수업 상세 정보 조회에 실패했습니다.');
  }
}
```

---

## 📋 **Phase 3: 새 수업 생성 시 색깔 자동 생성 (1일)**

### 3.1 수업 생성 로직 수정

**메서드**: `createClassSection`

```typescript
// ✅ TODO: createClassSection 수정
async createClassSection(data: CreateClassSectionRequest): Promise<string> {
  // 기존 검증 로직 유지...
  if (data.schedule && data.schedule.length > 0) {
    for (const schedule of data.schedule) {
      if (!schedule.dayOfWeek || !schedule.startTime || !schedule.endTime) {
        throw new Error('스케줄의 요일, 시작 시간, 종료 시간은 필수입니다.');
      }
      // ... 기존 검증 로직
    }
  }
  
  // 🎨 과목 정보 조회 및 색깔 생성
  let color: string | undefined;
  try {
    const course = await this.courseService.getCourseById(data.courseId);
    const tempId = `temp_${Date.now()}`; // 임시 ID로 색깔 생성
    color = this.generateClassColor(tempId, course?.name || 'Unknown');
    console.log(`🎨 새 수업 색깔 생성: ${color}`);
  } catch (error) {
    console.warn('새 수업 색깔 생성 실패, 나중에 자동 생성됩니다:', error);
  }
  
  const classSectionData = {
    ...data,
    color, // 👈 생성된 색깔 저장
    currentStudents: data.currentStudents ?? 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  return this.create(classSectionData);
}
```

---

## 📋 **Phase 4: StudentTimetableController 정리 (1일)**

### 4.1 기존 색깔 생성 로직 제거

**파일**: `functions/src/controllers/StudentTimetableController.ts`

```typescript
// ❌ TODO: generateClassColor 메서드 제거 (484-504줄)
// ❌ TODO: buildCompleteTimetableData에서 색깔 생성 로직 제거 (566줄)

// ✅ TODO: ClassSection에 이미 색깔 있다고 가정하고 사용
// 기존 로직에서 색깔 생성 부분을 색깔 사용으로 변경
return {
  id: classSection.id,
  name: classSection.name,
  teacher: { name: teacherName },
  classroom: { name: classroomName },
  schedule,
  color: classSection.color || '#3498db' // 폴백 색깔
};
```

---

## 📋 **Phase 5: TimetableEditModal 개선 (1일)**

### 5.1 임시 색깔 제거

**파일**: `frontend/src/features/schedule/components/TimetableEditModal.tsx`

```typescript
// ❌ 기존: 고정 색깔 사용 (373줄)
color: '#3498db'

// ✅ TODO: 실제 수업 색깔 사용
color: classSection.color || '#3498db'

// ✅ TODO: TimetableEditModal에서 availableClasses 데이터 활용
const tempClassData = {
  id: classToAdd.id,
  name: classToAdd.name,
  teacher: { name: classToAdd.teacher?.name || '담당 교사 미정' },
  classroom: { name: classToAdd.classroom?.name || '강의실 미정' },
  schedule: classToAdd.schedule || [],
  color: classToAdd.color || '#3498db' // 👈 실제 색깔 사용
};
```

---

## 📋 **Phase 6: 성능 최적화 및 모니터링 (1-2일)**

### 6.1 배치 색깔 생성 최적화

**대량 데이터 처리 시 성능 향상을 위한 배치 처리**

```typescript
// ✅ TODO: 대량 데이터 처리 최적화
async ensureBatchClassSectionsHaveColors(classSections: any[]): Promise<any[]> {
  // 색깔 없는 수업들만 필터링
  const sectionsWithoutColor = classSections.filter(cs => !cs.color);
  
  if (sectionsWithoutColor.length === 0) {
    return classSections; // 모든 수업에 색깔 있음
  }
  
  console.log(`🎨 ${sectionsWithoutColor.length}개 수업 색깔 배치 생성 시작`);
  
  // 과목 정보 배치 조회
  const courseIds = [...new Set(sectionsWithoutColor.map(cs => cs.courseId))];
  const coursePromises = courseIds.map(id => this.courseService.getCourseById(id));
  const courses = await Promise.all(coursePromises);
  
  const courseMap = new Map();
  courses.forEach((course, index) => {
    if (course) courseMap.set(courseIds[index], course.name);
  });
  
  // 배치 업데이트
  const batch = admin.firestore().batch();
  const updatedSections = [...classSections];
  
  for (const section of sectionsWithoutColor) {
    const courseName = courseMap.get(section.courseId) || 'Unknown';
    const color = this.generateClassColor(section.id, courseName);
    
    // 배치에 추가
    const docRef = admin.firestore().collection('class_sections').doc(section.id);
    batch.update(docRef, { color });
    
    // 메모리상 데이터도 업데이트
    const index = updatedSections.findIndex(cs => cs.id === section.id);
    if (index !== -1) {
      updatedSections[index] = { ...section, color };
    }
  }
  
  await batch.commit();
  console.log(`✅ ${sectionsWithoutColor.length}개 수업 색깔 배치 생성 완료`);
  
  return updatedSections;
}
```

### 6.2 모니터링 및 로깅

```typescript
// ✅ TODO: 색깔 생성 통계 추가
private logColorGenerationStats() {
  // 색깔 생성 횟수, 성공률, 평균 응답시간 등 로깅
}
```

---

## 📋 **Phase 7: 테스트 및 검증 (2-3일)**

### 7.1 단위 테스트

```typescript
// ✅ TODO: 색깔 생성 로직 테스트
describe('generateClassColor', () => {
  it('동일한 입력에 대해 동일한 색깔 반환', () => {
    const color1 = service.generateClassColor('class1', 'Math');
    const color2 = service.generateClassColor('class1', 'Math');
    expect(color1).toBe(color2);
  });
  
  it('다른 입력에 대해 다른 색깔 반환 (높은 확률)', () => {
    const color1 = service.generateClassColor('class1', 'Math');
    const color2 = service.generateClassColor('class2', 'Science');
    expect(color1).not.toBe(color2);
  });
  
  it('유효한 hex 색상 코드 반환', () => {
    const color = service.generateClassColor('class1', 'Math');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
```

### 7.2 통합 테스트

```typescript
// ✅ TODO: API 응답에 색깔 포함 확인
describe('getClassSectionsWithDetails', () => {
  it('모든 수업에 색깔 포함되어야 함', async () => {
    const response = await controller.getAllClassSectionsWithDetails(req, res);
    response.data.forEach(classSection => {
      expect(classSection.color).toBeDefined();
      expect(classSection.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
  
  it('동일한 수업은 항상 동일한 색깔 반환', async () => {
    const response1 = await controller.getClassSectionWithDetailsById(req1, res1);
    const response2 = await controller.getClassSectionWithDetailsById(req1, res1);
    expect(response1.data.color).toBe(response2.data.color);
  });
});
```

### 7.3 성능 테스트

```typescript
// ✅ TODO: 성능 테스트
describe('Color Generation Performance', () => {
  it('대량 수업 조회 시 합리적인 응답 시간', async () => {
    const startTime = Date.now();
    await controller.getAllClassSectionsWithDetails(req, res);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(5000); // 5초 이내
  });
});
```

---

## 📊 **구현 일정 및 우선순위**

| Phase | 작업 | 소요일 | 우선순위 | 의존성 | 담당자 |
|-------|------|--------|----------|---------|---------|
| 1 | 기반 작업 | 1-2일 | 🔴 High | None | Backend Dev |
| 2 | 기존 API 수정 | 2-3일 | 🔴 High | Phase 1 | Backend Dev |
| 3 | 새 수업 색깔 생성 | 1일 | 🟡 Medium | Phase 1 | Backend Dev |
| 4 | 기존 로직 정리 | 1일 | 🟡 Medium | Phase 2 | Backend Dev |
| 5 | Modal 개선 | 1일 | 🟢 Low | Phase 2 | Frontend Dev |
| 6 | 성능 최적화 | 1-2일 | 🟡 Medium | Phase 2 | Backend Dev |
| 7 | 테스트 검증 | 2-3일 | 🔴 High | All Phases | QA/Dev Team |

**총 예상 소요 기간: 7-12일 (1.5-2.5주)**

---

## 🎯 **예상 효과**

### 성능 개선
- ✅ 색깔 생성 연산 최소화 (매 요청마다 → 최초 1회)
- ✅ 데이터베이스 조회 최적화
- ✅ 응답 시간 단축

### 일관성 보장
- ✅ 모든 API에서 동일한 색깔 시스템 사용
- ✅ 동일한 수업은 항상 동일한 색깔 유지
- ✅ 시스템 전반의 시각적 일관성

### 확장성 향상
- ✅ 향후 색깔 관련 기능 추가 용이
- ✅ 관리자 색깔 수동 설정 기능 확장 가능
- ✅ 색깔 테마 시스템 도입 가능

### 유지보수성
- ✅ 색깔 생성 로직의 중앙집중화
- ✅ 점진적 마이그레이션으로 안전한 배포
- ✅ 기존 시스템과의 호환성 유지

---

## 🚨 **위험 요소 및 대응 방안**

### 위험 요소
1. **기존 데이터 마이그레이션 실패**
   - 대응: 점진적 마이그레이션으로 위험 최소화
   - 백업: 원본 데이터 보존 및 롤백 계획

2. **성능 저하**
   - 대응: 배치 처리 및 캐싱 전략 적용
   - 모니터링: 실시간 성능 측정 및 최적화

3. **색깔 중복 문제**
   - 대응: 30가지 색상 팔레트로 충분한 다양성 확보
   - 확장: 필요시 색상 팔레트 확장 가능

### 롤백 계획
1. **Phase별 독립적 롤백 가능**
2. **기존 로직 보존으로 즉시 복원 가능**
3. **데이터베이스 변경사항 최소화**

---

## 📝 **체크리스트**

### Phase 1
- [ ] `generateClassColor` 메서드를 ClassSectionService로 이동
- [ ] CourseService 의존성 추가
- [ ] `ensureClassSectionHasColor` 헬퍼 메서드 구현

### Phase 2
- [ ] `getClassSectionWithDetailsById` 수정
- [ ] `getClassSectionsWithDetails` 수정
- [ ] 점진적 색깔 생성 테스트

### Phase 3
- [ ] `createClassSection`에서 색깔 자동 생성
- [ ] 새 수업 생성 테스트

### Phase 4
- [ ] StudentTimetableController에서 색깔 생성 로직 제거
- [ ] 기존 API 호환성 확인

### Phase 5
- [ ] TimetableEditModal에서 실제 색깔 사용
- [ ] UI 테스트 및 확인

### Phase 6
- [ ] 배치 색깔 생성 최적화 구현
- [ ] 성능 모니터링 추가

### Phase 7
- [ ] 단위 테스트 작성 및 실행
- [ ] 통합 테스트 작성 및 실행
- [ ] 성능 테스트 및 최적화
- [ ] 전체 시스템 검증

---

**작성일**: 2024년 8월 29일  
**버전**: 1.0  
**상태**: 계획 단계