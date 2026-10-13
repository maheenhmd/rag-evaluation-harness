import { useUser } from '@clerk/react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageHeader from '../shared/PageHeader'

export default function DashboardHeader() {
  const { user } = useUser()
  const firstName = user?.firstName || user?.username || 'there'

  return <PageHeader title={`Welcome back, ${firstName}.`} description="Your documents, evaluations and next decisions, in one place."
    action={<Link className="button button-primary" to="/projects?new=1" data-tour-id="new-project-button"><Plus size={16} aria-hidden="true" />New Project</Link>} />
}
