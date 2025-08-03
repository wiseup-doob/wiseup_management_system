import React, { useState } from 'react'
import ImageButton from '../components/Button/ImageButton'
import './ImageButtonExample.css'

const ImageButtonExample: React.FC = () => {
  const [clickCount, setClickCount] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string>('')

  const handleImageClick = (imageName: string) => {
    setClickCount(prev => prev + 1)
    setSelectedImage(imageName)
    console.log(`Clicked on ${imageName}`)
  }

  return (
    <div className="image-button-example">
      <h1>이미지 버튼 예시</h1>
      
      <section className="example-section">
        <h2>ImageButton 컴포넌트 사용</h2>
        <div className="button-grid">
          <ImageButton
            src="/img/Sidebar_button_logo.png"
            alt="사이드바 로고"
            onClick={() => handleImageClick('사이드바 로고')}
            size="small"
            variant="primary"
          />
          
          <ImageButton
            src="/img/Sidebar_button_logo.png"
            alt="사이드바 로고 (중간 크기)"
            onClick={() => handleImageClick('사이드바 로고 (중간)')}
            size="medium"
            variant="secondary"
          />
          
          <ImageButton
            src="/img/Sidebar_button_logo.png"
            alt="사이드바 로고 (큰 크기)"
            onClick={() => handleImageClick('사이드바 로고 (큰)')}
            size="large"
            variant="ghost"
          />
        </div>
      </section>



      <section className="example-section">
        <h2>기본 HTML img 태그를 버튼으로 사용</h2>
        <div className="button-grid">
          <button 
            className="html-image-button"
            onClick={() => handleImageClick('HTML 이미지 버튼')}
          >
            <img 
              src="/img/Sidebar_button_logo.png" 
              alt="HTML 이미지 버튼"
              width={32}
              height={32}
            />
          </button>
          
          <button 
            className="html-image-button html-image-button--large"
            onClick={() => handleImageClick('큰 HTML 이미지 버튼')}
          >
            <img 
              src="/img/Sidebar_button_logo.png" 
              alt="큰 HTML 이미지 버튼"
              width={48}
              height={48}
            />
          </button>
        </div>
      </section>

      <section className="example-section">
        <h2>결과</h2>
        <div className="result-display">
          <p>클릭 횟수: {clickCount}</p>
          {selectedImage && <p>마지막 클릭한 이미지: {selectedImage}</p>}
        </div>
      </section>
    </div>
  )
}

export default ImageButtonExample 