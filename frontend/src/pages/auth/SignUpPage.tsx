import { type FormEvent, useState } from 'react'
import { useAuth, useSignUp } from '@clerk/react'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from 'lucide-react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import Brand from '../../components/shared/Brand'
import { authDestination } from '../../lib/auth-redirect'
import './auth.css'

type SocialStrategy = 'oauth_google' | 'oauth_github'

function GitHubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.045.138 3.003.404 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.9A6.02 6.02 0 0 1 6.07 12c0-.66.11-1.3.32-1.9V7.51H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.49l3.35-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.97c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.59C7.18 7.73 9.39 5.97 12 5.97Z"
      />
    </svg>
  )
}

function errorMessage(error: unknown) {
  const value = error as {
    longMessage?: string
    message?: string
  }

  return (
    value?.longMessage ||
    value?.message ||
    'Something went wrong. Please try again.'
  )
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { isSignedIn } = useAuth()
  const { signUp, fetchStatus } = useSignUp()

  const destination = authDestination(location.state)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [verificationCode, setVerificationCode] =
    useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [verificationSent, setVerificationSent] =
    useState(false)

  const [error, setError] = useState('')

  const [socialLoading, setSocialLoading] =
    useState<SocialStrategy | null>(null)

  const loading =
    fetchStatus === 'fetching' ||
    socialLoading !== null

  if (isSignedIn) {
    return <Navigate to={destination} replace />
  }

  const handleBack = () => {
    if (verificationSent) {
      setVerificationSent(false)
      setVerificationCode('')
      setError('')
      return
    }

    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/')
  }

  const finalizeSignUp = async () => {
    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.log(
            'Pending Clerk task:',
            session.currentTask,
          )
          return
        }

        const url = decorateUrl(destination)

        if (url.startsWith('http')) {
          window.location.href = url
        } else {
          navigate(url, { replace: true })
        }
      },
    })
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const cleanName = name.trim()

    const [firstName, ...remainingName] =
      cleanName.split(/\s+/)

    const lastName = remainingName.join(' ')

    try {
      const { error } = await signUp.password({
        emailAddress: email.trim(),
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      })

      if (error) {
        setError(errorMessage(error))
        return
      }

      if (signUp.status === 'complete') {
        await finalizeSignUp()
        return
      }

      const { error: verificationError } =
        await signUp.verifications.sendEmailCode()

      if (verificationError) {
        setError(errorMessage(verificationError))
        return
      }

      setVerificationSent(true)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const handleVerification = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')

    try {
      const { error } =
        await signUp.verifications.verifyEmailCode({
          code: verificationCode.trim(),
        })

      if (error) {
        setError(errorMessage(error))
        return
      }

      if (signUp.status === 'complete') {
        await finalizeSignUp()
        return
      }

      setError(
        'Email was verified, but account creation is not complete.',
      )
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const resendCode = async () => {
    setError('')

    try {
      const { error } =
        await signUp.verifications.sendEmailCode()

      if (error) {
        setError(errorMessage(error))
      }
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const handleSocialSignUp = async (
    strategy: SocialStrategy,
  ) => {
    setError('')
    setSocialLoading(strategy)

    try {
      const { error } = await signUp.sso({
        strategy,
        redirectCallbackUrl: '/sso-callback',
        redirectUrl: destination,
      })

      if (error) {
        setError(errorMessage(error))
        setSocialLoading(null)
      }
    } catch (err) {
      setError(errorMessage(err))
      setSocialLoading(null)
    }
  }

  return (
    <main className="ragify-auth-page">
      <button
        type="button"
        className="ragify-auth-back"
        onClick={handleBack}
      >
        <ArrowLeft size={17} />
        <span>Back</span>
      </button>

      <section
        className="ragify-auth-card"
        aria-labelledby="signup-heading"
      >
        <div className="ragify-auth-brand">
          <Brand />
        </div>

        {verificationSent ? (
          <>
            <div className="ragify-auth-heading">
              <h1 id="signup-heading">
                Verify your email
              </h1>

              <p>
                We sent a verification code to {email}
              </p>
            </div>

            <form
              className="ragify-auth-form"
              onSubmit={handleVerification}
            >
              <div className="ragify-auth-field">
                <label htmlFor="verification-code">
                  Verification code
                </label>

                <div className="ragify-auth-input-wrap">
                  <Mail
                    size={17}
                    aria-hidden="true"
                  />

                  <input
                    id="verification-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(event) =>
                      setVerificationCode(
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>
              </div>

              {error && (
                <p
                  className="ragify-auth-error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="ragify-auth-submit"
                disabled={loading}
              >
                {fetchStatus === 'fetching'
                  ? 'Verifying…'
                  : 'Verify email'}
              </button>
            </form>

            <button
              type="button"
              className="ragify-auth-resend"
              onClick={resendCode}
              disabled={loading}
            >
              Didn&apos;t receive a code? Send again
            </button>
          </>
        ) : (
          <>
            <div className="ragify-auth-heading">
              <h1 id="signup-heading">
                Create your account
              </h1>

              <p>
                Start using Ragify with your own account
              </p>
            </div>

            <form
              className="ragify-auth-form"
              onSubmit={handleSubmit}
            >
              <div className="ragify-auth-field">
                <label htmlFor="signup-name">
                  Name
                </label>

                <div className="ragify-auth-input-wrap">
                  <User
                    size={17}
                    aria-hidden="true"
                  />

                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="ragify-auth-field">
                <label htmlFor="signup-email">
                  Email address
                </label>

                <div className="ragify-auth-input-wrap">
                  <Mail
                    size={17}
                    aria-hidden="true"
                  />

                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="ragify-auth-field">
                <label htmlFor="signup-password">
                  Password
                </label>

                <div className="ragify-auth-input-wrap">
                  <LockKeyhole
                    size={17}
                    aria-hidden="true"
                  />

                  <input
                    id="signup-password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    className="ragify-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <div className="ragify-auth-field">
                <label htmlFor="signup-confirm-password">
                  Confirm password
                </label>

                <div className="ragify-auth-input-wrap">
                  <LockKeyhole
                    size={17}
                    aria-hidden="true"
                  />

                  <input
                    id="signup-confirm-password"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    required
                  />

                  <button
                    type="button"
                    className="ragify-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current,
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  className="ragify-auth-error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="ragify-auth-submit"
                disabled={loading}
              >
                {fetchStatus === 'fetching'
                  ? 'Creating account…'
                  : 'Create account'}
              </button>
            </form>

            <div id="clerk-captcha" />

            <div className="ragify-auth-divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <div className="ragify-auth-socials">
              <button
                type="button"
                className="ragify-auth-social"
                disabled={loading}
                onClick={() =>
                  handleSocialSignUp(
                    'oauth_google',
                  )
                }
              >
                <GoogleIcon size={18} />

                {socialLoading === 'oauth_google'
                  ? 'Opening…'
                  : 'Google'}
              </button>

              <button
                type="button"
                className="ragify-auth-social"
                disabled={loading}
                onClick={() =>
                  handleSocialSignUp(
                    'oauth_github',
                  )
                }
              >
                <GitHubIcon size={18} />

                {socialLoading === 'oauth_github'
                  ? 'Opening…'
                  : 'GitHub'}
              </button>
            </div>

            <p className="ragify-auth-switch">
              Already have an account?{' '}
              <Link to="/sign-in">
                Sign in here
              </Link>
            </p>
          </>
        )}

        <p className="ragify-auth-security">
          Secured by Clerk authentication
        </p>
      </section>
    </main>
  )
}