import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject, getDocuments, getHealth, getProject, getProjects, runEvaluation, uploadDocument } from '../src/lib/api-client'
import { authDestination } from '../src/lib/auth-redirect'

// Isolated test fixtures; no data is bundled into the application or sent to a server.
const project = { id: 7, name: 'Contract test', status: 'created' }
const getToken = vi.fn(async () => 'test-session-token')
const fetchMock = vi.fn()
beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://127.0.0.1:8001/')
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  getToken.mockClear()
})
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

describe('authenticated API contracts', () => {
  it('keeps health public and preserves its response', async () => {
    fetchMock.mockResolvedValue(Response.json({ status: 'ok', service: 'rag-evaluation-harness' }))
    expect(await getHealth()).toEqual({ status: 'ok', service: 'rag-evaluation-harness' })
    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:8001/health', { signal: undefined })
    expect(getToken).not.toHaveBeenCalled()
  })
  it('fetches a fresh Bearer token, forwards cancellation, and accepts a real empty list', async () => {
    fetchMock.mockResolvedValue(Response.json([]))
    const controller = new AbortController()
    expect(await getProjects({ getToken, signal: controller.signal })).toEqual([])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://127.0.0.1:8001/projects')
    expect(init.headers.get('Authorization')).toBe('Bearer test-session-token')
    expect(init.signal).toBe(controller.signal)
    expect(getToken).toHaveBeenCalledTimes(1)
  })
  it('does not send an unauthenticated request', async () => {
    await expect(getProjects({ getToken: async () => null })).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('creates a project with only the supported name field', async () => {
    fetchMock.mockResolvedValue(Response.json(project))
    expect(await createProject('Contract test', { getToken })).toEqual(project)
    expect(fetchMock.mock.calls[0][1].method).toBe('POST')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ name: 'Contract test' })
  })
  it('rejects missing project fields and wrong project IDs', async () => {
    fetchMock.mockResolvedValueOnce(Response.json([{ id: 7, name: 'Missing status' }]))
    await expect(getProjects({ getToken })).rejects.toThrow('unexpected response')
    fetchMock.mockResolvedValueOnce(Response.json({ ...project, id: 8 }))
    await expect(getProject(7, { getToken })).rejects.toThrow('different project')
  })
  it('does not associate another project’s documents with the requested project', async () => {
    fetchMock.mockResolvedValue(Response.json([{ id: 1, project_id: 8, filename: 'source.txt', status: 'ready' }]))
    await expect(getDocuments(7, { getToken })).rejects.toThrow('unexpected response')
  })
  it('sends multipart file data without overriding its boundary', async () => {
    const document = { id: 1, project_id: 7, filename: 'source.txt', status: 'ready' }
    fetchMock.mockResolvedValue(Response.json(document))
    const file = new File(['text'], 'source.txt', { type: 'text/plain' })
    expect(await uploadDocument(7, file, { getToken })).toEqual(document)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/projects/7/documents/upload')
    expect(init.headers.has('Content-Type')).toBe(false)
    expect((init.body as FormData).get('file')).toBe(file)
  })
  it.each([400, 401, 403, 404, 409, 422, 429, 500, 503])('turns HTTP %s into a readable error without backend internals or retries', async status => {
    fetchMock.mockResolvedValue(Response.json({ detail: 'private-server-internals' }, { status }))
    try { await getProjects({ getToken }); throw new Error('Expected failure') }
    catch (error) { expect(error).toMatchObject({ status }); expect((error as Error).message).not.toContain('private-server-internals') }
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('handles network failures and empty successful responses', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(getProjects({ getToken })).rejects.toThrow('Cannot reach Ragify')
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await expect(getProjects({ getToken })).rejects.toThrow('empty or unreadable')
  })
  it('sends only synthetic evaluation fields and rejects an invalid result', async () => {
    fetchMock.mockResolvedValue(Response.json({ summary: {}, details: {} }))
    const body = { mode: 'synthetic' as const, case_count: 1, experiments: [{ name: 'bm25', strategy: 'bm25' as const, chunk_size: 120, chunk_overlap: 20, top_k: 3 }] }
    await expect(runEvaluation(7, body, { getToken })).rejects.toThrow('unexpected response')
    expect(fetchMock.mock.calls[0][0]).toBe('http://127.0.0.1:8001/projects/7/evaluations/run')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(body)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

it('only permits internal workspace return URLs after sign-in', () => {
  expect(authDestination({ from: '/projects/7?new=1' })).toBe('/projects/7?new=1')
  for (const from of ['//evil.test', 'https://evil.test', '/projects\\evil', '/sign-in', '/projectsevil']) {
    expect(authDestination({ from })).toBe('/dashboard')
  }
})
