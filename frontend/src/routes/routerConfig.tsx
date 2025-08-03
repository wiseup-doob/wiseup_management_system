import type { RouteObject } from "react-router-dom"
import { ROUTES } from "./paths"
import Layout from "../Layout/Layout"
import HomePage from "../pages/homePage"
import AttendancePage from "../pages/AttendancePage"
import TimetablePage from "../pages/TimetablePage"
import StudentsPage from "../pages/StudentsPage"
import LearningPage from "../pages/LearningPage"
import GradesPage from "../pages/GradesPage"
import ImageButtonExample from "../pages/ImageButtonExample"

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: ROUTES.ATTENDANCE,
        element: <AttendancePage />
      },
      {
        path: ROUTES.TIMETABLE,
        element: <TimetablePage />
      },
      {
        path: ROUTES.STUDENTS,
        element: <StudentsPage />
      },
      {
        path: ROUTES.LEARNING,
        element: <LearningPage />
      },
      {
        path: ROUTES.GRADES,
        element: <GradesPage />
      },
      {
        path: ROUTES.IMAGE_BUTTON_EXAMPLE,
        element: <ImageButtonExample />
      }
    ]
  }
]

export default routes