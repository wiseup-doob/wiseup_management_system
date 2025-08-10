import './HomePage.css'
import { BaseWidget } from '../../../components/base/BaseWidget'
import { Button } from '../../../components/buttons/Button'
import { Grid } from '../../../components/Layout/Grid'
import { Label } from '../../../components/labels/Label'
import type { BaseWidgetProps } from '../../../types/components'

function HomePage() {
  const quickActions = [
    {
      title: '출결 관리',
      description: '학생들의 출결 상황을 확인하고 관리합니다.',
      path: '/attendance'
    },
    {
      title: '학생 관리',
      description: '학생 정보를 등록하고 관리합니다.',
      path: '/students'
    },
    {
      title: '성적 관리',
      description: '학생들의 성적을 입력하고 관리합니다.',
      path: '/grades'
    }
  ]

  return (
    <BaseWidget className="home-page">
      <Label 
        variant="heading" 
        size="large" 
        className="page-title"
      >
        WiseUp 관리 시스템
      </Label>
      
      <BaseWidget className="welcome-section">
        <Label 
          variant="heading" 
          size="medium" 
          className="welcome-title"
        >
          환영합니다!
        </Label>
        <Label 
          variant="default" 
          size="medium" 
          className="welcome-description"
        >
          학생 관리, 출결 관리, 성적 관리 등 모든 기능을 한 곳에서 관리하세요.
        </Label>
      </BaseWidget>
      
      <BaseWidget className="quick-actions">
        <Label 
          variant="heading" 
          size="medium" 
          className="section-title"
        >
          빠른 액션
        </Label>
        
        <Grid 
          columns={3} 
          rows={1} 
          gap={20} 
          className="action-grid"
        >
          {quickActions.map((action, index) => (
            <BaseWidget key={index} className="action-card">
              <Label 
                variant="heading" 
                size="medium" 
                className="action-title"
              >
                {action.title}
              </Label>
              <Label 
                variant="default" 
                size="small" 
                className="action-description"
              >
                {action.description}
              </Label>
              <Button 
                variant="primary" 
                size="small" 
                className="action-button"
                onClick={() => console.log(`Navigate to ${action.path}`)}
              >
                바로가기
              </Button>
            </BaseWidget>
          ))}
        </Grid>
      </BaseWidget>
    </BaseWidget>
  )
}

export default HomePage 