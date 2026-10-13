import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { steps } from '../../lib/constants'

export default function HowItWorksPreview() {
  return (
    <section
      className="how-preview"
      id="how-it-works"
      aria-labelledby="how-preview-heading"
    >
      <div className="container how-preview-grid">
        <div className="how-preview-copy">
          <p className="how-preview-eyebrow">HOW IT WORKS</p>

          <h2 id="how-preview-heading">
            From documents
            <br />
            to a decision.
          </h2>

          <p className="how-preview-intro">
            Ragify runs the same knowledge through comparable retrieval
            configurations, measures the results, and makes the differences
            easier to understand.
          </p>

          <Link
            className="how-preview-link"
            to="/how-it-works"
          >
            Explore the full workflow
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <ol className="how-preview-steps">
          {steps.map((step) => (
            <li
              className="how-preview-step"
              key={step.number}
            >
              <span className="how-step-number">
                {step.number}
              </span>

              <div className="how-step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}