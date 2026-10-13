import { useAuth } from '@clerk/react'
import { useCallback, useSyncExternalStore } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProject, getDocuments, getProject, getProjects, runEvaluation, uploadDocument } from './api-client'
import type { EvaluationResult, EvaluationRunRequest } from './api-types'

export const resultKey = (projectId?: number) => ['evaluation-result', projectId ?? 'latest'] as const

export function useProjects() {
  const { getToken } = useAuth()
  return useQuery({ queryKey: ['projects'], queryFn: ({ signal }) => getProjects({ getToken, signal }) })
}
export function useProject(projectId: number, enabled: boolean) {
  const { getToken } = useAuth()
  return useQuery({ queryKey: ['project', projectId], queryFn: ({ signal }) => getProject(projectId, { getToken, signal }), enabled })
}
export function useDocuments(projectId: number, enabled: boolean) {
  const { getToken } = useAuth()
  return useQuery({ queryKey: ['documents', projectId], queryFn: ({ signal }) => getDocuments(projectId, { getToken, signal }), enabled })
}
export function useCreateProject() {
  const { getToken } = useAuth()
  const client = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createProject(name, { getToken }),
    onSuccess: project => {
      client.setQueryData(['project', project.id], project)
      void client.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
export function useUploadDocument(projectId: number) {
  const { getToken } = useAuth()
  const client = useQueryClient()
  return useMutation({
    mutationKey: ['upload', projectId],
    mutationFn: (file: File) => uploadDocument(projectId, file, { getToken }),
    // A failed upload may still create a document with status "failed".
    onSettled: () => { void client.invalidateQueries({ queryKey: ['documents', projectId] }) },
  })
}
export function useRunEvaluation(projectId: number) {
  const { getToken } = useAuth()
  const client = useQueryClient()
  return useMutation({
    mutationKey: ['evaluation', projectId],
    mutationFn: (request: EvaluationRunRequest) => runEvaluation(projectId, request, { getToken }),
    onSuccess: result => {
      client.setQueryData(resultKey(projectId), result)
      client.setQueryData(resultKey(), result)
    },
  })
}
// There is no results GET endpoint. Only successful runs in this session populate this cache.
export function useEvaluationResult(projectId?: number) {
  const client = useQueryClient()
  const subscribe = useCallback((onChange: () => void) => client.getQueryCache().subscribe(event => {
    const key = event.query.queryKey
    if (key[0] === 'evaluation-result' && key[1] === (projectId ?? 'latest')) onChange()
  }), [client, projectId])
  const snapshot = useCallback(() => client.getQueryData<EvaluationResult>(resultKey(projectId)), [client, projectId])
  // Subscribe to mutation-populated server results, without creating a query or fetch.
  const data = useSyncExternalStore(subscribe, snapshot, snapshot)
  return { data }
}
