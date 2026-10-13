import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Play } from 'lucide-react'
import type { EvaluationRunRequest, ExperimentConfig } from '../../lib/api-types'

type Props = { onRun: (options: EvaluationRunRequest) => void; pending: boolean; disabled: boolean; error?: string }

export default function EvaluationControls({ onRun, pending, disabled, error }: Props) {
  const [validation, setValidation] = useState('')
  const disclosure = useRef<HTMLDetailsElement>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || disabled) return
    const values = new FormData(event.currentTarget)
    const chunkSize = Number(values.get('chunk_size'))
    const overlap = Number(values.get('chunk_overlap'))
    if (overlap >= chunkSize) {
      setValidation('Overlap must be smaller than chunk size.')
      if (disclosure.current) disclosure.current.open = true
      return
    }
    setValidation('')
    const selected = String(values.get('strategy'))
    const strategies: ExperimentConfig['strategy'][] = selected === 'compare'
      ? ['semantic', 'bm25', 'hybrid'] : [selected as ExperimentConfig['strategy']]
    onRun({
      mode: 'synthetic', case_count: Number(values.get('case_count')),
      experiments: strategies.map(strategy => ({
        name: strategy, strategy, chunk_size: chunkSize, chunk_overlap: overlap, top_k: Number(values.get('top_k')),
      })),
    })
  }

  return (
    <form className="evaluation-controls" onSubmit={submit} onInvalid={() => { if (disclosure.current) disclosure.current.open = true }}>
      <div className="evaluation-intro"><h3>Evaluate your RAG setup</h3><p>Generate questions from your documents and compare retrieval and answer quality.</p></div>
      <details ref={disclosure} className="disclosure">
        <summary>Advanced Settings<span>Optional configuration</span></summary>
        <fieldset disabled={pending} className="settings-fields evaluation-fieldset">
          <legend className="sr-only">Evaluation settings</legend>
          <div className="field"><label htmlFor="case-count">Case Count</label><input id="case-count" name="case_count" type="number" min={1} max={12} defaultValue={8} required /><p>Test questions to request (1–12). More questions increase cost.</p></div>
          <div className="field"><label htmlFor="strategy">Strategy</label><select id="strategy" name="strategy" defaultValue="compare"><option value="compare">Compare all three strategies</option><option value="semantic">Semantic only</option><option value="bm25">BM25 only</option><option value="hybrid">Hybrid only</option></select><p>A single strategy uses fewer evaluation calls.</p></div>
          <div className="field"><label htmlFor="chunk-size">Chunk Size</label><input id="chunk-size" name="chunk_size" type="number" min={40} max={1000} defaultValue={120} required /></div>
          <div className="field"><label htmlFor="overlap">Overlap</label><input id="overlap" name="chunk_overlap" type="number" min={0} max={300} defaultValue={20} required /></div>
          <div className="field"><label htmlFor="top-k">Top K</label><input id="top-k" name="top_k" type="number" min={1} max={20} defaultValue={3} required /></div>
        </fieldset>
      </details>
      {(validation || error) && <p className="field-error" role="alert">{validation || error}</p>}
      <div className="evaluation-action"><button type="submit" className="button button-primary" disabled={pending || disabled}><Play size={15} aria-hidden="true" />{pending ? 'Evaluating…' : 'Run Evaluation'}</button></div>
      <p className="small-note" role="status">{pending ? 'Evaluation is running. It can take a few minutes. Keep this tab open.' : disabled ? 'Upload at least one ready document before running an evaluation.' : 'This run uses the configured LLM provider and may incur usage costs.'}</p>
    </form>
  )
}
