import { API_CONFIG } from '../config/api.config'
import { API_ENDPOINTS } from '@shared/constants'
import type { ApiResponse } from '@shared/types'

export interface StudentLite {
  id: string
  name: string
  status?: string
  grade?: string
}

async function request<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${url}`)
  const data = await res.json()
  return data
}

export async function getStudents(params?: { page?: number; limit?: number; q?: string }) {
  const base = API_ENDPOINTS.STUDENTS.GET_ALL
  const qs = new URLSearchParams()
  if (params?.page) qs.append('page', String(params.page))
  if (params?.limit) qs.append('limit', String(params.limit))
  if (params?.q) qs.append('q', params.q)
  const url = qs.toString() ? `${base}?${qs.toString()}` : base
  return request<StudentLite[]>(url)
}


