import {db} from "../../config/firebase";
import {
  Parent,
  ParentStudent,
  CreateParentRequest,
  UpdateParentRequest,
  CreateParentStudentRequest,
  ParentFilter,
  ParentWithStudents,
  StudentWithParents,
} from "./parents.types";

export class ParentsService {
  private parentsCollection = db.collection("parents");
  private parentStudentCollection = db.collection("parent_student");

  // 부모 생성
  async createParent(parentData: CreateParentRequest): Promise<Parent> {
    const now = new Date();
    const parentId = `parent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const parent: Parent = {
      user_id: parentData.user_id,
      parent_id: parentId,
      relationship: parentData.relationship,
      emergency_contact: parentData.emergency_contact,
      occupation: parentData.occupation,
      createdAt: now as any,
      updatedAt: now as any,
    };

    await this.parentsCollection.doc(parentId).set(parent);
    return parent;
  }

  // 부모 조회
  async getParent(parentId: string): Promise<Parent | null> {
    const doc = await this.parentsCollection.doc(parentId).get();
    return doc.exists ? doc.data() as Parent : null;
  }

  // 사용자 ID로 부모 조회
  async getParentByUserId(userId: string): Promise<Parent | null> {
    const snapshot = await this.parentsCollection
      .where("user_id", "==", userId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Parent;
  }

  // 모든 부모 조회
  async getAllParents(filter?: ParentFilter): Promise<Parent[]> {
    let query: any = this.parentsCollection;

    if (filter?.user_id) {
      query = query.where("user_id", "==", filter.user_id);
    }

    if (filter?.relationship) {
      query = query.where("relationship", "==", filter.relationship);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => doc.data() as Parent);
  }

  // 부모 업데이트
  async updateParent(parentId: string, updateData: UpdateParentRequest): Promise<Parent | null> {
    const updateDataWithTimestamp = {
      ...updateData,
      updatedAt: new Date() as any,
    };

    await this.parentsCollection.doc(parentId).update(updateDataWithTimestamp);
    return this.getParent(parentId);
  }

  // 부모 삭제
  async deleteParent(parentId: string): Promise<boolean> {
    try {
      await this.parentsCollection.doc(parentId).delete();
      return true;
    } catch (error) {
      return false;
    }
  }

  // 부모-학생 관계 생성
  async createParentStudent(relationship: CreateParentStudentRequest): Promise<ParentStudent> {
    const now = new Date();
    const parentStudent: ParentStudent = {
      parent_id: relationship.parent_id,
      student_id: relationship.student_id,
      user_id: relationship.user_id,
      relationship: relationship.relationship,
      is_primary_contact: relationship.is_primary_contact || false,
      createdAt: now as any,
    };

    const docId = `${relationship.parent_id}_${relationship.student_id}`;
    await this.parentStudentCollection.doc(docId).set(parentStudent);
    return parentStudent;
  }

  // 부모의 모든 학생 조회
  async getStudentsByParent(parentId: string): Promise<ParentStudent[]> {
    const snapshot = await this.parentStudentCollection
      .where("parent_id", "==", parentId)
      .get();

    return snapshot.docs.map((doc: any) => doc.data() as ParentStudent);
  }

  // 학생의 모든 부모 조회
  async getParentsByStudent(studentId: string): Promise<ParentStudent[]> {
    const snapshot = await this.parentStudentCollection
      .where("student_id", "==", studentId)
      .get();

    return snapshot.docs.map((doc: any) => doc.data() as ParentStudent);
  }

  // 부모와 학생 정보를 포함한 상세 조회
  async getParentWithStudents(parentId: string): Promise<ParentWithStudents | null> {
    const parent = await this.getParent(parentId);
    if (!parent) return null;

    const parentStudents = await this.getStudentsByParent(parentId);

    // 학생 정보 조회 (실제 구현에서는 users 컬렉션에서 조회)
    const students = await Promise.all(
      parentStudents.map(async (ps) => {
        // 여기서는 간단한 예시, 실제로는 users 컬렉션에서 조회
        return {
          student_id: ps.student_id,
          user_id: ps.user_id,
          name: `Student ${ps.student_id}`, // 실제로는 users 컬렉션에서 조회
          relationship: ps.relationship,
          is_primary_contact: ps.is_primary_contact,
        };
      })
    );

    return {
      parent,
      students,
    };
  }

  // 학생과 부모 정보를 포함한 상세 조회
  async getStudentWithParents(studentId: string): Promise<StudentWithParents | null> {
    const parentStudents = await this.getParentsByStudent(studentId);

    if (parentStudents.length === 0) return null;

    // 부모 정보 조회 (실제 구현에서는 users 컬렉션에서 조회)
    const parents = await Promise.all(
      parentStudents.map(async (ps) => {
        const parent = await this.getParent(ps.parent_id);
        return {
          parent_id: ps.parent_id,
          user_id: parent?.user_id || "",
          name: parent ? `Parent ${parent.user_id}` : `Parent ${ps.parent_id}`, // 실제로는 users 컬렉션에서 조회
          relationship: ps.relationship,
          is_primary_contact: ps.is_primary_contact,
        };
      })
    );

    return {
      student_id: studentId,
      user_id: parentStudents[0].user_id,
      name: `Student ${studentId}`, // 실제로는 users 컬렉션에서 조회
      parents,
    };
  }

  // 부모-학생 관계 삭제
  async deleteParentStudent(parentId: string, studentId: string): Promise<boolean> {
    try {
      const docId = `${parentId}_${studentId}`;
      await this.parentStudentCollection.doc(docId).delete();
      return true;
    } catch (error) {
      return false;
    }
  }
}
