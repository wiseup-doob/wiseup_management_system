import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import routes from './routes/routerConfig'
import { AppProvider } from './contexts/AppContext'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// 라우터 생성
const router = createBrowserRouter(routes)

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </DndProvider>
  )
}

export default App
