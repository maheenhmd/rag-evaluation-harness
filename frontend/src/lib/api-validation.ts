import type { EvaluationResult, Project, ProjectDocument } from './api-types'

type RecordValue = Record<string, unknown>
export function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
const isId = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value > 0
const strings = (value: unknown) => Array.isArray(value) && value.every(item => typeof item === 'string')
const stringMap = (value: unknown) => isRecord(value) && Object.values(value).every(item => typeof item === 'string')
const numberMap = (value: unknown) => isRecord(value) && Object.values(value).every(item => typeof item === 'number' && Number.isFinite(item))
const fieldsAreStrings = (value: RecordValue, fields: string[]) => fields.every(key => typeof value[key] === 'string')

export function isProject(value: unknown): value is Project {
  return isRecord(value) && isId(value.id) && fieldsAreStrings(value, ['name', 'status'])
}
export function isDocument(value: unknown): value is ProjectDocument {
  return isRecord(value) && isId(value.id) && isId(value.project_id) && fieldsAreStrings(value, ['filename', 'status'])
}
function isConfiguration(value: unknown) {
  return isRecord(value) && typeof value.strategy === 'string'
    && ['chunk_size', 'chunk_overlap', 'top_k'].every(key => Number.isInteger(value[key]))
}
function isQuery(value: unknown) {
  return isRecord(value) && isId(value.evaluation_case_id)
    && fieldsAreStrings(value, ['question', 'primary_classification'])
    && strings(value.labels) && strings(value.reasons) && stringMap(value.percentage_metrics)
}
function isAnalysis(value: unknown) {
  return isRecord(value) && fieldsAreStrings(value, ['experiment_name', 'strategy'])
    && isConfiguration(value.configuration) && typeof value.recommendation_score === 'number' && Number.isFinite(value.recommendation_score)
    && typeof value.passes_guardrails === 'boolean' && strings(value.failed_guardrails)
    && stringMap(value.percentage_metrics) && numberMap(value.failure_counts) && numberMap(value.failure_rates)
    && Array.isArray(value.per_query_classifications) && value.per_query_classifications.every(isQuery)
}
export function isEvaluationResult(value: unknown): value is EvaluationResult {
  if (!isRecord(value) || !isRecord(value.summary) || !isRecord(value.details)) return false
  const { summary, details } = value
  const report = details.report
  return fieldsAreStrings(summary, ['recommended_strategy', 'recommended_experiment', 'recommendation_score', 'guardrail_status', 'next_step'])
    && isConfiguration(summary.configuration)
    && isRecord(summary.key_metrics) && fieldsAreStrings(summary.key_metrics, ['faithfulness', 'relevance', 'correctness', 'hallucination', 'mrr', 'recall_at_k'])
    && strings(summary.why_recommended) && strings(summary.strengths) && strings(summary.weaknesses)
    && ['project_id', 'evaluation_dataset_id', 'experiment_run_id', 'case_count'].every(key => isId(details[key]))
    && typeof details.dataset_reused === 'boolean' && typeof details.dataset_mode === 'string'
    && isRecord(details.best_experiment) && Array.isArray(details.ranking) && details.ranking.every(isRecord)
    && isRecord(report) && fieldsAreStrings(report, ['analysis_version', 'why_it_won'])
    && stringMap(report.percentage_metrics) && numberMap(report.failure_counts) && numberMap(report.failure_rates)
    && Array.isArray(report.per_query_classifications) && report.per_query_classifications.every(isQuery)
    && Array.isArray(report.important_failed_queries) && report.important_failed_queries.every(isQuery)
    && Array.isArray(report.configuration_analyses) && report.configuration_analyses.every(isAnalysis)
}
