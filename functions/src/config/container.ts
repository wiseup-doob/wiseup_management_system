import { StudentService } from '../services/student/StudentService';
import { AttendanceService } from '../services/attendance/AttendanceService';
import { SeatService } from '../services/seat/SeatService';
import { SeatAssignmentService } from '../services/assignment/SeatAssignmentService';
import { TimetableService } from '../services/timetable/TimetableService';
import { AuthService } from '../services/auth/AuthService';
import { StudentController } from '../controllers/StudentController';
import { AttendanceController } from '../controllers/AttendanceController';
import { SeatController } from '../controllers/SeatController';
import { SeatAssignmentController } from '../controllers/SeatAssignmentController';
import { InitializationController } from '../controllers/InitializationController';
import { AuthController } from '../controllers/AuthController';

// 의존성 주입 컨테이너
class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();
  private singletons: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // 서비스 등록
  register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory);
  }

  // 서비스 해결
  resolve<T>(name: string): T {
    const factory = this.services.get(name);
    if (!factory) {
      throw new Error(`Service ${name} not found`);
    }
    return factory();
  }

  // 싱글톤 서비스 해결
  resolveSingleton<T>(name: string, factory: () => T): T {
    if (!this.singletons.has(name)) {
      const instance = factory();
      this.singletons.set(name, instance);
    }
    return this.singletons.get(name);
  }
}

// 컨테이너 인스턴스
const container = Container.getInstance();

// 서비스 등록
container.register('StudentService', () => new StudentService());
container.register('AttendanceService', () => new AttendanceService());
container.register('SeatService', () => new SeatService());
container.register('SeatAssignmentService', () => new SeatAssignmentService());
container.register('TimetableService', () => new TimetableService());
container.register('AuthService', () => new AuthService());

// 컨트롤러 등록
container.register('StudentController', () => {
  const studentService = container.resolve<StudentService>('StudentService');
  return new StudentController(studentService);
});

container.register('AttendanceController', () => {
  const attendanceService = container.resolve<AttendanceService>('AttendanceService');
  return new AttendanceController(attendanceService);
});

container.register('SeatController', () => {
  const seatService = container.resolve<SeatService>('SeatService');
  return new SeatController(seatService);
});

container.register('SeatAssignmentController', () => {
  const seatAssignmentService = container.resolve<SeatAssignmentService>('SeatAssignmentService');
  return new SeatAssignmentController(seatAssignmentService);
});

container.register('InitializationController', () => {
  const studentService = container.resolve<StudentService>('StudentService');
  const attendanceService = container.resolve<AttendanceService>('AttendanceService');
  const seatService = container.resolve<SeatService>('SeatService');
  const seatAssignmentService = container.resolve<SeatAssignmentService>('SeatAssignmentService');
  const timetableService = container.resolve<TimetableService>('TimetableService');
  return new InitializationController(studentService, attendanceService, seatService, seatAssignmentService, timetableService);
});

container.register('AuthController', () => {
  const authService = container.resolve<AuthService>('AuthService');
  return new AuthController(authService);
});

export { container };
export default container;
