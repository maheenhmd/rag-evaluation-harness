import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useProjects } from '../../lib/queries'
import {
  PRODUCT_TOUR_RESET_EVENT,
  completeProductTour,
  getProductTourSteps,
  isProductTourComplete,
  readProductTourProgress,
  saveProductTourProgress,
  type TourStepId,
} from './product-tour-state'

const TARGET_WAIT_MS = 4000

function findVisibleTarget(selector: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).find(node => {
    const style = window.getComputedStyle(node)
    const rect = node.getBoundingClientRect()
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
  }) ?? null
}

export default function ProductTour() {
  const navigate = useNavigate()
  const location = useLocation()
  const projects = useProjects()
  const [visible, setVisible] = useState(() => !isProductTourComplete())
  const [currentStepId, setCurrentStepId] = useState<TourStepId>(readProductTourProgress)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [waitingForTarget, setWaitingForTarget] = useState(true)

  const firstProjectId = projects.data?.[0]?.id
  const projectsReady = projects.isSuccess || projects.isError
  const steps = useMemo(
    () => getProductTourSteps(projectsReady, projects.isSuccess ? firstProjectId : undefined),
    [firstProjectId, projects.isSuccess, projectsReady],
  )
  const savedStepIndex = steps.findIndex(step => step.id === currentStepId)
  const stepIndex = savedStepIndex >= 0 ? savedStepIndex : projectsReady ? 1 : -1
  const currentStep = stepIndex >= 0 ? steps[stepIndex] : undefined
  const stepNumber = stepIndex + 1
  const totalSteps = steps.length
  const isLastStep = stepIndex === totalSteps - 1

  useEffect(() => {
    function handleReset() {
      setVisible(true)
      setCurrentStepId('create-project')
      setTargetRect(null)
      setWaitingForTarget(true)
    }

    if (typeof window === 'undefined') return
    window.addEventListener(PRODUCT_TOUR_RESET_EVENT, handleReset)
    return () => window.removeEventListener(PRODUCT_TOUR_RESET_EVENT, handleReset)
  }, [])

  useEffect(() => {
    if (!visible) return
    saveProductTourProgress(currentStepId)
  }, [currentStepId, visible])

  useEffect(() => {
    if (!visible || !currentStep) return

    if (location.pathname !== currentStep.route) {
      navigate(currentStep.route, { replace: false })
      return
    }

    let targetNode: HTMLElement | null = null
    let retryTimer = 0
    let waitTimer = 0
    const waitDeadline = Date.now() + TARGET_WAIT_MS

    const syncTarget = () => {
      targetNode = findVisibleTarget(currentStep.target)
      if (!targetNode) {
        setTargetRect(null)
        return false
      }
      setTargetRect(targetNode.getBoundingClientRect())
      setWaitingForTarget(false)
      return true
    }

    const retryUntilReady = () => {
      if (syncTarget()) return
      if (Date.now() < waitDeadline) retryTimer = window.setTimeout(retryUntilReady, 100)
    }
    const handlePositionChange = () => {
      if (targetNode?.isConnected) setTargetRect(targetNode.getBoundingClientRect())
      else syncTarget()
    }

    retryTimer = window.setTimeout(retryUntilReady, 80)
    waitTimer = window.setTimeout(() => setWaitingForTarget(false), TARGET_WAIT_MS)
    window.addEventListener('resize', handlePositionChange)
    window.addEventListener('scroll', handlePositionChange, true)


    return () => {
      window.clearTimeout(retryTimer)
      window.clearTimeout(waitTimer)
      window.removeEventListener('resize', handlePositionChange)
      window.removeEventListener('scroll', handlePositionChange, true)
    }
  }, [currentStep, location.pathname, navigate, visible])

  const tooltipStyle = useMemo(() => {
    if (typeof window === 'undefined') return { top: 24, left: 24 }
    if (!targetRect) {
      return { top: Math.max(24, window.innerHeight * 0.5 - 80), left: Math.max(24, window.innerWidth * 0.5 - 180) }
    }

    const maxWidth = 320
    const preferredLeft = targetRect.right + 18 + maxWidth > window.innerWidth - 20
      ? Math.max(18, targetRect.left - maxWidth - 18)
      : targetRect.right + 18

    const nextTop = Math.min(
      Math.max(24, targetRect.top + targetRect.height / 2 - 68),
      Math.max(24, window.innerHeight - 200),
    )

    return { top: nextTop, left: preferredLeft }
  }, [targetRect])

  function finishTour() {
    completeProductTour()
    setVisible(false)
    setTargetRect(null)
  }

  function handleNext() {
    if (isLastStep) {
      finishTour()
      return
    }
    setCurrentStepId(steps[stepIndex + 1].id)
    setTargetRect(null)
    setWaitingForTarget(true)
  }

  function handlePrevious() {
    setCurrentStepId(steps[Math.max(0, stepIndex - 1)].id)
    setTargetRect(null)
    setWaitingForTarget(true)
  }

  if (!visible || !currentStep) return null

  const isLocatingStep = waitingForTarget || location.pathname !== currentStep.route

  return (
    <div className="tour-overlay" aria-live="polite" aria-label="Product tour">
      <div className="tour-backdrop" aria-hidden="true" />
      {targetRect ? (
        <div
          className="tour-spotlight"
          aria-hidden="true"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      ) : null}
      <div className="tour-tooltip" role="dialog" aria-modal="false" style={{ top: tooltipStyle.top, left: tooltipStyle.left }}>
        <div className="tour-tooltip-header">
          <span className="tour-step-count">{stepNumber} of {totalSteps}</span>
          <button type="button" className="text-button tour-close" onClick={finishTour}>Skip</button>
        </div>
        <h3>{currentStep.title}</h3>
        <p>{currentStep.description}</p>
        {isLocatingStep ? <p className="small-note" role="status">Loading this step…</p> : null}
        <div className="tour-tooltip-actions">
          <button type="button" className="button button-secondary" disabled={stepNumber === 1} onClick={handlePrevious}>Back</button>
          <button type="button" className="button button-primary" disabled={isLocatingStep || (currentStep.id === 'projects' && !projectsReady)} onClick={handleNext}>{isLastStep ? 'Done' : 'Next'}</button>
        </div>
      </div>
    </div>
  )
}
