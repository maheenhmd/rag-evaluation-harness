import type { EvaluationSummary as Summary } from '../../lib/api-types'

export default function EvaluationSummary({ result }: { result: Summary }) {
  const metrics = [
    ['Faithfulness', result.key_metrics.faithfulness],
    ['Correctness', result.key_metrics.correctness],
    ['Relevance', result.key_metrics.relevance],
    ['Hallucination', result.key_metrics.hallucination],
  ]
  const configuration = [
    ['Strategy', result.configuration.strategy],
    ['Chunk Size', result.configuration.chunk_size],
    ['Overlap', result.configuration.chunk_overlap],
    ['Top K', result.configuration.top_k],
  ]
  const explanations = [
    ['Why this was recommended', result.why_recommended],
    ['Strengths', result.strengths],
    ['Weaknesses', result.weaknesses],
  ] as const

  return (
    <>
      <section className="panel recommendation-panel" aria-labelledby="recommendation-heading">
        <div className="panel-heading"><h2 id="recommendation-heading">Recommendation</h2><span className="subtle-label">{result ? 'Evaluation summary' : 'No result loaded'}</span></div>
        <div className="recommendation-values">
          <div><p>Recommended Strategy</p><strong>{result.recommended_strategy}</strong></div>
          <div><p>Recommendation Score</p><strong>{result.recommendation_score}</strong></div>
        </div>
        <div className="guardrail-row"><span>Recommended Experiment</span><p>{result.recommended_experiment}</p></div>
        <div className="guardrail-row"><span>Guardrail Status</span><p>{result.guardrail_status}</p></div>
      </section>
      <section className="panel" aria-labelledby="retrieval-heading"><div className="panel-heading"><h2 id="retrieval-heading">Retrieval quality</h2></div><dl className="configuration-list"><div><dt>MRR</dt><dd>{result.key_metrics.mrr}</dd></div><div><dt>Recall@K</dt><dd>{result.key_metrics.recall_at_k}</dd></div></dl></section>
      <section className="panel" aria-labelledby="quality-heading">
        <div className="panel-heading"><h2 id="quality-heading">Answer quality</h2></div>
        <dl className="stat-row">{metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? '—'}</dd></div>)}</dl>
      </section>
      <section className="panel" aria-labelledby="configuration-heading">
        <div className="panel-heading"><h2 id="configuration-heading">Configuration</h2></div>
        <dl className="configuration-list">{configuration.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? '—'}</dd></div>)}</dl>
      </section>
      <div className="result-explanations">
        {explanations.map(([title, items]) => <section key={title}><h2>{title}</h2>{items.length ? <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>None reported.</p>}</section>)}
      </div>
      <section className="next-step-panel"><h2>Next Step</h2><p>{result.next_step}</p></section>
    </>
  )
}
