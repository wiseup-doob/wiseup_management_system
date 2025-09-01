import { BaseService } from './BaseService';
import { CourseService } from './CourseService';
import { TeacherService } from './TeacherService';
import { ClassroomService } from './ClassroomService';
import { ClassSchedule } from '@shared/types/class-section.types';

/**
 * 색상 관리 전용 서비스
 * ClassSection의 색상 생성 및 관리를 담당
 */
export class ColorService extends BaseService {
  private courseService: CourseService;
  private teacherService: TeacherService;
  private classroomService: ClassroomService;

  // 🎨 색상 팔레트 (색상 코드와 이름을 함께 관리 - 60개)
  private readonly COLOR_NAMES: Record<string, string> = {
    '#1f77b4': '파란색',
    '#aec7e8': '연한 파란색',
    '#ff7f0e': '주황색',
    '#ffbb78': '연한 주황색',
    '#2ca02c': '초록색',
    '#98df8a': '연한 초록색',
    '#d62728': '빨간색',
    '#ff9896': '연한 빨간색',
    '#9467bd': '보라색',
    '#c5b0d5': '연한 보라색',
    '#8c564b': '갈색',
    '#c49c94': '연한 갈색',
    '#e377c2': '분홍색',
    '#f7b6d2': '연한 분홍색',
    '#7f7f7f': '회색',
    '#c7c7c7': '연한 회색',
    '#bcbd22': '노란색',
    '#dbdb8d': '연한 노란색',
    '#17becf': '청록색',
    '#9edae5': '연한 청록색',
    '#393b79': '진한 파란색',
    '#637939': '진한 초록색',
    '#8c6d31': '진한 갈색',
    '#b5cf6b': '연한 초록색',
    '#cedb9c': '연한 초록색',
    '#bd9e39': '진한 주황색',
    '#e7ba52': '연한 주황색',
    '#ad494a': '진한 빨간색',
    '#a6cee3': '연한 파란색',
    '#ff6b6b': '연한 빨간색',
    '#4ecdc4': '청록색',
    '#45b7d1': '연한 파란색',
    '#96ceb4': '연한 초록색',
    '#feca57': '연한 노란색',
    '#ff9ff3': '연한 분홍색',
    '#54a0ff': '연한 파란색',
    '#5f27cd': '진한 보라색',
    '#00d2d3': '청록색',
    '#ff9f43': '연한 주황색',
    '#10ac84': '진한 초록색',
    '#ee5a24': '진한 주황색',
    '#2f3542': '진한 회색',
    '#5352ed': '진한 파란색',
    '#3742fa': '진한 파란색',
    '#747d8c': '중간 회색',
    '#57606f': '진한 회색',
    '#ff6348': '연한 빨간색',
    '#ff4757': '연한 빨간색',
    '#ff3838': '진한 빨간색'
  };



  // 🌈 색상 계열별 그룹화 (유사한 색상들을 그룹으로 관리)
  private readonly COLOR_GROUPS = {
    blue: [0, 1, 20, 21, 32, 33, 44, 45],      // 파란색 계열
    green: [4, 5, 22, 23, 34, 35, 46, 47],     // 초록색 계열
    red: [6, 7, 24, 25, 36, 37, 48, 49],       // 빨간색 계열
    orange: [2, 3, 26, 27, 38, 39, 50, 51],    // 주황색 계열
    purple: [8, 9, 28, 29, 40, 41, 52, 53],    // 보라색 계열
    yellow: [16, 17, 30, 31, 42, 43, 54, 55],  // 노란색 계열
    neutral: [14, 15, 56, 57, 58, 59]           // 중성색 계열
  };

  constructor() {
    super('class-sections');
    this.courseService = new CourseService();
    this.teacherService = new TeacherService();
    this.classroomService = new ClassroomService();
  }

