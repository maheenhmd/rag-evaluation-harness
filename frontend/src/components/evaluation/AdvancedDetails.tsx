import type { EvaluationResult, QueryAnalysis } from '../../lib/api-types'

function QueryList({ queries }: { queries: QueryAnalysis[] }) {
  if (!queries.length) return <p className="empty-inline">None reported.</p>
  return <ul className="query-classifications">{queries.map(query => <li key={query.evaluation_case_id}>
    <h3>{query.question}</h3><p>Primary classification: {query.primary_classification.replaceAll('_', ' ')}</p>
    <p>Labels: {query.labels.map(label => label.replaceAll('_', ' ')).join(', ')}</p>
    <ul>{query.reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul>
    <dl className="configuration-list">{Object.entries(query.percentage_metrics).map(([label, value]) => <div key={label}><dt>{label.replaceAll('_', ' ')}</dt><dd>{value}</dd></div>)}</dl>
  </li>)}</ul>
}

export default function AdvancedDetails({ details }: { details: EvaluationResult['details'] }) {
  const { report } = details
  return (
    <details className="disclosure advanced-details">
      <summary>Advanced Details<span>Retrieval metrics, comparisons & query analysis</span></summary>
      <div className="advanced-content">
        <h2>Run information</h2>
        <dl className="configuration-list">
          <div><dt>Project</dt><dd>{details.project_id}</dd></div><div><dt>Run</dt><dd>{details.experiment_run_id}</dd></div>
          <div><dt>Dataset</dt><dd>{details.evaluation_dataset_id}</dd></div><div><dt>Questions</dt><dd>{details.case_count}</dd></div>
          <div><dt>Dataset reuse</dt><dd>{details.dataset_reused ? 'Reused' : 'New dataset'}</dd></div><div><dt>Mode</dt><dd>{details.dataset_mode}</dd></div>
        </dl>
        <h2>Why this configuration won</h2><p className="empty-inline">{report.why_it_won}</p>
        <h2>Failure counts and rates</h2>
        <ul className="query-classifications">{Object.entries(report.failure_counts).map(([label, count]) => <li key={label}>{label.replaceAll('_', ' ')}: {count} ({report.failure_rates[label] === undefined ? 'Rate unavailable' : `${(report.failure_rates[label] * 100).toFixed(1)}%`})</li>)}</ul>
        <h2>Configuration comparison</h2>
        {report.configuration_analyses.map((configuration, index) => <section className="comparison-section" key={`${configuration.experiment_name}-${index}`}>
          <h3>{configuration.experiment_name} · {configuration.strategy}</h3>
          <p>Score: {(configuration.recommendation_score * 100).toFixed(1)}% · {configuration.passes_guardrails ? 'Passed guardrails' : 'Did not pass all guardrails'}</p>
          <p>Chunk size {configuration.configuration.chunk_size} · Overlap {configuration.configuration.chunk_overlap} · Top K {configuration.configuration.top_k}</p>
          {configuration.failed_guardrails.length > 0 && <p>Below target: {configuration.failed_guardrails.map(label => label.replaceAll('_', ' ')).join(', ')}</p>}
          <dl className="configuration-list">{Object.entries(configuration.percentage_metrics).map(([label, value]) => <div key={label}><dt>{label.replaceAll('_', ' ')}</dt><dd>{value}</dd></div>)}</dl>
          <details className="disclosure"><summary>Queries for this configuration</summary><QueryList queries={configuration.per_query_classifications} /></details>
        </section>)}
        <h2>Important failed queries</h2><QueryList queries={report.important_failed_queries} />
        <h2>Recommended configuration: all queries</h2><QueryList queries={report.per_query_classifications} />
        <p className="small-note">Analysis version: {report.analysis_version}</p>
      </div>
    </details>
  )
}
