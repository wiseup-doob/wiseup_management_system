import { useState } from 'react'
import api from '../lib/api'

export default function StudentTest() {
  const [students, setStudents] = useState<any[]>([])
  const [newStudent, setNewStudent] = useState({ id: '', name: '', school: '' })

  const fetchAll = async () => {
    const res = await api.get('/students')
    setStudents(res.data)
  }

  const create = async () => {
    await api.post(`/students/${newStudent.id}`, {
      name: newStudent.name,
      school: newStudent.school,
    })
    alert('학생 추가 완료')
    fetchAll()
  }

  const deleteStudent = async (id: string) => {
    await api.delete(`/students/${id}`)
    alert('삭제 완료')
    fetchAll()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>👨‍🎓 Student API 테스트</h1>

      <input
        placeholder="ID"
        value={newStudent.id}
        onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })}
      />
      <input
        placeholder="이름"
        value={newStudent.name}
        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
      />
      <input
        placeholder="학교"
        value={newStudent.school}
        onChange={(e) => setNewStudent({ ...newStudent, school: e.target.value })}
      />
      <button onClick={create}>학생 추가</button>
      <button onClick={fetchAll}>전체 조회</button>

      <ul>
        {students.map((s, i) => (
          <li key={i}>
            {s.name} - {s.school}
            <button onClick={() => deleteStudent(s.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  )
}