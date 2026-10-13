import { HandleSSOCallback } from '@clerk/react'
import { useNavigate } from 'react-router-dom'

export default function SSOCallbackPage() {
  const navigate = useNavigate()

  return (
    <main className="ragify-auth-page">
      <HandleSSOCallback
        navigateToApp={({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(
              'Pending Clerk task:',
              session.currentTask,
            )
            return
          }

          const url = decorateUrl('/dashboard')

          if (url.startsWith('http')) {
            window.location.href = url
          } else {
            navigate(url, { replace: true })
          }
        }}
        navigateToSignIn={() =>
          navigate('/sign-in', { replace: true })
        }
        navigateToSignUp={() =>
          navigate('/sign-up', { replace: true })
        }
      />
    </main>
  )
}