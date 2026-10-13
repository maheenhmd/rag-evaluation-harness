import { useIsMutating } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../components/shared/PageHeader'
import EmptyState from '../../components/shared/EmptyState'
import ErrorState from '../../components/shared/ErrorState'
import LoadingState from '../../components/shared/LoadingState'
import DocumentUpload from '../../components/projects/DocumentUpload'
import EvaluationControls from '../../components/evaluation/EvaluationControls'
import { ApiError, errorMessage } from '../../lib/api-client'
import { useDocuments, useEvaluationResult, useProject, useProjects, useRunEvaluation, useUploadDocument } from '../../lib/queries'

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const id = Number(projectId)
  if (!projectId || !/^\d+$/.test(projectId) || !Number.isSafeInteger(id) || id < 1) {
    return <><PageHeader title="Project not found" description="Choose a project from your workspace." /><Link className="text-link" to="/projects">All projects →</Link></>
  }
  return <ProjectWorkspace key={id} projectId={id} />
}

function ProjectWorkspace({ projectId }: { projectId: number }) {
  const navigate = useNavigate()
  const project = useProject(projectId, true)
  const projects = useProjects()
  const documents = useDocuments(projectId, project.isSuccess)
  const upload = useUploadDocument(projectId)
  const evaluation = useRunEvaluation(projectId)
  const result = useEvaluationResult(projectId)
  const evaluationPending = useIsMutating({ mutationKey: ['evaluation', projectId] }) > 0
  const uploadPending = useIsMutating({ mutationKey: ['upload', projectId] }) > 0
  const readyDocuments = documents.isSuccess ? documents.data.filter(item => item.status === 'ready') : []
  const hasReadyDocument = readyDocuments.length > 0
  const projectSwitchOptions = projects.data ?? []

  if (project.isPending) return <LoadingState label="Loading project…" />
  if (project.isError) return <><PageHeader title={project.error instanceof ApiError && project.error.status === 404 ? 'Project not found' : 'Project unavailable'} description="Only projects belonging to your account are available here." /><ErrorState message={errorMessage(project.error)} onRetry={() => { void project.refetch() }} /><Link className="text-link" to="/projects">All projects →</Link></>

  return (
    <>
      <div className="project-header-row">
        <Link className="text-link back-link" to="/projects"><ArrowLeft size={15} aria-hidden="true" />All projects</Link>
        {projectSwitchOptions.length > 1 ? (
          <label className="project-switcher-field">
            <span className="mono">PROJECT</span>
            <select className="project-switcher" value={String(projectId)} onChange={event => navigate(`/projects/${event.target.value}`)}>
              {projectSwitchOptions.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        ) : null}
      </div>
      <PageHeader title={project.data.name} description="Documents, evaluation controls and recommendations for this project." />
      <div className="project-context">
        <span className="mono">PROJECT</span>
        <span className="project-id">{project.data.name}</span>
        <span className="mono">DOCUMENTS</span>
        <span className="project-id">{documents.isSuccess ? `${readyDocuments.length} ready · ${documents.data.length} total` : 'Loading…'}</span>
        <p>Status: {project.data.status}</p>
      </div>
      <div className="project-workspace-grid">
        <div className="space-y-6">
          <section className="panel"><div className="panel-heading"><h2>A. Upload a new document</h2><span className="subtle-label">.txt only</span></div>
            <DocumentUpload pending={uploadPending} disabled={evaluationPending} error={upload.isError ? errorMessage(upload.error) : undefined}
              onUpload={async file => { await upload.mutateAsync(file) }} />
          </section>
          <section className="panel" data-tour-id="project-upload-area"><div className="panel-heading"><h2>B. Existing documents in this project</h2><span className="subtle-label">{documents.isSuccess ? `${documents.data.length} total` : 'Loading…'}</span></div>
            {documents.isPending ? <LoadingState label="Loading documents…" /> : documents.isError ? <ErrorState message={errorMessage(documents.error)} onRetry={() => { void documents.refetch() }} />
              : documents.data.length === 0 ? <EmptyState title="No documents yet." description="Upload a .txt file to build this project's corpus." />
                : <>
                    <ul className="document-list">{documents.data.map(document => (
                      <li key={document.id}>
                        <div className="document-item-main">
                          <strong>{document.filename}</strong>
                          <span>Status: {document.status}</span>
                        </div>
                        <div className="document-item-actions">
                          <span className="document-status-badge">{document.status}</span>
                          <button type="button" className="button button-danger document-delete-button" disabled title="Document deletion is unavailable because this backend does not expose a DELETE endpoint for project documents.">Delete unavailable</button>
                        </div>
                      </li>
                    ))}</ul>
                    <p className="document-delete-note">Document deletion is not available yet because the backend does not expose a DELETE endpoint for project documents.</p>
                  </>}
          </section>
        </div>
        <div className="space-y-6">
          <section className="panel"><div className="panel-heading"><h2>Run Evaluation</h2></div>
            <div className="evaluation-context-summary" data-tour-id="run-evaluation-button">
              <div>
                <span className="mono">PROJECT</span>
                <strong>{project.data.name}</strong>
              </div>
              <div>
                <span className="mono">DOCUMENTS</span>
                <strong>{documents.isSuccess ? `${readyDocuments.length} ready` : 'Loading…'}</strong>
              </div>
            </div>
            <p className="evaluation-context-copy">Evaluation will use the documents in this project.</p>
            <EvaluationControls pending={evaluationPending} disabled={!hasReadyDocument || uploadPending}
              error={evaluation.isError ? `${errorMessage(evaluation.error)} Failed runs are not retried automatically. If the connection was interrupted, the server may still be processing the run.` : undefined}
              onRun={request => evaluation.mutate(request, { onSuccess: () => navigate(`/results?project=${projectId}`) })} />
          </section>
          <section className="panel"><div className="panel-heading"><h2>Latest Result</h2></div>
            {result.data ? <div className="upload-component"><h3>{result.data.summary.recommended_strategy}</h3><p>{result.data.summary.recommendation_score} recommendation score</p><Link className="text-link" to={`/results?project=${projectId}`}>View result →</Link></div>
              : <EmptyState title="No result in this session." description="Run an evaluation to see its recommendation here. Saved results cannot currently be reopened from the server." />}
          </section>
        </div>
      </div>
    </>
  )
}
