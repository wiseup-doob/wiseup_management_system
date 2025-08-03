import './MainContent.css'

interface MainContentProps {
  children: React.ReactNode
  className?: string
}

function MainContent({ children, className = '' }: MainContentProps) {
  return (
    <div className={`main-content ${className}`}>
      {children}
    </div>
  )
}

export default MainContent 