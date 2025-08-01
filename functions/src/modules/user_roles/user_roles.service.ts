import * as admin from "firebase-admin";
import { db } from "../../config/firebase";
import {
  UserRole,
  AssignUserRoleRequest,
  UserRoleFilter,
  UserWithRoles,
  RoleWithUsers,
} from "./user_roles.types";

const USER_ROLES_COL = "user_roles";

// 사용자 역할 할당
export async function assignUserRole(data: AssignUserRoleRequest): Promise<UserRole> {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const userRole: UserRole = {
    user_id: data.user_id,
    role_id: data.role_id,
    createdAt: now as any,
    updatedAt: now as any,
  };

  const docId = `${data.user_id}_${data.role_id}`;
  await db.collection(USER_ROLES_COL).doc(docId).set(userRole);
  return userRole;
}

// 사용자 역할 조회
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const snapshot = await db.collection(USER_ROLES_COL)
    .where("user_id", "==", userId)
    .get();

  return snapshot.docs.map((doc) => doc.data() as UserRole);
}

// 사용자 역할 삭제
export async function removeUserRole(userId: string, roleId: string): Promise<boolean> {
  try {
    const docId = `${userId}_${roleId}`;
    await db.collection(USER_ROLES_COL).doc(docId).delete();
    return true;
  } catch (error) {
    return false;
  }
}

// 사용자가 특정 역할을 가지고 있는지 확인
export async function hasRole(userId: string, roleId: string): Promise<boolean> {
  const docId = `${userId}_${roleId}`;
  const doc = await db.collection(USER_ROLES_COL).doc(docId).get();
  return doc.exists;
}

// 필터로 사용자 역할 조회
export async function getUserRolesByFilter(filter: UserRoleFilter): Promise<UserRole[]> {
  let query: admin.firestore.Query = db.collection(USER_ROLES_COL);

  if (filter.user_id) {
    query = query.where("user_id", "==", filter.user_id);
  }

  if (filter.role_id) {
    query = query.where("role_id", "==", filter.role_id);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data() as UserRole);
}

// 사용자와 역할 정보 함께 조회
export async function getUserWithRoles(userId: string): Promise<UserWithRoles | null> {
  // 사용자 정보 조회
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) return null;

  const user = userDoc.data();
  if (!user) return null;

  // 사용자의 모든 역할 조회
  const userRoles = await getUserRoles(userId);

  // 역할 정보 조회
  const roles = await Promise.all(
    userRoles.map(async (userRole) => {
      const roleDoc = await db.collection("roles").doc(userRole.role_id).get();
      const role = roleDoc.exists ? roleDoc.data() : null;

      return {
        role_id: userRole.role_id,
        role_name: role?.role_name || "Unknown Role",
      };
    })
  );

  return {
    user_id: user.user_id,
    user_name: user.user_name,
    user_email: user.user_email,
    roles,
  };
}

// 역할과 사용자 정보 함께 조회
export async function getRoleWithUsers(roleId: string): Promise<RoleWithUsers | null> {
  // 역할 정보 조회
  const roleDoc = await db.collection("roles").doc(roleId).get();
  if (!roleDoc.exists) return null;

  const role = roleDoc.data();
  if (!role) return null;

  // 해당 역할을 가진 사용자들 조회
  const userRolesSnapshot = await db.collection(USER_ROLES_COL)
    .where("role_id", "==", roleId)
    .get();

  const users = await Promise.all(
    userRolesSnapshot.docs.map(async (doc) => {
      const userRole = doc.data() as UserRole;
      const userDoc = await db.collection("users").doc(userRole.user_id).get();
      const user = userDoc.exists ? userDoc.data() : null;

      return {
        user_id: userRole.user_id,
        user_name: user?.user_name || "Unknown User",
        user_email: user?.user_email || "Unknown Email",
      };
    })
  );

  return {
    role_id: role.role_id,
    role_name: role.role_name,
    users,
  };
}

// 사용자 ID 유효성 체크
export async function checkUserExists(userId: string): Promise<boolean> {
  const doc = await db.collection("users").doc(userId).get();
  return doc.exists;
}

// 역할 ID 유효성 체크
export async function checkRoleExists(roleId: string): Promise<boolean> {
  const doc = await db.collection("roles").doc(roleId).get();
  return doc.exists;
}
