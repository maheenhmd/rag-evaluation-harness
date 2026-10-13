// Shared UI states; project props use the real public API type below.
// No example projects, requests, endpoints, or simulated network delays live here.
export type ResourceState<T> =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T }

export type { Project as ProjectView } from './api-types'
