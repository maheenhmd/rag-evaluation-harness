import { describe, expect, it } from 'vitest'
import { getProductTourSteps } from '../src/components/tour/product-tour-state'

describe('product tour sequence', () => {
  it('uses all five steps and the project detail route when a project exists', () => {
    const steps = getProductTourSteps(true, 42)

    expect(steps.map(step => step.id)).toEqual([
      'create-project',
      'projects',
      'upload-documents',
      'run-evaluation',
      'results',
    ])
    expect(steps.map(step => step.route)).toEqual([
      '/dashboard',
      '/dashboard',
      '/projects/42',
      '/projects/42',
      '/dashboard',
    ])
  })

  it('waits for project loading before adding later steps', () => {
    expect(getProductTourSteps(false)).toHaveLength(2)
  })

  it('skips project-only steps and explains what to do when no project exists', () => {
    const steps = getProductTourSteps(true)

    expect(steps.map(step => step.id)).toEqual(['create-project', 'projects', 'results'])
    expect(steps[1].description).toContain('Create a project first')
  })
})
