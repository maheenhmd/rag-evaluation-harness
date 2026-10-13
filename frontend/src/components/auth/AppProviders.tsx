import { ClerkProvider, useAuth } from '@clerk/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/api-client'
import { useTheme } from '../../lib/theme'

function QuerySession({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          refetchOnWindowFocus: false,
          retry: (attempt, error) => attempt < 1 && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
        },
        // Never repeat a write or paid evaluation automatically.
        mutations: { retry: false },
      },
    })
    queryClient.setQueryDefaults(['evaluation-result'], { gcTime: Infinity, staleTime: Infinity })
    return queryClient
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function SessionBoundary({ children }: { children: ReactNode }) {
  const { userId, sessionId } = useAuth()
  // A new identity gets a fresh cache, including in-memory evaluation results.
  return <QuerySession key={`${userId ?? 'signed-out'}:${sessionId ?? ''}`}>{children}</QuerySession>
}

export default function AppProviders({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  if (!key || !/^pk_(test|live)_/.test(key)) {
    return <main className="container section" role="alert"><h1>Account access needs configuration.</h1><p>Set VITE_CLERK_PUBLISHABLE_KEY in the frontend environment and restart Vite.</p></main>
  }
  return (
    <ClerkProvider publishableKey={key} routerPush={to => navigate(to)} routerReplace={to => navigate(to, { replace: true })}
      signInUrl="/sign-in" signUpUrl="/sign-up" signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard" afterSignOutUrl="/"
      appearance={{
        variables: { colorPrimary: theme === 'dark' ? '#8BACF6' : '#2563EB', colorBackground: theme === 'dark' ? '#121820' : '#FFFFFF', colorForeground: theme === 'dark' ? '#F1F3F5' : '#17212F', borderRadius: '6px', fontFamily: 'inherit' },
        elements: { header: { display: 'none' }, rootBox: { width: '100%' }, cardBox: { width: '100%', boxShadow: 'none' }, card: { boxShadow: 'none', padding: '24px 0 0', background: 'transparent' } },
      }}>
      <SessionBoundary>{children}</SessionBoundary>
    </ClerkProvider>
  )
}
