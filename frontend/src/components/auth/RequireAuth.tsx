import { useAuth } from '@clerk/react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingState from '../shared/LoadingState'

export default function RequireAuth() {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()
  if (!isLoaded) return <LoadingState label="Checking your session…" />
  if (!isSignedIn) return <Navigate to="/sign-in" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}
