import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { ProjectView, ResourceState } from '../../lib/view-models'
import EmptyState from '../shared/EmptyState'
import LoadingState from '../shared/LoadingState'
import ErrorState from '../shared/ErrorState'

type ProjectListProps = { state: ResourceState<ProjectView[]>; onNew: () => void; onRetry?: () => void }

export default function ProjectList({ state, onNew, onRetry }: ProjectListProps) {
  if (state.status === 'loading') return <LoadingState label="Loading projects…" />
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={onRetry} />
  if (state.status === 'empty' || state.data.length === 0) {
    return <EmptyState title="No projects yet." description="Create your first project to upload documents and run an evaluation." action={<button className="button button-secondary" onClick={onNew}>New Project</button>} />
  }
  return (
    <ul className="project-list">
      {state.data.map(project => <li key={project.id}><Link to={`/projects/${project.id}`}><div><h3>{project.name}</h3></div><span>Status: {project.status}</span><ArrowUpRight size={18} aria-hidden="true" /></Link></li>)}
    </ul>
  )
}
