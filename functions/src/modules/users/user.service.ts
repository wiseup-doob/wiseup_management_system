import {FieldValue} from "firebase-admin/firestore";
import {db} from "../../config/firebase";
import {User, PublicUser, CreateUserRequest, UpdateUserRequest, UserFilter} from "./user.types";
import {randomBytes, pbkdf2Sync} from "crypto";

const COL = process.env.COL_USERS ?? "users";

// 비밀번호 해싱 (PBKDF2 사용)
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32).toString("hex");
  const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// 비밀번호 검증
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(":");
  const hashToVerify = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash === hashToVerify;
}

// 고유 ID 생성 (bigint 형태의 timestamp 기반)
function generateUserId(): string {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, "0");
}

// 사용자 데이터에서 password_hash 제거
function toPublicUser(user: User): PublicUser {
  const {user_password_hash, ...publicUser} = user;
  return publicUser;
}

// 이메일로 사용자 조회 (내부용 - password_hash 포함, 인증 모듈에서 사용)
export async function getUserByEmailInternal(email: string): Promise<User | null> {
  const query = db.collection(COL).where("user_email", "==", email.toLowerCase()).limit(1);
  const snapshot = await query.get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as User;
}

// ID로 사용자 조회 (내부용 - password_hash 포함, 인증 모듈에서 사용)
export async function getUserByIdInternal(userId: string): Promise<User | null> {
  const doc = await db.collection(COL).doc(userId).get();
  if (!doc.exists) {
    return null;
  }

  return doc.data() as User;
}

// 비밀번호 업데이트 (인증 모듈에서 사용)
export async function updateUserPassword(userId: string, newPasswordHash: string): Promise<void> {
  await db.collection(COL).doc(userId).update({
    user_password_hash: newPasswordHash,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

// 이메일 중복 체크
export async function checkEmailExists(email: string, excludeUserId?: string): Promise<boolean> {
  const query = db.collection(COL).where("user_email", "==", email.toLowerCase());
  const snapshot = await query.get();

  if (excludeUserId) {
    // 업데이트 시 자신의 이메일은 제외
    return snapshot.docs.some((doc) => doc.id !== excludeUserId);
  }

  return !snapshot.empty;
}

// 전화번호 중복 체크
export async function checkPhoneExists(phone: string, excludeUserId?: string): Promise<boolean> {
  const query = db.collection(COL).where("user_phone", "==", phone);
  const snapshot = await query.get();

  if (excludeUserId) {
    // 업데이트 시 자신의 전화번호는 제외
    return snapshot.docs.some((doc) => doc.id !== excludeUserId);
  }

  return !snapshot.empty;
}

// 사용자 생성
export async function createUser(data: CreateUserRequest): Promise<PublicUser> {
  // 이메일 중복 체크
  const emailExists = await checkEmailExists(data.user_email);
  if (emailExists) {
    const error = new Error("Email already exists")
    ;(error as any).status = 409;
    throw error;
  }

  // 전화번호 중복 체크
  const phoneExists = await checkPhoneExists(data.user_phone);
  if (phoneExists) {
    const error = new Error("Phone number already exists")
    ;(error as any).status = 409;
    throw error;
  }

  const userId = generateUserId();
  const passwordHash = await hashPassword(data.password);

  const userData: User = {
    user_id: userId,
    user_name: data.user_name,
    user_phone: data.user_phone,
    user_email: data.user_email.toLowerCase(),
    user_password_hash: passwordHash,
    user_status: data.user_status || "active",
    createdAt: FieldValue.serverTimestamp() as any,
    updatedAt: FieldValue.serverTimestamp() as any,
  };

  await db.collection(COL).doc(userId).set(userData);
  return toPublicUser(userData);
}

// ID로 사용자 조회 (공개용)
export async function getUserById(userId: string): Promise<PublicUser | null> {
  const user = await getUserByIdInternal(userId);
  return user ? toPublicUser(user) : null;
}

// 이메일로 사용자 조회 (공개용)
export async function getUserByEmail(email: string): Promise<PublicUser | null> {
  const user = await getUserByEmailInternal(email);
  return user ? toPublicUser(user) : null;
}

// 사용자 업데이트
export async function updateUser(userId: string, data: UpdateUserRequest): Promise<PublicUser> {
  const user = await getUserByIdInternal(userId);
  if (!user) {
    const error = new Error("User not found")
    ;(error as any).status = 404;
    throw error;
  }

  // 이메일 변경 시 중복 체크
  if (data.user_email && data.user_email !== user.user_email) {
    const emailExists = await checkEmailExists(data.user_email, userId);
    if (emailExists) {
      const error = new Error("Email already exists")
      ;(error as any).status = 409;
      throw error;
    }
  }

  // 전화번호 변경 시 중복 체크
  if (data.user_phone && data.user_phone !== user.user_phone) {
    const phoneExists = await checkPhoneExists(data.user_phone, userId);
    if (phoneExists) {
      const error = new Error("Phone number already exists")
      ;(error as any).status = 409;
      throw error;
    }
  }

  const updateData: Partial<User> = {
    ...data,
    updatedAt: FieldValue.serverTimestamp() as any,
  };

  // 이메일은 소문자로 변환
  if (data.user_email) {
    updateData.user_email = data.user_email.toLowerCase();
  }

  await db.collection(COL).doc(userId).update(updateData);

  // 업데이트된 데이터 반환
  const updatedUser = await getUserByIdInternal(userId);
  return updatedUser ? toPublicUser(updatedUser) : user;
}

// 사용자 삭제
export async function deleteUser(userId: string): Promise<void> {
  const user = await getUserByIdInternal(userId);
  if (!user) {
    const error = new Error("User not found")
    ;(error as any).status = 404;
    throw error;
  }

  await db.collection(COL).doc(userId).delete();
}

// 모든 사용자 조회
export async function getAllUsers(): Promise<PublicUser[]> {
  const snapshot = await db.collection(COL).get();
  return snapshot.docs.map((doc) => toPublicUser(doc.data() as User));
}

// 필터로 사용자 조회
export async function getUsersByFilter(filter: UserFilter): Promise<PublicUser[]> {
  let query: any = db.collection(COL);

  if (filter.user_status) {
    query = query.where("user_status", "==", filter.user_status);
  }

  if (filter.user_email) {
    query = query.where("user_email", "==", filter.user_email.toLowerCase());
  }

  if (filter.user_phone) {
    query = query.where("user_phone", "==", filter.user_phone);
  }

  const snapshot = await query.get();
  let users = snapshot.docs.map((doc: any) => toPublicUser(doc.data() as User));

  // 이름으로 부분 검색 (Firestore에서 직접 지원하지 않으므로 클라이언트에서 필터링)
  if (filter.user_name) {
    users = users.filter((user: PublicUser) =>
      user.user_name.toLowerCase().includes(filter.user_name!.toLowerCase())
    );
  }

  return users;
}

// 이메일 사용 가능 여부 확인
export async function checkEmailAvailability(email: string, excludeUserId?: string): Promise<boolean> {
  return !(await checkEmailExists(email, excludeUserId));
}

// 전화번호 사용 가능 여부 확인
export async function checkPhoneAvailability(phone: string, excludeUserId?: string): Promise<boolean> {
  return !(await checkPhoneExists(phone, excludeUserId));
}
