import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/shared/PageHeader'
import EmptyState from '../../components/shared/EmptyState'
import EvaluationSummary from '../../components/evaluation/EvaluationSummary'
import AdvancedDetails from '../../components/evaluation/AdvancedDetails'
import { useEvaluationResult } from '../../lib/queries'

export default function ResultsPage() {
  const [params] = useSearchParams()
  const selected = params.get('project')
  const projectId = selected === null ? undefined : Number(selected)
  const validSelection = selected === null || (/^\d+$/.test(selected) && Number.isSafeInteger(projectId) && Number(projectId) > 0)
  const result = useEvaluationResult(projectId)
  const data = validSelection ? result.data : undefined
  return <>
    <PageHeader title="Results" description="Understand which configuration to move forward with, and why."
      action={<Link className="button button-secondary" to={data ? `/projects/${data.details.project_id}` : '/projects'}>{data ? 'Back to Project' : 'Go to Projects'}</Link>} />
    {data ? <><p className="notice result-notice">Run {data.details.experiment_run_id} · Project {data.details.project_id}. This result stays available until you reload or sign out; reopening saved runs is not available yet.</p><div className="space-y-6"><EvaluationSummary result={data.summary} /><AdvancedDetails details={data.details} /></div></>
      : <section className="panel"><EmptyState title="No result in this session." description="Run an evaluation from a project to see its real recommendation here. Saved runs cannot currently be reopened from the server." action={<Link className="button button-secondary" to="/projects">Open Projects</Link>} /></section>}
  </>
}
