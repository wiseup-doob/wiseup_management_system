import './App.css'
import { useRoutes } from 'react-router-dom'
import routes from './routes/routerConfig'
import Layout from './Layout/Layout'
import { AppProvider } from './contexts/AppContext'

function App() {
  const element = useRoutes(routes)
  
  return (
    <AppProvider>
      <Layout title="WiseUp Management System">
        {element}
      </Layout>
    </AppProvider>
  )
}

export default App
