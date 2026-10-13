import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import EvaluationSummary from '../src/components/evaluation/EvaluationSummary'
import AdvancedDetails from '../src/components/evaluation/AdvancedDetails'
import { isEvaluationResult } from '../src/lib/api-validation'
import type { EvaluationResult } from '../src/lib/api-types'

// Test-only response contract. Production always reads the API response.
const result: EvaluationResult = {
  summary: {
    recommended_strategy: 'bm25', recommended_experiment: 'single-bm25', recommendation_score: '86.6%',
    configuration: { strategy: 'bm25', chunk_size: 120, chunk_overlap: 20, top_k: 3 },
    key_metrics: { faithfulness: '72.2%', relevance: '100.0%', correctness: '77.9%', hallucination: '27.8%', mrr: '100.0%', recall_at_k: '91.0%' },
    guardrail_status: 'No configuration passed all quality guardrails.',
    why_recommended: ['Backend explanation'], strengths: ['Relevant answers.'], weaknesses: ['Faithfulness below target.'], next_step: 'Retest with better evidence.',
  },
  details: {
    project_id: 7, evaluation_dataset_id: 2, dataset_reused: true, dataset_mode: 'synthetic', case_count: 1, experiment_run_id: 3,
    best_experiment: { private_internal: 'DO NOT RENDER INTERNALS' }, ranking: [],
    report: { analysis_version: 'day10-v1', percentage_metrics: {}, why_it_won: 'Backend comparison explanation.', failure_counts: {}, failure_rates: {}, important_failed_queries: [], per_query_classifications: [], configuration_analyses: [] },
  },
}

describe('evaluation response presentation', () => {
  it('accepts the real summary/details shape and rejects missing rendered fields', () => {
    expect(isEvaluationResult(result)).toBe(true)
    const malformed = structuredClone(result)
    delete (malformed.summary.key_metrics as Partial<typeof malformed.summary.key_metrics>).correctness
    expect(isEvaluationResult(malformed)).toBe(false)
  })
  it('preserves formatted backend metrics and guardrail decisions without recalculation', () => {
    const html = renderToStaticMarkup(<EvaluationSummary result={result.summary} />)
    expect(html).toContain('86.6%')
    expect(html).toContain('72.2%')
    expect(html).toContain('No configuration passed all quality guardrails.')
    expect(html).toContain('single-bm25')
    expect(html).toContain('91.0%')
  })
  it('keeps technical details collapsed and renders only selected report fields', () => {
    const html = renderToStaticMarkup(<AdvancedDetails details={result.details} />)
    expect(html).toContain('<details')
    expect(html).not.toContain(' open=')
    expect(html).toContain('Backend comparison explanation.')
    expect(html).not.toContain('DO NOT RENDER INTERNALS')
    expect(html).not.toContain('<pre')
  })
})
