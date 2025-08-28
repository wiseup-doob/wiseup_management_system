import Layout from '../Layout/Layout'
import HomePage from '../features/home/pages/HomePage'
import AttendancePage from '../features/attendance/pages/AttendancePage'
import StudentsPage from '../features/students/pages/StudentsPage'
import ClassPage from '../features/class/pages/ClassPage'
import AddClassPage from '../features/class/pages/AddClassPage'
import SchedulePage from '../features/schedule/pages/SchedulePage'


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
        path: 'class',
        element: <ClassPage />
      },
      {
        path: 'class/add',
        element: <AddClassPage isOpen={true} onClose={() => {}} />
      },
      {
        path: 'schedule',
        element: <SchedulePage />
      }
    ]
  },

]

export default routes