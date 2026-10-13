import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { resetProductTour } from '../../components/tour/product-tour-state'
import PageHeader from '../../components/shared/PageHeader'
import { useTheme } from '../../lib/theme'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [status, setStatus] = useState('')

  function resetOnboarding() {
    resetProductTour()
    setStatus('The product tour has restarted from step 1.')
  }

  return (
    <>
      <PageHeader title="Settings" description="Make the workspace comfortable for the way you work." />
      <section className="panel settings-panel">
        <div className="panel-heading"><h2>Appearance</h2></div>
        <div className="settings-body">
          <div><h3>Theme preference</h3><p>Light is the default on your first visit. Your selection is saved in this browser.</p></div>
          <fieldset className="theme-options"><legend className="sr-only">Choose your theme</legend>
            <label className={theme === 'light' ? 'is-selected' : ''}><input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} /><Sun size={20} aria-hidden="true" /><span>Light</span></label>
            <label className={theme === 'dark' ? 'is-selected' : ''}><input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} /><Moon size={20} aria-hidden="true" /><span>Dark</span></label>
          </fieldset>
          <p className="small-note" role="status">Current theme: {theme === 'light' ? 'Light' : 'Dark'}</p>
          <div className="settings-actions">
            <button type="button" className="button button-secondary" onClick={resetOnboarding}>Restart product tour</button>
            {status ? <p className="small-note" role="status">{status}</p> : null}
          </div>
        </div>
      </section>
      <p className="settings-footnote">Theme preferences are saved only in this browser. Server settings are not available yet.</p>
    </>
  )
}
