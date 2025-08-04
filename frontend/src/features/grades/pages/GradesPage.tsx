import './GradesPage.css'
import { BaseWidget } from '../../../components/base/BaseWidget'
import { Label } from '../../../components/labels/Label'

function GradesPage() {
  return (
    <BaseWidget className="grades-page">
      <Label 
        variant="heading" 
        size="large" 
        className="page-title"
      >
        성적 분석 시스템
      </Label>
      
      <BaseWidget className="development-notice">
        <BaseWidget className="notice-content">
          <Label 
            variant="heading" 
            size="large" 
            className="notice-title"
          >
            🚧 개발 중입니다
          </Label>
          <Label 
            variant="default" 
            size="medium" 
            className="notice-description"
          >
            성적 분석 시스템이 현재 개발 중입니다.<br />
            곧 더 나은 서비스로 찾아뵙겠습니다.
          </Label>
          <BaseWidget className="progress-indicator">
            <BaseWidget className="progress-bar">
              <BaseWidget className="progress-fill"></BaseWidget>
            </BaseWidget>
            <Label 
              variant="default" 
              size="small" 
              className="progress-text"
            >
              개발 진행률: 45%
            </Label>
          </BaseWidget>
        </BaseWidget>
      </BaseWidget>
    </BaseWidget>
  )
}

export default GradesPage 