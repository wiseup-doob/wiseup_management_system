import type { RouteObject } from "react-router-dom"
import { ROUTES } from "./paths"
import HomePage from "../pages/homePage"
import Greeting from "../pages/Greeting"
import StudentTest from "../pages/studentTest"
import AuthTest from "../pages/AuthTest"
import UsersTest from "../pages/UsersTest"
import StudentsTest from "../pages/StudentsTest"

const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <HomePage />
  },
  {
    path: ROUTES.GREETING,
    element: <Greeting />
  },
  {
    path: ROUTES.STUDENTTEST,
    element: <StudentTest />
  },
  {
    path: ROUTES.AUTH_TEST,
    element: <AuthTest />
  },
  {
    path: ROUTES.USERS_TEST,
    element: <UsersTest />
  },
  {
    path: ROUTES.STUDENTS_TEST,
    element: <StudentsTest />
  }
]

export default routes