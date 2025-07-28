import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../routes/paths'

function Greeting() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>Greeting Page</h1>
      <button onClick={() => navigate(ROUTES.HOME)}>
        홈으로 이동
      </button>
    </div>
  )
}

export default Greeting;