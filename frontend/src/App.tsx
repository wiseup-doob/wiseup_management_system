import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import routes from './routes/routerConfig'
import { AppProvider } from './contexts/AppContext'

// 라우터 생성
const router = createBrowserRouter(routes)

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  )
}

export default App
