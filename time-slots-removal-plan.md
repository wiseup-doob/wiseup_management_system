# Time Slots 제거 및 유연한 시간표 시스템 구현 계획

## 📋 개요

기존의 `time_slots` 컬렉션을 완전히 제거하고, `timetables` 컬렉션도 제거하여 더 간단하고 직관적인 시간표 시스템으로 변경합니다. 사용자가 직접 시간대를 설정할 수 있는 유연한 시스템을 구축합니다.

## 🎯 목표

1. **`time_slots` 컬렉션 완전 제거**
2. **`timetables` 컬렉션 완전 제거**
3. **`timetable_items` 컬렉션 제거하고 `class_sections`에 직접 시간 정보 저장**
4. **사용자 정의 시간대 설정 기능 구현**
5. **동적 시간표 열 생성 시스템 구축**
6. **기존 데이터 마이그레이션 지원**
7. **구조 단순화로 성능 향상 및 유지보수성 개선**

## 🔄 변경 사항 요약

### **제거되는 요소**
- `time_slots` Firestore 컬렉션
- `timetables` Firestore 컬렉션
- `timetable_items` Firestore 컬렉션
- `TimeSlot` 인터페이스 및 관련 타입
- `Timetable` 인터페이스 및 관련 타입
- `TimetableItem` 인터페이스 및 관련 타입
- `TimeSlotService` 및 `TimeSlotController`
- `TimetableService` 및 `TimetableController`
- `TimetableItemService` 및 `TimetableItemController`
- `time-slot` 라우터
- `timetable` 라우터
- `timetable-item` 라우터

### **추가되는 요소**
- `class_sections`에 직접 시간 정보 저장 (startTime, endTime, dayOfWeek)
- 사용자 정의 시간대 설정 기능
- 동적 시간표 열 생성 시스템
- 시간표 설정 페이지
- localStorage 기반 설정 저장
- 단순화된 시간표 관리 시스템

## 📁 수정이 필요한 파일들

### **1. 공유 타입 정의**
- `shared/types/timetable.types.ts` - 완전 삭제 (TimeSlot, Timetable, TimetableItem 모두 제거)
- `shared/types/class-section.types.ts` - timeSlotId 제거, 직접 시간 정보 추가
- `shared/types/database.types.ts` - TIME_SLOTS, TIMETABLES, TIMETABLE_ITEMS 제거
- `shared/types/student-timetable.types.ts` - timetable 관련 타입 제거

### **2. 백엔드**
- `functions/src/services/TimeSlotService.ts` - 완전 삭제
- `functions/src/services/TimetableService.ts` - 완전 삭제
- `functions/src/services/TimetableItemService.ts` - 완전 삭제
- `functions/src/controllers/TimeSlotController.ts` - 완전 삭제
- `functions/src/controllers/TimetableController.ts` - 완전 삭제
- `functions/src/controllers/TimetableItemController.ts` - 완전 삭제
- `functions/src/routes/time-slot.ts` - 완전 삭제
- `functions/src/routes/timetable.ts` - 완전 삭제
- `functions/src/routes/timetable-item.ts` - 완전 삭제
- `functions/src/index.ts` - 모든 timetable 관련 라우터 등록 제거

### **3. 프론트엔드**
- `frontend/src/services/api.ts` - TimeSlot, Timetable, TimetableItem 메서드 모두 제거
- `frontend/src/features/timetable/` - 전체 폴더 삭제 (timetable 관련 기능을 class로 통합)
- `frontend/src/features/class/` - 시간표 관련 기능 통합
- `frontend/src/components/business/timetable/` - 전체 폴더 삭제
- `frontend/src/components/business/class/` - 시간표 표시 기능 통합

## 🚀 구현 단계

### **Phase 1: 백엔드 정리 (2-3시간)**
1. TimeSlot 관련 파일 삭제
2. Timetable 관련 파일 삭제 (Service, Controller, Routes)
3. index.ts에서 모든 timetable 관련 라우터 등록 제거
4. 공유 타입에서 TimeSlot, Timetable, TimetableItem 제거

### **Phase 2: 타입 정의 수정 (2-3시간)**
1. timetable.types.ts 파일 완전 삭제
2. ClassSchedule에서 timeSlotId 제거하고 직접 시간 정보 추가
3. ClassSection에 시간표 관련 필드 추가
4. student-timetable.types.ts에서 timetable 관련 타입 제거
5. 새로운 단순화된 시간표 타입 정의

