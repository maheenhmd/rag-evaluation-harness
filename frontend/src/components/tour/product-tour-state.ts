export const PRODUCT_TOUR_COMPLETE_KEY = 'ragify-product-tour-complete'
export const PRODUCT_TOUR_PROGRESS_KEY = 'ragify-product-tour-progress'
export const PRODUCT_TOUR_RESET_EVENT = 'ragify-product-tour-reset'

export type TourStepId = 'create-project' | 'projects' | 'upload-documents' | 'run-evaluation' | 'results'

export type TourStep = {
  id: TourStepId
  route: string
  target: string
  title: string
  description: string
}

export function getProductTourSteps(projectsReady: boolean, firstProjectId?: number): TourStep[] {
  const steps: TourStep[] = [
    {
      id: 'create-project',
      route: '/dashboard',
      target: '[data-tour-id="new-project-button"]',
      title: 'Create your first project.',
      description: 'Create a project to organize the documents and evaluations for one RAG system.',
    },
    {
      id: 'projects',
      route: '/dashboard',
      target: '[data-tour-id="nav-projects"]',
      title: 'Projects',
      description: projectsReady && !firstProjectId
        ? 'Create a project first. Upload and evaluation steps will be available after it exists.'
        : 'Open and manage your RAG projects here.',
    },
  ]

  if (projectsReady && firstProjectId) {
    const projectRoute = `/projects/${firstProjectId}`
    steps.push(
      {
        id: 'upload-documents',
        route: projectRoute,
        target: '[data-tour-id="project-upload-area"]',
        title: 'Upload documents',
        description: 'Upload the documents your RAG system will evaluate.',
      },
      {
        id: 'run-evaluation',
        route: projectRoute,
        target: '[data-tour-id="run-evaluation-button"]',
        title: 'Run Evaluation',
        description: 'Run an evaluation after your documents are ready.',
      },
    )
  }

  if (projectsReady) {
    steps.push({
      id: 'results',
      route: '/dashboard',
      target: '[data-tour-id="nav-results"]',
      title: 'Results',
      description: 'Review metrics, weaknesses and recommendations here.',
    })
  }

  return steps
}

function isTourStepId(value: string | null): value is TourStepId {
  return value === 'create-project'
    || value === 'projects'
    || value === 'upload-documents'
    || value === 'run-evaluation'
    || value === 'results'
}

export function readProductTourProgress(): TourStepId {
  if (typeof window === 'undefined') return 'create-project'
  const savedStep = window.sessionStorage.getItem(PRODUCT_TOUR_PROGRESS_KEY)
  return isTourStepId(savedStep) ? savedStep : 'create-project'
}

export function isProductTourComplete() {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(PRODUCT_TOUR_COMPLETE_KEY) === 'true'
}

export function saveProductTourProgress(stepId: TourStepId) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(PRODUCT_TOUR_PROGRESS_KEY, stepId)
}

export function completeProductTour() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PRODUCT_TOUR_COMPLETE_KEY, 'true')
  window.sessionStorage.removeItem(PRODUCT_TOUR_PROGRESS_KEY)
}

export function resetProductTour() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(PRODUCT_TOUR_COMPLETE_KEY)
  saveProductTourProgress('create-project')
  window.dispatchEvent(new Event(PRODUCT_TOUR_RESET_EVENT))
}