  /**
   * 🎯 Class Section 기반 고급 색상 생성
   * 교사, 강의실, 시간대를 고려한 지능형 색상 생성
   */
  async generateColorForClassSection(
    classSectionId: string,
    className: string,
    teacherId: string,
    classroomId: string,
    schedule?: ClassSchedule[]
  ): Promise<string> {
    try {
      console.log(`🎨 Class Section "${className}" 색상 생성 시작`);

      // 1️⃣ 기본 색상 생성 (수업 ID 기반)
      const baseColor = this.generateBaseColor(classSectionId);
      
      // 2️⃣ 교사별 색상 변형 (같은 교사의 수업은 유사한 색상 계열)
      const teacherVariation = await this.generateTeacherVariation(teacherId);
      
      // 3️⃣ 강의실별 색상 조정 (같은 강의실의 수업은 구분 가능하도록)
      const classroomAdjustment = await this.generateClassroomAdjustment(classroomId);
      
      // 4️⃣ 시간대별 색상 분산 (겹치는 시간대 수업은 대비되는 색상)
      const timeBasedAdjustment = this.generateTimeBasedAdjustment(schedule);
      
      // 5️⃣ 최종 색상 조합 및 최적화
      const finalColor = this.combineAndOptimizeColors(
        baseColor,
        teacherVariation,
        classroomAdjustment,
        timeBasedAdjustment
      );

      console.log(`✅ Class Section "${className}" 색상 생성 완료: ${finalColor}`);
      return finalColor;

    } catch (error) {
      console.error('색상 생성 중 오류:', error);
      // 에러 발생시 기본 색상 반환
      const colorCodes = Object.keys(this.COLOR_NAMES);
      return colorCodes[0];
    }
  }

