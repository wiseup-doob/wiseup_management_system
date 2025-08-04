import './LearningPage.css'
import { BaseWidget } from '../../../components/base/BaseWidget'
import { Label } from '../../../components/labels/Label'

function LearningPage() {
  return (
    <BaseWidget className="learning-page">
      <Label 
        variant="heading" 
        size="large" 
        className="page-title"
      >
        학습 관리
      </Label>
      
      <BaseWidget className="development-notice">
        <Label 
          variant="default" 
          size="medium" 
          className="notice-text"
        >
          학습 관리 기능이 개발 중입니다.
        </Label>
      </BaseWidget>
    </BaseWidget>
  )
}

export default LearningPage 