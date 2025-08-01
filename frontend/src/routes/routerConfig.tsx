import type { RouteObject } from "react-router-dom"
import { ROUTES } from "./paths"
import HomePage from "../pages/homePage"

const routes: RouteObject[] = [
  // 메인 페이지
  {
    path: ROUTES.HOME,
    element: <HomePage />
  }
]

export default routes