  /**
   * 🔄 기존 호환성을 위한 메서드 (점진적 마이그레이션)
   */
  async generateColorForClassSectionLegacy(classId: string, courseId: string): Promise<string> {
    try {
      // Course 정보 조회
      const course = await this.courseService.getCourseById(courseId);
      const courseName = course?.name || 'Unknown Course';

      // 해시 기반 색상 생성 (기존 로직 유지)
      const combined = `${classId}_${courseName}`;
      let hash = 0;
      
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32bit 정수로 변환
      }
      
      const colorCodes = Object.keys(this.COLOR_NAMES);
      const index = Math.abs(hash) % colorCodes.length;
      return colorCodes[index];

    } catch (error) {
      console.error('색상 생성 중 오류:', error);
      const colorCodes = Object.keys(this.COLOR_NAMES);
      return colorCodes[0];
    }
  }

  /**
   * 🎨 기본 색상 생성 (수업 ID 기반)
   */
  private generateBaseColor(classSectionId: string): string {
    let hash = 0;
    for (let i = 0; i < classSectionId.length; i++) {
      const char = classSectionId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
          const colorCodes = Object.keys(this.COLOR_NAMES);
      const index = Math.abs(hash) % colorCodes.length;
      return colorCodes[index];
  }

  /**
   * 👨‍🏫 교사별 색상 변형 생성
   * 같은 교사의 수업은 유사한 색상 계열 사용
   */
  private async generateTeacherVariation(teacherId: string): Promise<number> {
    try {
      const teacher = await this.teacherService.getTeacherById(teacherId);
      if (!teacher) return 0;

      // 교사 ID 기반으로 색상 계열 결정
      let hash = 0;
      for (let i = 0; i < teacherId.length; i++) {
        const char = teacherId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      // 색상 계열 그룹 선택
      const groupKeys = Object.keys(this.COLOR_GROUPS);
      const groupIndex = Math.abs(hash) % groupKeys.length;
      const selectedGroup = groupKeys[groupIndex];
      
      // 해당 그룹 내에서 색상 인덱스 선택
      const groupColors = this.COLOR_GROUPS[selectedGroup as keyof typeof this.COLOR_GROUPS];
      const colorIndex = groupColors[Math.abs(hash) % groupColors.length];
      
      return colorIndex;
    } catch (error) {
      console.warn('교사별 색상 변형 생성 실패:', error);
      return 0;
    }
  }

  /**
   * 🏫 강의실별 색상 조정
   * 같은 강의실의 수업은 구분 가능하도록 색상 조정
   */
  private async generateClassroomAdjustment(classroomId: string): Promise<number> {
    try {
      const classroom = await this.classroomService.getClassroomById(classroomId);
      if (!classroom) return 0;

      // 강의실 ID 기반으로 색상 조정값 생성
      let hash = 0;
      for (let i = 0; i < classroomId.length; i++) {
        const char = classroomId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      // 색상 팔레트 인덱스 반환
      const colorCodes = Object.keys(this.COLOR_NAMES);
      return Math.abs(hash) % colorCodes.length;
    } catch (error) {
      console.warn('강의실별 색상 조정 생성 실패:', error);
      return 0;
    }
  }

  /**
   * ⏰ 시간대별 색상 분산
   * 겹치는 시간대 수업은 대비되는 색상 사용
   */
  private generateTimeBasedAdjustment(schedule?: ClassSchedule[]): number {
    if (!schedule || schedule.length === 0) return 0;

    try {
      // 시간대별 색상 분산을 위한 해시 생성
      let timeHash = 0;
      for (const s of schedule) {
        timeHash += s.dayOfWeek.charCodeAt(0);
        timeHash += s.startTime.charCodeAt(0);
        timeHash += s.endTime.charCodeAt(0);
      }

      // 색상 팔레트 인덱스 반환
      const colorCodes = Object.keys(this.COLOR_NAMES);
      return Math.abs(timeHash) % colorCodes.length;
    } catch (error) {
      console.warn('시간대별 색상 분산 생성 실패:', error);
      return 0;
    }
  }

  /**
   * 🎨 최종 색상 조합 및 최적화
   */
  private combineAndOptimizeColors(
    baseColor: string,
    teacherVariation: number,
    classroomAdjustment: number,
    timeBasedAdjustment: number
  ): string {
    try {
      // 색상 조합 전략: 가중치 기반 선택
      const weights = [0.4, 0.3, 0.2, 0.1]; // 기본색상, 교사변형, 강의실조정, 시간대분산
      const colorIndices = [baseColor, teacherVariation, classroomAdjustment, timeBasedAdjustment];
      
      // 가중치 기반으로 최종 색상 인덱스 결정
      let finalIndex = 0;
      for (let i = 0; i < weights.length; i++) {
        if (typeof colorIndices[i] === 'string') {
          // baseColor는 이미 색상 문자열이므로 인덱스로 변환
          const colorCodes = Object.keys(this.COLOR_NAMES);
          const index = colorCodes.indexOf(colorIndices[i] as string);
          finalIndex += (index * weights[i]);
        } else {
          finalIndex += ((colorIndices[i] as number) * weights[i]);
        }
      }

      // 최종 인덱스를 팔레트 범위 내로 조정
      const colorCodes = Object.keys(this.COLOR_NAMES);
      finalIndex = Math.round(finalIndex) % colorCodes.length;
      return colorCodes[finalIndex];

    } catch (error) {
      console.warn('색상 조합 최적화 실패:', error);
      // 실패 시 기본 색상 반환
      if (typeof baseColor === 'string') {
        return baseColor;
      }
      const colorCodes = Object.keys(this.COLOR_NAMES);
      return colorCodes[0];
    }
  }

  /**
   * 🔄 여러 ClassSection에 대한 색상 일괄 생성 (새로운 로직)
   */
  async generateColorsForMultipleClassSectionsAdvanced(
    classSections: Array<{
      id: string;
      name: string;
      teacherId: string;
      classroomId: string;
      schedule?: ClassSchedule[];
    }>
  ): Promise<Array<{ id: string; color: string }>> {
    const results: Array<{ id: string; color: string }> = [];

    for (const classSection of classSections) {
      try {
        const color = await this.generateColorForClassSection(
          classSection.id,
          classSection.name,
          classSection.teacherId,
          classSection.classroomId,
          classSection.schedule
        );
        results.push({ id: classSection.id, color });
      } catch (error) {
        console.error(`ClassSection ${classSection.id} 색상 생성 실패:`, error);
        const colorCodes = Object.keys(this.COLOR_NAMES);
        results.push({ id: classSection.id, color: colorCodes[0] });
      }
    }

    return results;
  }

  /**
   * 🔄 기존 호환성을 위한 메서드 (점진적 마이그레이션)
   */
  async generateColorsForMultipleClassSections(
    classSections: Array<{ id: string; courseId: string }>
  ): Promise<Array<{ id: string; color: string }>> {
    const results: Array<{ id: string; color: string }> = [];

    for (const classSection of classSections) {
      try {
        const color = await this.generateColorForClassSectionLegacy(
          classSection.id, 
          classSection.courseId
        );
        results.push({ id: classSection.id, color });
      } catch (error) {
        console.error(`ClassSection ${classSection.id} 색상 생성 실패:`, error);
        const colorCodes = Object.keys(this.COLOR_NAMES);
        results.push({ id: classSection.id, color: colorCodes[0] });
      }
    }

    return results;
  }

  /**
   * 🎨 색상 팔레트 전체 반환 (UI에서 수동 선택용)
   */
  getAvailableColors(): string[] {
    return Object.keys(this.COLOR_NAMES);
  }

  /**
   * 🎨 색상 코드와 이름을 함께 반환 (새로운 메서드)
   */
  getColorWithNames(): Array<{ code: string; name: string }> {
    return Object.entries(this.COLOR_NAMES).map(([code, name]) => ({
      code,
      name
    }));
  }

  /**
   * 🌈 색상 계열별 그룹 반환
   */
  getColorGroups(): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    const colorCodes = Object.keys(this.COLOR_NAMES);
    for (const [groupName, indices] of Object.entries(this.COLOR_GROUPS)) {
      groups[groupName] = indices.map(index => colorCodes[index]);
    }
    return groups;
  }

  /**
   * ✅ 색상이 유효한 색상인지 검증
   */
  isValidColor(color: string): boolean {
    // 기본 팔레트에 있는지 확인
    if (Object.keys(this.COLOR_NAMES).includes(color)) {
      return true;
    }

    // CSS 색상 형식 검증 (hex, rgb, rgba 등)
    const colorRegex = /^(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\))$/;
    return colorRegex.test(color);
  }

  /**
   * 🔍 색상 충돌 감지 (같은 시간대의 유사한 색상)
   */
  detectColorConflict(
    existingColors: Array<{ id: string; color: string; schedule?: ClassSchedule[] }>,
    newColor: string,
    newSchedule?: ClassSchedule[]
  ): boolean {
    if (!newSchedule) return false;

    for (const existing of existingColors) {
      if (!existing.schedule) continue;

      // 시간대 겹침 확인
      const hasTimeOverlap = this.checkTimeOverlap(existing.schedule, newSchedule);
      
      if (hasTimeOverlap) {
        // 색상 유사성 확인 (간단한 색상 거리 계산)
        const colorDistance = this.calculateColorDistance(existing.color, newColor);
        if (colorDistance < 30) { // 임계값: 30
          return true; // 충돌 감지
        }
      }
    }

    return false;
  }

  /**
   * ⏰ 시간대 겹침 확인
   */
  private checkTimeOverlap(schedule1: ClassSchedule[], schedule2: ClassSchedule[]): boolean {
    for (const s1 of schedule1) {
      for (const s2 of schedule2) {
        if (s1.dayOfWeek === s2.dayOfWeek) {
          // 시간 겹침 확인
          const start1 = this.timeToMinutes(s1.startTime);
          const end1 = this.timeToMinutes(s1.endTime);
          const start2 = this.timeToMinutes(s2.startTime);
          const end2 = this.timeToMinutes(s2.endTime);

          if (!(end1 <= start2 || end2 <= start1)) {
            return true; // 겹침
          }
        }
      }
    }
    return false;
  }

  /**
   * 🕐 시간을 분 단위로 변환
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * 🎨 색상 간 거리 계산 (간단한 유클리드 거리)
   */
  private calculateColorDistance(color1: string, color2: string): number {
    try {
      const rgb1 = this.hexToRgb(color1);
      const rgb2 = this.hexToRgb(color2);
      
      if (!rgb1 || !rgb2) return 100; // 변환 실패 시 큰 거리 반환

      const distance = Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
      );

      return distance;
    } catch (error) {
      return 100; // 에러 시 큰 거리 반환
    }
  }

  /**
   * 🔴 HEX 색상을 RGB로 변환
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    try {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        return {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}