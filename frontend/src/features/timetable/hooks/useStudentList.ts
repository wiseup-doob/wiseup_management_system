import { useCallback, useState } from 'react'
import { getStudents, type StudentLite } from '../../../services/studentsService'

export function useStudentList() {
  const [students, setStudents] = useState<StudentLite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const load = useCallback(async (opts?: { reset?: boolean; q?: string }) => {
    try {
      setLoading(true)
      setError(null)
      const nextPage = opts?.reset ? 1 : page
      const query = opts?.q !== undefined ? opts.q : q
      const res = await getStudents({ page: nextPage, limit: 50, q: query })
      if (res.success && res.data) {
        setStudents(prev => (opts?.reset ? res.data! : [...prev, ...res.data!]))
        setPage(p => (opts?.reset ? 2 : p + 1))
      } else {
        setError(res.error || '학생 목록을 불러오지 못했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [page, q])

  const search = useCallback(async (keyword: string) => {
    setQ(keyword)
    await load({ reset: true, q: keyword })
  }, [load])

  const loadMore = useCallback(async () => {
    await load()
  }, [load])

  return { students, loading, error, load, loadMore, search }
}


