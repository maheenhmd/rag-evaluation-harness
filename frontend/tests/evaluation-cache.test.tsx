import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, expect, it, vi } from 'vitest'
import { resultKey, useEvaluationResult } from '../src/lib/queries'

afterEach(() => vi.restoreAllMocks())

function renderResult(client: QueryClient, projectId?: number) {
  function ReadResult() {
    const { data } = useEvaluationResult(projectId)
    return <span>{data?.details.experiment_run_id ?? 'empty'}</span>
  }
  return renderToStaticMarkup(<QueryClientProvider client={client}><ReadResult /></QueryClientProvider>)
}

it('reads an empty result without creating a fetchable query or logging a missing queryFn', () => {
  const error = vi.spyOn(console, 'error')
  const warn = vi.spyOn(console, 'warn')
  const client = new QueryClient()
  expect(renderResult(client, 5)).toContain('empty')
  expect(client.getQueryCache().getAll()).toHaveLength(0)
  expect([...error.mock.calls, ...warn.mock.calls].flat().join(' ')).not.toContain('No queryFn')
})

it('reads mutation-populated project and latest snapshots without fetching', () => {
  const client = new QueryClient()
  const result = { details: { experiment_run_id: 12 } }
  client.setQueryData(resultKey(5), result)
  client.setQueryData(resultKey(), result)
  expect(renderResult(client, 5)).toContain('12')
  expect(renderResult(client)).toContain('12')
  expect(renderResult(client, 6)).toContain('empty')
  expect(client.isFetching()).toBe(0)
  client.clear()
  expect(renderResult(client, 5)).toContain('empty')
})

it('does not leak results into another session cache', () => {
  const first = new QueryClient()
  first.setQueryData(resultKey(5), { details: { experiment_run_id: 12 } })
  expect(renderResult(new QueryClient(), 5)).toContain('empty')
  first.clear()
})
