import { Link } from 'react-router-dom'
import { navigation } from '../../lib/constants'
import Brand from '../shared/Brand'

const currentYear = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-layout">

        <div className="footer-brand">
          <Brand />

          <p>
            Evaluate retrieval, measure answer quality,
            and understand what actually works in your RAG system.
          </p>
        </div>

        <div className="footer-nav-group">
          <p className="footer-nav-title">Product</p>

          <nav aria-label="Product navigation">
            {navigation.map((link) => (
              <Link
                key={link.href}
                to={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="footer-nav-group">
          <p className="footer-nav-title">Account</p>

          <nav aria-label="Account navigation">
            <Link to="/sign-in">Sign in</Link>
            <Link to="/sign-up">Get started</Link>
          </nav>
        </div>

      </div>

      <div className="container footer-bottom">
        <span>© {currentYear} Ragify</span>

        <span>
          RAG evaluation without guesswork.
        </span>
      </div>
    </footer>
  )
}