import { BaseService } from '../base/BaseService';
import { Student } from '../../types/student';
import { INITIAL_STUDENTS_DATA } from './studentData';

export class StudentService extends BaseService {
  private static readonly COLLECTION_NAME = "students";

  async initializeStudents(): Promise<Student[]> {
    const batch = this.db.batch();
    
    INITIAL_STUDENTS_DATA.forEach((student) => {
      const docRef = this.getCollection(StudentService.COLLECTION_NAME).doc(student.id);
      batch.set(docRef, student);
    });

    await batch.commit();
    return INITIAL_STUDENTS_DATA;
  }

  async getAllStudents(): Promise<Student[]> {
    const snapshot = await this.getCollection(StudentService.COLLECTION_NAME).get();
    const students: Student[] = [];

    snapshot.forEach((doc) => {
      students.push(doc.data() as Student);
    });

    return students.sort((a, b) => a.seatNumber - b.seatNumber);
  }

  async getStudentById(id: string): Promise<Student | null> {
    const doc = await this.getCollection(StudentService.COLLECTION_NAME).doc(id).get();
    return doc.exists ? (doc.data() as Student) : null;
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<void> {
    await this.getCollection(StudentService.COLLECTION_NAME).doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
  }

  async deleteStudent(id: string): Promise<void> {
    await this.getCollection(StudentService.COLLECTION_NAME).doc(id).delete();
  }
} 