### **Phase 3: 백엔드 서비스 수정 (3-4시간)**
1. TimetableItemService, TimetableService 완전 삭제
2. ClassSectionService에 시간표 관련 기능 통합
3. 시간 검증 로직을 ClassSectionService에 추가
4. 새로운 단순화된 시간표 서비스 구현

### **Phase 4: 프론트엔드 API 수정 (2-3시간)**
1. TimeSlot, Timetable, TimetableItem 관련 메서드 모두 제거
2. ClassSection API에 시간표 관련 기능 통합
3. 새로운 단순화된 시간표 API 구현

### **Phase 5: 상태 관리 수정 (3-4시간)**
1. timetableSlice 완전 삭제
2. classSlice에 시간표 관련 상태 통합
3. customTimeSlots 상태를 classSlice에 추가
4. 관련 액션 및 리듀서 추가
5. 기존 timetable 관련 상태를 class로 마이그레이션

### **Phase 6: useClass 훅 수정 (3-4시간)**
1. useTimetable 훅 완전 삭제
2. useClass 훅에 시간표 관련 기능 통합
3. 동적 시간대 생성 로직 추가
4. 사용자 정의 시간대 관리 기능
5. 기존 timetable 관련 로직을 class로 마이그레이션

### **Phase 7: ClassTable 컴포넌트 생성 (3-4시간)**
1. TimeTable 컴포넌트 완전 삭제
2. 새로운 ClassTable 컴포넌트 생성
3. 동적 시간대 기반 렌더링
4. 시간대별 블록 렌더링
5. ClassSection 기반 시간표 표시

### **Phase 8: Class 편집 페이지 수정 (3-4시간)**
1. TimetableEditPage 완전 삭제
2. ClassPage에 시간표 편집 기능 통합
3. 직접 시간 입력 UI
4. 요일 선택 드롭다운
5. 시간 검증 로직
6. ClassSection 기반 시간표 편집

### **Phase 9: Class 설정 페이지 생성 (3-4시간)**
1. TimetableSettingsPage 완전 삭제
2. ClassPage에 시간대 설정 기능 통합
3. 시간대 설정 UI
4. 드래그 앤 드롭 순서 변경
5. 설정 저장/로드
6. ClassSection 기반 시간대 관리

### **Phase 10: 데이터 마이그레이션 (2-3시간)**
1. 마이그레이션 스크립트 작성
2. timetable_items 데이터를 class_sections로 변환
3. time_slots, timetables 컬렉션 완전 삭제
4. 기존 timetable 관련 데이터를 class 기반으로 통합
5. 데이터 무결성 검증

## 🧪 테스트 계획

### **단위 테스트**
- 시간 검증 로직
- 동적 시간대 생성
- 사용자 정의 시간대 관리

### **통합 테스트**
- 시간표 생성/편집
- 시간표 표시
- 설정 저장/로드

## ⚠️ 주의사항

1. **데이터 백업 필수**
2. **단계별 검증 후 진행**
3. **롤백 계획 준비**
4. **성능 최적화 고려**

## 📅 예상 소요 시간

**총 예상 소요 시간: 25-35시간**

### **단계별 소요 시간**
- **Phase 1**: 백엔드 정리 (2-3시간)
- **Phase 2**: 타입 정의 수정 (2-3시간)
- **Phase 3**: 백엔드 서비스 수정 (3-4시간)
- **Phase 4**: 프론트엔드 API 수정 (2-3시간)
- **Phase 5**: 상태 관리 수정 (3-4시간)
- **Phase 6**: useClass 훅 수정 (3-4시간)
- **Phase 7**: ClassTable 컴포넌트 생성 (3-4시간)
- **Phase 8**: Class 편집 페이지 수정 (3-4시간)
- **Phase 9**: Class 설정 페이지 생성 (3-4시간)
- **Phase 10**: 데이터 마이그레이션 (2-3시간)

## 🎯 성공 기준

1. `time_slots`, `timetables`, `timetable_items` 컬렉션 완전 제거
2. `class_sections`에 직접 시간 정보 저장
3. 사용자가 직접 시간대 설정 가능
4. 동적 시간표 열 생성
5. 기존 기능 정상 작동
6. 사용자 경험 향상
7. 구조 단순화로 성능 향상
8. 유지보수성 개선
