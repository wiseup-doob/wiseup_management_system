import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../../config/firebase'
import { User, PublicUser, CreateUserRequest, UpdateUserRequest, UserFilter } from './user.types'
import { randomBytes, pbkdf2Sync } from 'crypto'

const COL = process.env.COL_USERS ?? 'users'

// 비밀번호 해싱 (PBKDF2 사용)
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

// 비밀번호 검증
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':')
  const hashToVerify = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return hash === hashToVerify
}

// 고유 ID 생성 (bigint 형태의 timestamp 기반)
function generateUserId(): string {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
}

// 사용자 데이터에서 password_hash 제거
function toPublicUser(user: User): PublicUser {
  const { password_hash, ...publicUser } = user
  return publicUser
}

// 이메일로 사용자 조회 (내부용 - password_hash 포함, 인증 모듈에서 사용)
export async function getUserByEmailInternal(email: string): Promise<User | null> {
  const query = db.collection(COL).where('email', '==', email.toLowerCase()).limit(1)
  const snapshot = await query.get()
  
  if (snapshot.empty) {
    return null
  }
  
  return snapshot.docs[0].data() as User
}

// ID로 사용자 조회 (내부용 - password_hash 포함, 인증 모듈에서 사용)
export async function getUserByIdInternal(userId: string): Promise<User | null> {
  const doc = await db.collection(COL).doc(userId).get()
  if (!doc.exists) {
    return null
  }
  
  return doc.data() as User
}

// 비밀번호 업데이트 (인증 모듈에서 사용)
export async function updateUserPassword(userId: string, newPasswordHash: string): Promise<void> {
  await db.collection(COL).doc(userId).update({
    password_hash: newPasswordHash,
    updatedAt: FieldValue.serverTimestamp()
  })
}

// 이메일 중복 체크
export async function checkEmailExists(email: string, excludeUserId?: string): Promise<boolean> {
  const query = db.collection(COL).where('email', '==', email.toLowerCase())
  const snapshot = await query.get()
  
  if (excludeUserId) {
    // 업데이트 시 자신의 이메일은 제외
    return snapshot.docs.some(doc => doc.id !== excludeUserId)
  }
  
  return !snapshot.empty
}

// 전화번호 중복 체크
export async function checkPhoneExists(phone: string, excludeUserId?: string): Promise<boolean> {
  const query = db.collection(COL).where('phone', '==', phone)
  const snapshot = await query.get()
  
  if (excludeUserId) {
    // 업데이트 시 자신의 전화번호는 제외
    return snapshot.docs.some(doc => doc.id !== excludeUserId)
  }
  
  return !snapshot.empty
}

// 사용자 생성
export async function createUser(data: CreateUserRequest): Promise<PublicUser> {
  // 이메일 중복 체크
  const emailExists = await checkEmailExists(data.email)
  if (emailExists) {
    const error = new Error('Email already exists')
    ;(error as any).status = 409
    throw error
  }

  // 전화번호 중복 체크
  const phoneExists = await checkPhoneExists(data.phone)
  if (phoneExists) {
    const error = new Error('Phone number already exists')
    ;(error as any).status = 409
    throw error
  }

  const userId = generateUserId()
  const passwordHash = await hashPassword(data.password)

  const user: Omit<User, 'createdAt' | 'updatedAt'> = {
    user_id: userId,
    name: data.name,
    phone: data.phone,
    email: data.email.toLowerCase(),
    password_hash: passwordHash,
    status: data.status || 'active'
  }

  await db.collection(COL).doc(userId).set({
    ...user,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  const createdUser = await getUserById(userId)
  if (!createdUser) {
    throw new Error('Failed to create user')
  }

  return createdUser
}

// ID로 사용자 조회 (공개용)
export async function getUserById(userId: string): Promise<PublicUser | null> {
  const doc = await db.collection(COL).doc(userId).get()
  if (!doc.exists) {
    return null
  }
  
  const userData = doc.data() as User
  return toPublicUser(userData)
}

// 이메일로 사용자 조회 (공개용)
export async function getUserByEmail(email: string): Promise<PublicUser | null> {
  const user = await getUserByEmailInternal(email)
  return user ? toPublicUser(user) : null
}

// 사용자 업데이트 (비밀번호 제외)
export async function updateUser(userId: string, data: UpdateUserRequest): Promise<PublicUser> {
  const existingUser = await db.collection(COL).doc(userId).get()
  if (!existingUser.exists) {
    const error = new Error('User not found')
    ;(error as any).status = 404
    throw error
  }

  const updateData: any = {}

  // 이메일 변경 시 중복 체크
  if (data.email) {
    const emailExists = await checkEmailExists(data.email, userId)
    if (emailExists) {
      const error = new Error('Email already exists')
      ;(error as any).status = 409
      throw error
    }
    updateData.email = data.email.toLowerCase()
  }

  // 전화번호 변경 시 중복 체크
  if (data.phone) {
    const phoneExists = await checkPhoneExists(data.phone, userId)
    if (phoneExists) {
      const error = new Error('Phone number already exists')
      ;(error as any).status = 409
      throw error
    }
    updateData.phone = data.phone
  }

  // 기타 필드들
  if (data.name) updateData.name = data.name
  if (data.status) updateData.status = data.status

  // 업데이트 실행
  await db.collection(COL).doc(userId).update({
    ...updateData,
    updatedAt: FieldValue.serverTimestamp()
  })

  const updatedUser = await getUserById(userId)
  if (!updatedUser) {
    throw new Error('Failed to update user')
  }

  return updatedUser
}

// 사용자 삭제
export async function deleteUser(userId: string): Promise<void> {
  const user = await db.collection(COL).doc(userId).get()
  if (!user.exists) {
    const error = new Error('User not found')
    ;(error as any).status = 404
    throw error
  }

  await db.collection(COL).doc(userId).delete()
}

// 전체 사용자 목록 조회
export async function getAllUsers(): Promise<PublicUser[]> {
  const snapshot = await db.collection(COL).get()
  return snapshot.docs.map(doc => toPublicUser(doc.data() as User))
}

// 필터로 사용자 조회
export async function getUsersByFilter(filter: UserFilter): Promise<PublicUser[]> {
  let query = db.collection(COL) as any

  // 상태 필터
  if (filter.status) {
    query = query.where('status', '==', filter.status)
  }

  // 이메일 필터 (정확히 일치)
  if (filter.email) {
    query = query.where('email', '==', filter.email.toLowerCase())
  }

  // 전화번호 필터 (정확히 일치)
  if (filter.phone) {
    query = query.where('phone', '==', filter.phone)
  }

  const snapshot = await query.get()
  let users = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => toPublicUser(doc.data() as User))

  // 이름 필터 (부분 일치 - Firestore에서 직접 지원하지 않으므로 메모리에서 필터링)
  if (filter.name) {
    const nameQuery = filter.name.toLowerCase()
    users = users.filter((user: PublicUser) => 
      user.name.toLowerCase().includes(nameQuery)
    )
  }

  return users
}
