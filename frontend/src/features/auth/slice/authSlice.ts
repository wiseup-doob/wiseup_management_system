import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, User, LoginCredentials, AuthResponse } from '../types/auth.types'
import { authService } from '../services/authService'

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  lastLoginAt: null
}

// 비동기 액션들
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '로그인에 실패했습니다.')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return null
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '로그아웃에 실패했습니다.')
    }
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken()
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '토큰 갱신에 실패했습니다.')
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser()
      return user
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '사용자 정보 조회에 실패했습니다.')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 로딩 상태 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    // 에러 설정
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    // 사용자 정보 업데이트
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    
    // 토큰 설정
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      state.isAuthenticated = true
      localStorage.setItem('token', action.payload)
    },
    
    // 인증 상태 초기화
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
      state.lastLoginAt = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    },
    
    // 마지막 로그인 시간 설정
    setLastLoginAt: (state, action: PayloadAction<Date>) => {
      state.lastLoginAt = action.payload
    }
  },
  extraReducers: (builder) => {
    // 로그인 처리
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.lastLoginAt = new Date()
        state.error = null
        
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // 로그아웃 처리
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = null
        state.lastLoginAt = null
        
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // 토큰 갱신 처리
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.error = null
        
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // 토큰 갱신 실패 시 로그아웃 처리
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      })
    
    // 현재 사용자 정보 조회
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // 사용자 정보 조회 실패 시 로그아웃 처리
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      })
  }
})

export const {
  setLoading,
  setError,
  updateUser,
  setToken,
  clearAuth,
  setLastLoginAt
} = authSlice.actions

export default authSlice.reducer 