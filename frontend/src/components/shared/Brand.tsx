import { useAuth } from '@clerk/react'
import { Link } from 'react-router-dom'
import logo from '../../assets/ragify-logo.png'

export default function Brand() {
  const { isSignedIn } = useAuth()

  return (
    <Link className="brand" to={isSignedIn ? '/dashboard' : '/'} aria-label={isSignedIn ? 'Open dashboard' : 'Ragify home'}>
      <img src={logo} width="60" height="40" alt="" />
      <span>Ragify<span className="brand-period">.</span></span>
    </Link>
  )
}
