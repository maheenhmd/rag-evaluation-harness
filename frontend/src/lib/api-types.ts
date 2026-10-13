// The public FastAPI contracts. Hidden evaluation ground truth is never a UI model.
export type Project = { id: number; name: string; status: string }
export type ProjectDocument = { id: number; project_id: number; filename: string; status: string }
export type ExperimentConfig = {
  name: string
  strategy: 'semantic' | 'bm25' | 'hybrid'
  chunk_size: number
  chunk_overlap: number
  top_k: number
}
export type EvaluationRunRequest = {
  mode: 'synthetic'
  case_count?: number
  experiments?: ExperimentConfig[]
}
export type EvaluationSummary = {
  recommended_strategy: string
  recommended_experiment: string
  recommendation_score: string
  configuration: Omit<ExperimentConfig, 'name'>
  key_metrics: Record<'faithfulness' | 'relevance' | 'correctness' | 'hallucination' | 'mrr' | 'recall_at_k', string>
  guardrail_status: string
  why_recommended: string[]
  strengths: string[]
  weaknesses: string[]
  next_step: string
}
export type QueryAnalysis = {
  evaluation_case_id: number
  question: string
  labels: string[]
  primary_classification: string
  percentage_metrics: Record<string, string>
  reasons: string[]
}
export type ConfigurationAnalysis = {
  experiment_name: string
  strategy: string
  configuration: Omit<ExperimentConfig, 'name'>
  recommendation_score: number
  percentage_metrics: Record<string, string>
  passes_guardrails: boolean
  failed_guardrails: string[]
  failure_counts: Record<string, number>
  failure_rates: Record<string, number>
  per_query_classifications: QueryAnalysis[]
}
export type EvaluationReport = {
  analysis_version: string
  percentage_metrics: Record<string, string>
  why_it_won: string
  failure_counts: Record<string, number>
  failure_rates: Record<string, number>
  important_failed_queries: QueryAnalysis[]
  per_query_classifications: QueryAnalysis[]
  configuration_analyses: ConfigurationAnalysis[]
}
export type EvaluationResult = {
  summary: EvaluationSummary
  details: {
    project_id: number
    evaluation_dataset_id: number
    dataset_reused: boolean
    dataset_mode: string
    case_count: number
    experiment_run_id: number
    best_experiment: Record<string, unknown>
    ranking: Record<string, unknown>[]
    report: EvaluationReport
  }
}
