import Layout from '../Layout/Layout'
import HomePage from '../features/home/pages/HomePage'
import AttendancePage from '../features/attendance/pages/AttendancePage'
import StudentsPage from '../features/students/pages/StudentsPage'
import GradesPage from '../features/grades/pages/GradesPage'
import TimetablePage from '../features/timetable/pages/TimetablePage'
import LearningPage from '../features/learning/pages/LearningPage'

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'attendance',
        element: <AttendancePage />
      },
      {
        path: 'students',
        element: <StudentsPage />
      },
      {
        path: 'grades',
        element: <GradesPage />
      },
      {
        path: 'timetable',
        element: <TimetablePage />
      },
      {
        path: 'learning',
        element: <LearningPage />
      }
    ]
  }
]

export default routes