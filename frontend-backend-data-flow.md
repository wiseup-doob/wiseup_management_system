# 프론트엔드-백엔드 데이터 흐름 과정

## 📋 개요

이 문서는 WiseUp 관리 시스템에서 프론트엔드(React)와 백엔드(Firebase Functions) 간의 데이터가 어떻게 주고받아지는지 설명합니다.

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐    HTTP/HTTPS    ┌──────────────────┐    Firestore    ┌─────────────────┐
│   Frontend      │ ◄──────────────► │  Firebase        │ ◄──────────────► │   Firestore     │
│   (React)       │   REST API       │  Functions       │   Database      │   Database      │
│                 │                  │  (Node.js)       │                  │                 │
└─────────────────┘                  └──────────────────┘                  └─────────────────┘
```

## 🔄 데이터 흐름 개요

### 1. 프론트엔드 → 백엔드 (요청)
```
React Component → API Service → HTTP Request → Firebase Functions → Firestore
```

### 2. 백엔드 → 프론트엔드 (응답)
```
Firestore → Firebase Functions → HTTP Response → API Service → React Component
```

## 📤 프론트엔드에서 백엔드로 데이터 전송 과정

### 1단계: React Component에서 사용자 액션
```typescript
// 예: 출석 상태 변경
const handleAttendanceChange = (status: AttendanceStatus) => {
  const updateData = {
    studentId: student.id,
    status: status,
    date: new Date().toISOString(),
    updatedBy: currentUser.id
  }
  
  // API 호출
  updateAttendance(updateData)
}
```

### 2단계: API Service에서 HTTP 요청 생성
```typescript
// frontend/src/services/api.ts
export const updateAttendance = async (data: AttendanceUpdateRequest) => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('출석 업데이트 실패')
    }
    
    return await response.json()
  } catch (error) {
    console.error('API 호출 오류:', error)
    throw error
  }
}
```

### 3단계: HTTP 요청 전송
- **URL**: `https://your-project.cloudfunctions.net/api/attendance/:id`
- **Method**: PUT
- **Headers**: Content-Type, Authorization
- **Body**: JSON 형태의 데이터

### 4단계: Firebase Functions에서 요청 수신
```typescript
// functions/src/routes/attendance.ts
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    // 컨트롤러로 요청 전달
    const result = await attendanceController.updateAttendance(id, updateData)
    
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### 5단계: Controller에서 비즈니스 로직 처리
```typescript
// functions/src/controllers/AttendanceController.ts
export const updateAttendance = async (id: string, data: UpdateAttendanceRecordRequest) => {
  try {
    // 입력 데이터 검증
    if (!data.status) {
      throw new Error('출석 상태는 필수입니다')
    }
    
    // 서비스 레이어 호출
    const result = await attendanceService.updateAttendanceRecord(id, data)
    
    return result
  } catch (error) {
    throw error
  }
}
```

### 6단계: Service에서 데이터베이스 작업
```typescript
// functions/src/services/AttendanceService.ts
export const updateAttendanceRecord = async (id: string, data: UpdateAttendanceRecordRequest) => {
  try {
    // Firestore 문서 업데이트
    const docRef = this.collection.doc(id)
    
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
    
    await docRef.update(updateData)
    
    // 업데이트된 문서 반환
    const updatedDoc = await docRef.get()
    return { id: updatedDoc.id, ...updatedDoc.data() }
  } catch (error) {
    throw error
  }
}
```

### 7단계: Firestore 데이터베이스 업데이트
- 문서 ID로 해당 레코드 찾기
- 새로운 데이터로 문서 업데이트
- `updatedAt` 필드에 서버 타임스탬프 기록

## 📥 백엔드에서 프론트엔드로 데이터 전송 과정

### 1단계: Firestore에서 데이터 조회
```typescript
// functions/src/services/AttendanceService.ts
export const getAttendanceRecordById = async (id: string) => {
  try {
    const doc = await this.collection.doc(id).get()
    
    if (!doc.exists) {
      throw new Error('출석 기록을 찾을 수 없습니다')
    }
    
    return { id: doc.id, ...doc.data() }
  } catch (error) {
    throw error
  }
}
```

### 2단계: Service에서 Controller로 데이터 전달
```typescript
// functions/src/controllers/AttendanceController.ts
export const getAttendanceById = async (id: string) => {
  try {
    const result = await attendanceService.getAttendanceRecordById(id)
    return result
  } catch (error) {
    throw error
  }
}
```

### 3단계: Controller에서 HTTP 응답 생성
```typescript
// functions/src/routes/attendance.ts
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await attendanceController.getAttendanceById(id)
    
    res.json(result)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})
```

### 4단계: HTTP 응답 전송
- **Status**: 200 OK (성공) 또는 404 Not Found (실패)
- **Headers**: Content-Type: application/json
- **Body**: JSON 형태의 데이터

### 5단계: 프론트엔드에서 응답 수신
```typescript
// frontend/src/services/api.ts
export const getAttendanceById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
    
    if (!response.ok) {
      throw new Error('출석 기록 조회 실패')
    }
    
    return await response.json()
  } catch (error) {
    console.error('API 호출 오류:', error)
    throw error
  }
}
```

### 6단계: React Component에서 데이터 사용
```typescript
// React Component
const [attendanceData, setAttendanceData] = useState<AttendanceRecord | null>(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await getAttendanceById(attendanceId)
      setAttendanceData(data)
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
    }
  }
  
  fetchData()
}, [attendanceId])

// 데이터 렌더링
if (attendanceData) {
  return (
    <div>
      <p>출석 상태: {attendanceData.status}</p>
      <p>날짜: {attendanceData.date}</p>
    </div>
  )
}
```

## 🔐 인증 및 보안

### 1. 토큰 기반 인증
```typescript
// 프론트엔드에서 토큰 포함하여 요청
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`
  }
})
```

