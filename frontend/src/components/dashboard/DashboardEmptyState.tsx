import { Link } from 'react-router-dom'
import EmptyState from '../shared/EmptyState'

export default function DashboardEmptyState({ kind }: { kind: 'projects' | 'evaluations' }) {
  return kind === 'projects'
    ? <EmptyState title="Browse your projects." description="Your real projects are available on the Projects page. A recent-projects feed is not available yet." action={<Link className="text-link" to="/projects">Go to Projects →</Link>} />
    : <EmptyState title="No evaluations to display." description="Evaluation history is not available from the backend yet." action={<Link className="text-link" to="/evaluations">About evaluation history →</Link>} />
}
