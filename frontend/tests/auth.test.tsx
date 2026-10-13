import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import RequireAuth from '../src/components/auth/RequireAuth'

const auth = vi.hoisted(() => ({ isLoaded: false, isSignedIn: false }))
vi.mock('@clerk/react', () => ({ useAuth: () => auth }))
beforeEach(() => { auth.isLoaded = false; auth.isSignedIn = false })
function renderRoute() {
  return renderToStaticMarkup(<MemoryRouter initialEntries={['/projects']}><Routes>
    <Route element={<RequireAuth />}><Route path="projects" element={<div>private-project-data</div>} /></Route>
  </Routes></MemoryRouter>)
}
it('does not mount private content while Clerk loads', () => {
  const html = renderRoute()
  expect(html).toContain('Checking your session')
  expect(html).not.toContain('private-project-data')
})
it('does not render private data for a signed-out visitor', () => {
  auth.isLoaded = true
  expect(renderRoute()).not.toContain('private-project-data')
})
it('renders the protected route when Clerk authenticates the user', () => {
  auth.isLoaded = true
  auth.isSignedIn = true
  expect(renderRoute()).toContain('private-project-data')
})
