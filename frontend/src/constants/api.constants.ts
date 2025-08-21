export const API_ENDPOINTS = {
  ATTENDANCE: '/api/attendance',
  STUDENTS: '/api/students',
  SEATS: {
    GET_ALL: '/api/seats',
    GET_BY_ID: (seatId: string) => `/api/seats/${seatId}`,
    GET_BY_STUDENT: (studentId: string) => `/api/seats/student/${studentId}`,
    GET_STATS: '/api/seats/stats',
    ASSIGN_STUDENT: '/api/seats/assign',
    UNASSIGN_STUDENT: '/api/seats/unassign',
    UPDATE_STATUS: '/api/seats/status',
    INITIALIZE: '/api/seats/initialize'
  },
  ASSIGNMENTS: {
    GET_ALL: '/api/assignments/all',
    GET_BY_SEAT: (seatId: string) => `/api/assignments/seat/${seatId}`,
    GET_BY_STUDENT: (studentId: string) => `/api/assignments/student/${studentId}`,
    ASSIGN: '/api/assignments/assign',
    UNASSIGN: '/api/assignments/unassign',
    SWAP: '/api/assignments/swap'
  },
  REPORTS: '/api/reports',
  USERS: '/api/users',
  AUTH: '/api/auth'
} as const

export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const

export const API_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

export const API_TIMEOUT = {
  DEFAULT: 10000,
  UPLOAD: 30000,
  DOWNLOAD: 60000
} as const

export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept'
} as const 