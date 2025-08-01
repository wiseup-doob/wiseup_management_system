import './homePage.css'

function HomePage() {
  return (
    <div className="home-container">
      <h1 className="home-title">
        🏠 홈페이지
      </h1>
      
      <div className="home-content">
        <h2 className="home-subtitle">
          🚧 시스템 준비 중
        </h2>
        <p className="home-description">
          교육 관리 시스템이 현재 개발 중입니다.<br/>
          사이드바의 메뉴를 통해 다양한 기능에 접근할 수 있습니다.
        </p>
      </div>
    </div>
  )
}

export default HomePage
