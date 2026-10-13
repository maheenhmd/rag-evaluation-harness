import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './router/router'
import ThemeProvider from './components/shared/ThemeProvider'
import AppProviders from './components/auth/AppProviders'

export default function App() {
  return <ThemeProvider><BrowserRouter><AppProviders><AppRoutes /></AppProviders></BrowserRouter></ThemeProvider>
}
