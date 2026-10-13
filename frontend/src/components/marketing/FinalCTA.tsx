import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FinalCTA() {
  return (
    <section
      className="final-cta"
      aria-labelledby="final-cta-heading"
    >
      <div className="container final-cta-layout">
        <div className="final-cta-copy">
          <p className="final-cta-eyebrow">
            BUILD WITH A CLEARER PICTURE
          </p>

          <h2 id="final-cta-heading">
            Stop guessing.
            <br />
            Know what works.
          </h2>

          <p className="final-cta-description">
            Evaluate retrieval, measure answer quality, and move forward
            with a RAG configuration you can explain.
          </p>

          <div className="final-cta-actions">
            <Link
              className="final-cta-primary"
              to="/sign-up"
            >
              Try Ragify
              <ArrowRight
                size={17}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </Link>

            <Link
              className="final-cta-secondary"
              to="/how-it-works"
            >
              See how it works
            </Link>
          </div>
        </div>

        <div
          className="final-cta-visual"
          aria-hidden="true"
        >
          <div className="cta-visual-top">
            <span>evaluation_run_024</span>
            <span>complete</span>
          </div>

          <div className="cta-visual-body">
            <div className="cta-visual-row">
              <div className="cta-visual-label">
                <span>01</span>
                <strong>Retrieval</strong>
              </div>

              <div className="cta-visual-line">
                <span className="cta-line-fill cta-line-1" />
              </div>

              <span className="cta-visual-value">
                88
              </span>
            </div>

            <div className="cta-visual-row">
              <div className="cta-visual-label">
                <span>02</span>
                <strong>Faithfulness</strong>
              </div>

              <div className="cta-visual-line">
                <span className="cta-line-fill cta-line-2" />
              </div>

              <span className="cta-visual-value">
                94
              </span>
            </div>

            <div className="cta-visual-row">
              <div className="cta-visual-label">
                <span>03</span>
                <strong>Relevance</strong>
              </div>

              <div className="cta-visual-line">
                <span className="cta-line-fill cta-line-3" />
              </div>

              <span className="cta-visual-value">
                91
              </span>
            </div>

            <div className="cta-visual-divider" />

            <div className="cta-recommendation">
              <span className="cta-recommendation-label">
                Recommended configuration
              </span>

              <div className="cta-recommendation-main">
                <strong>Hybrid retrieval</strong>
                <span>Top K 5 · Chunk 512</span>
              </div>
            </div>
          </div>

          <div className="cta-visual-footer">
            <span>RAGIFY EVALUATION</span>
            <span>RESULT / 91.0</span>
          </div>

          <span className="cta-scan-line" />
        </div>
      </div>
    </section>
  )
}