// Only return to this application's workspace after authentication.
export function authDestination(state: unknown): string {
  if (state && typeof state === 'object' && 'from' in state && typeof state.from === 'string'
    && /^\/(dashboard|projects|evaluations|results|settings)(\/|\?|$)/.test(state.from)
    && !state.from.includes('\\')) return state.from
  return '/dashboard'
}
