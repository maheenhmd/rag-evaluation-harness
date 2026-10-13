import type { EvaluationResult, EvaluationRunRequest, Project, ProjectDocument } from './api-types'
import { isDocument, isEvaluationResult, isProject } from './api-validation'

type HealthResponse = {
  status: 'ok'
  service: string
}

function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL

  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured')
  }

  return baseUrl.replace(/\/$/, '')
}

function isHealthResponse(value: unknown): value is HealthResponse {
  if (!value || typeof value !== 'object') return false

  const health = value as Record<string, unknown>
  return health.status === 'ok' && typeof health.service === 'string'
}

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch(`${getApiBaseUrl()}/health`, { signal })

  if (!response.ok) {
    throw new Error('Backend health check failed')
  }

  const data: unknown = await response.json()

  if (!isHealthResponse(data)) {
    throw new Error('Backend returned an invalid health response')
  }

  return data
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
}

// Never persist tokens or accept a user ID from the browser as proof of ownership.
export type TokenGetter = () => Promise<string | null>
type RequestOptions = { getToken: TokenGetter; signal?: AbortSignal }

async function request(path: string, options: RequestOptions, init: RequestInit = {}): Promise<unknown> {
  let token: string | null
  try { token = await options.getToken() }
  catch { throw new ApiError('Your session could not be verified. Please sign in again.', 401) }
  if (!token) throw new ApiError('Please sign in to continue.', 401)

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Accept', 'application/json')
  // The browser sets the multipart boundary when the body is FormData.
  if (typeof init.body === 'string') headers.set('Content-Type', 'application/json')
  let response: Response
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers, signal: options.signal })
  } catch (error) {
    if (options.signal?.aborted) throw error
    throw new ApiError('Cannot reach Ragify. Check your connection and try again.')
  }
  if (!response.ok) {
    const messages: Record<number, string> = {
      400: 'The request could not be completed. Check your inputs; evaluation requires a ready document.',
      401: 'Your session has expired or could not be verified. Please sign in again.',
      403: 'You do not have access to this resource.',
      404: 'This project was not found or is not available to your account.',
      409: 'A document with this filename already exists in this project. Use a different filename.',
      422: path.endsWith('/evaluations/run')
        ? 'Evaluation could not be completed with these inputs. Check the settings and provide enough clear source text for supported questions.'
        : 'Some inputs are invalid. Check the project name or upload a non-empty .txt file.',
      429: path.endsWith('/evaluations/run')
        ? 'The LLM provider rate limit was reached. Wait before trying again, or use fewer cases and strategies. Check your Groq account limits if it persists.'
        : 'The service is busy. Wait a moment before trying again.',
      503: 'The evaluation service is unavailable. Check the local backend configuration before retrying.',
    }
    throw new ApiError(messages[response.status] ?? 'The server could not complete the request. Please try again.', response.status)
  }
  try { return await response.json() }
  catch { throw new ApiError('The server returned an empty or unreadable response.') }
}

function validated<T>(value: unknown, check: (value: unknown) => value is T): T {
  if (!check(value)) throw new ApiError('The server returned an unexpected response. Please try again.')
  return value
}

export async function getProjects(options: RequestOptions): Promise<Project[]> {
  return validated(await request('/projects', options), (value): value is Project[] => Array.isArray(value) && value.every(isProject))
}
export async function createProject(name: string, options: RequestOptions): Promise<Project> {
  return validated(await request('/projects', options, { method: 'POST', body: JSON.stringify({ name }) }), isProject)
}
export async function getProject(projectId: number, options: RequestOptions): Promise<Project> {
  const project = validated(await request(`/projects/${projectId}`, options), isProject)
  if (project.id !== projectId) throw new ApiError('The server returned a different project. Please reload.')
  return project
}
export async function getDocuments(projectId: number, options: RequestOptions): Promise<ProjectDocument[]> {
  return validated(await request(`/projects/${projectId}/documents`, options), (value): value is ProjectDocument[] =>
    Array.isArray(value) && value.every(item => isDocument(item) && item.project_id === projectId))
}
export async function uploadDocument(projectId: number, file: File, options: RequestOptions): Promise<ProjectDocument> {
  const body = new FormData()
  body.append('file', file)
  return validated(await request(`/projects/${projectId}/documents/upload`, options, { method: 'POST', body }),
    (value): value is ProjectDocument => isDocument(value) && value.project_id === projectId)
}
export async function runEvaluation(projectId: number, body: EvaluationRunRequest, options: RequestOptions): Promise<EvaluationResult> {
  return validated(await request(`/projects/${projectId}/evaluations/run`, options, { method: 'POST', body: JSON.stringify(body) }),
    (value): value is EvaluationResult => isEvaluationResult(value) && value.details.project_id === projectId)
}
