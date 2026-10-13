import { useEffect, useState } from 'react'
import { getHealth } from '../../lib/api-client'

type ConnectionStatus = 'checking' | 'connected' | 'unavailable'

const labels: Record<ConnectionStatus, string> = {
  checking: 'Checking backend connection…',
  connected: 'Backend connected',
  unavailable: 'Backend unavailable',
}

export default function BackendStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('checking')

  useEffect(() => {
    const controller = new AbortController()

    getHealth(controller.signal)
      .then(() => setStatus('connected'))
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setStatus('unavailable')
      })

    return () => controller.abort()
  }, [])

  return (
    <div className={`backend-status is-${status}`} role="status" aria-live="polite">
      <span className="backend-status-dot" aria-hidden="true" />
      <span>{labels[status]}</span>
    </div>
  )
}