### 2. 백엔드에서 토큰 검증
```typescript
// Firebase Functions에서 토큰 검증
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1]
    
    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다' })
    }
    
    // Firebase Admin SDK로 토큰 검증
    const decodedToken = await admin.auth().verifyIdToken(token)
    req.user = decodedToken
    next()
  } catch (error) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다' })
  }
}
```

## 📊 데이터 타입 및 변환

### 1. 공유 타입 정의
```typescript
// shared/types/attendance.types.ts
export interface AttendanceRecord {
  id: string
  studentId: string
  date: FirestoreTimestamp
  status: AttendanceStatus
  timestamp: FirestoreTimestamp
  // ... 기타 필드들
}
```

### 2. 타입 변환
```typescript
// Firestore Timestamp를 JavaScript Date로 변환
const convertFirestoreTimestamp = (timestamp: FirestoreTimestamp) => {
  if (timestamp instanceof admin.firestore.Timestamp) {
    return timestamp.toDate()
  }
  return timestamp
}

// 프론트엔드에서 사용할 데이터로 변환
const transformForFrontend = (data: any) => {
  return {
    ...data,
    date: convertFirestoreTimestamp(data.date),
    timestamp: convertFirestoreTimestamp(data.timestamp)
  }
}
```

## 🚀 성능 최적화

### 1. 데이터 캐싱
```typescript
// React Query를 사용한 데이터 캐싱
const { data, isLoading } = useQuery({
  queryKey: ['attendance', id],
  queryFn: () => getAttendanceById(id),
  staleTime: 5 * 60 * 1000, // 5분
  cacheTime: 10 * 60 * 1000  // 10분
})
```

### 2. 배치 요청
```typescript
// 여러 출석 기록을 한 번에 업데이트
export const updateAttendanceBulk = async (records: AttendanceUpdateRequest[]) => {
  const batch = admin.firestore().batch()
  
  records.forEach(record => {
    const docRef = this.collection.doc(record.id)
    batch.update(docRef, record)
  })
  
  await batch.commit()
}
```

## 🐛 에러 처리

### 1. 프론트엔드 에러 처리
```typescript
try {
  const result = await apiCall()
  // 성공 처리
} catch (error) {
  if (error.response?.status === 404) {
    // 404 에러 처리
    showNotFoundMessage()
  } else if (error.response?.status === 500) {
    // 서버 에러 처리
    showServerErrorMessage()
  } else {
    // 기타 에러 처리
    showGenericErrorMessage()
  }
}
```

### 2. 백엔드 에러 처리
```typescript
// Controller에서 에러 처리
export const createAttendance = async (data: CreateAttendanceRecordRequest) => {
  try {
    // 비즈니스 로직
    const result = await service.createAttendance(data)
    return result
  } catch (error) {
    // 에러 로깅
    console.error('출석 기록 생성 실패:', error)
    
    // 클라이언트에게 적절한 에러 메시지 전달
    if (error.code === 'PERMISSION_DENIED') {
      throw new Error('권한이 없습니다')
    } else if (error.code === 'ALREADY_EXISTS') {
      throw new Error('이미 존재하는 출석 기록입니다')
    } else {
      throw new Error('출석 기록 생성에 실패했습니다')
    }
  }
}
```

## 📈 모니터링 및 로깅

### 1. 백엔드 로깅
```typescript
// Firebase Functions에서 요청/응답 로깅
export const attendanceFunction = functions.https.onRequest((req, res) => {
  const startTime = Date.now()
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    body: req.body
  })
  
  // 요청 처리 후 응답 로깅
  res.on('finish', () => {
    const duration = Date.now() - startTime
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`)
  })
})
```

### 2. 프론트엔드 로깅
```typescript
// API 호출 성공/실패 로깅
const logApiCall = (endpoint: string, success: boolean, duration: number, error?: any) => {
  console.log(`API Call: ${endpoint}`, {
    success,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    error: error?.message
  })
}
```

## 🔄 실시간 데이터 동기화

### 1. Firestore 실시간 리스너
```typescript
// 프론트엔드에서 실시간 데이터 구독
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'attendance', attendanceId),
    (doc) => {
      if (doc.exists()) {
        setAttendanceData({ id: doc.id, ...doc.data() })
      }
    },
    (error) => {
      console.error('실시간 데이터 구독 오류:', error)
    }
  )
  
  return () => unsubscribe()
}, [attendanceId])
```

### 2. 백엔드에서 실시간 업데이트 트리거
```typescript
// Firestore 트리거로 실시간 업데이트
export const onAttendanceUpdate = functions.firestore
  .document('attendance/{attendanceId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data()
    const previousData = change.before.data()
    
    // 관련 데이터 업데이트 (예: 학생 요약 정보)
    if (newData.status !== previousData.status) {
      await updateStudentSummary(newData.studentId)
    }
  })
```

## 📝 결론

WiseUp 관리 시스템의 데이터 흐름은 다음과 같은 특징을 가집니다:

1. **계층화된 아키텍처**: React → API Service → Firebase Functions → Firestore
2. **타입 안전성**: TypeScript와 공유 타입 정의로 데이터 일관성 보장
3. **에러 처리**: 각 계층에서 적절한 에러 처리 및 사용자 피드백
4. **성능 최적화**: 캐싱, 배치 처리, 실시간 동기화로 사용자 경험 향상
5. **보안**: 토큰 기반 인증으로 API 엔드포인트 보호

이러한 구조를 통해 안정적이고 확장 가능한 데이터 흐름을 구현하고 있습니다.
