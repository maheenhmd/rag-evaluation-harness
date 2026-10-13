import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Brand from '../shared/Brand'
import './auth.css'

type AuthFormLayoutProps = {
  children: ReactNode
  title?: string
  description?: string
}

export default function AuthFormLayout({
  children,
  title,
  description,
}: AuthFormLayoutProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <main className="auth-page">
      <button
        type="button"
        className="auth-back-button"
        onClick={handleBack}
      >
        <ArrowLeft size={17} />
        Back
      </button>

      <div className="auth-container">
        <div className="auth-logo">
          <Brand />
        </div>

        {title ? <div className="auth-heading" aria-live="polite"><h1>{title}</h1>{description ? <p>{description}</p> : null}</div> : null}

        {children}
      </div>
    </main>
  )
}