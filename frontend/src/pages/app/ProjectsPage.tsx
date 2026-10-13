import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import ProjectList from '../../components/projects/ProjectList'
import ProjectForm from '../../components/projects/ProjectForm'
import Dialog from '../../components/ui/Dialog'
import { useCreateProject, useProjects } from '../../lib/queries'
import { errorMessage } from '../../lib/api-client'
import type { ProjectView, ResourceState } from '../../lib/view-models'

export default function ProjectsPage() {
  const projects = useProjects()
  const create = useCreateProject()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const creating = params.get('new') === '1'
  function setCreating(open: boolean) {
    if (create.isPending) return
    create.reset()
    const next = new URLSearchParams(params)
    if (open) next.set('new', '1')
    else next.delete('new')
    setParams(next, { replace: true })
  }
  const state: ResourceState<ProjectView[]> = projects.isPending ? { status: 'loading' }
    : projects.isError ? { status: 'error', message: errorMessage(projects.error) }
    : { status: 'ready', data: projects.data }

  return (
    <>
      <PageHeader title="Projects" description="Organize documents and evaluations around the systems you are building."
        action={<button className="button button-primary" onClick={() => setCreating(true)}><Plus size={16} aria-hidden="true" />New Project</button>} />
      <section className="panel" aria-labelledby="projects-heading">
        <div className="panel-heading"><h2 id="projects-heading">Your projects</h2></div>
        <ProjectList state={state} onNew={() => setCreating(true)} onRetry={() => { void projects.refetch() }} />
      </section>
      <Dialog open={creating} busy={create.isPending} onClose={() => setCreating(false)} title="New project" description="Give your project a name to start organizing your documents.">
        {creating && <ProjectForm pending={create.isPending} error={create.isError ? errorMessage(create.error) : undefined} onCancel={() => setCreating(false)} onSubmit={name => create.mutate(name, { onSuccess: project => navigate(`/projects/${project.id}`) })} />}
      </Dialog>
    </>
  )
}
