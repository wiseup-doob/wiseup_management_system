import {db} from "../../config/firebase";
import {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleFilter,
} from "./roles.types";
import {FieldValue} from "firebase-admin/firestore";

const ROLES_COL = "roles";

// 공개용 역할 정보로 변환
const toPublicRole = (roleData: Role): Role => {
  const {role_id, role_name, createdAt, updatedAt} = roleData;
  return {
    role_id,
    role_name,
    createdAt,
    updatedAt,
  };
};

// 역할 ID로 역할 조회 (내부용)
async function getRoleByIdInternal(roleId: string): Promise<Role | null> {
  const doc = await db.collection(ROLES_COL).doc(roleId).get();
  if (!doc.exists) return null;
  return doc.data() as Role;
}

// 역할 ID로 역할 조회
export async function getRoleById(roleId: string): Promise<Role | null> {
  const roleData = await getRoleByIdInternal(roleId);
  if (!roleData) return null;
  return toPublicRole(roleData);
}

// 역할 생성
export async function createRole(data: CreateRoleRequest): Promise<Role> {
  const now = FieldValue.serverTimestamp();

  const roleData: Role = {
    role_id: data.role_id,
    role_name: data.role_name,
    createdAt: now as any,
    updatedAt: now as any,
  };

  await db.collection(ROLES_COL).doc(data.role_id).set(roleData);
  return toPublicRole(roleData);
}

// 역할 업데이트
export async function updateRole(roleId: string, data: UpdateRoleRequest): Promise<Role | null> {
  const existingRole = await getRoleByIdInternal(roleId);
  if (!existingRole) return null;

  const updateData: Partial<Role> = {
    updatedAt: FieldValue.serverTimestamp() as any,
  };

  if (data.role_name !== undefined) updateData.role_name = data.role_name;

  await db.collection(ROLES_COL).doc(roleId).update(updateData);

  const updatedRole = await getRoleByIdInternal(roleId);
  return updatedRole ? toPublicRole(updatedRole) : null;
}

// 역할 삭제
export async function deleteRole(roleId: string): Promise<boolean> {
  const existingRole = await getRoleByIdInternal(roleId);
  if (!existingRole) return false;

  await db.collection(ROLES_COL).doc(roleId).delete();
  return true;
}

// 필터로 역할 조회
export async function getRolesByFilter(filter: RoleFilter): Promise<Role[]> {
  let query: any = db.collection(ROLES_COL);

  if (filter.role_id) {
    query = query.where("role_id", "==", filter.role_id);
  }

  const snapshot = await query.get();
  const roles = snapshot.docs.map((doc: any) => doc.data() as Role);

  // 클라이언트 사이드 필터링 (role_name)
  let filteredRoles = roles;
  if (filter.role_name) {
    filteredRoles = roles.filter((roleData: any) =>
      roleData.role_name.toLowerCase().includes(filter.role_name!.toLowerCase())
    );
  }

  return filteredRoles.map(toPublicRole);
}

// 모든 역할 조회
export async function getAllRoles(): Promise<Role[]> {
  const snapshot = await db.collection(ROLES_COL).get();
  const roles = snapshot.docs.map((doc) => doc.data() as Role);
  return roles.map(toPublicRole);
}

// 역할 이름 중복 체크
export async function checkRoleNameExists(roleName: string, excludeRoleId?: string): Promise<boolean> {
  const snapshot = await db.collection(ROLES_COL).where("role_name", "==", roleName).get();
  const roles = snapshot.docs.map((doc) => doc.data() as Role);

  if (excludeRoleId) {
    return roles.some((roleData) => roleData.role_id !== excludeRoleId);
  }

  return roles.length > 0;
}
