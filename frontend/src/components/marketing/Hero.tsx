import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const codeLines = [
  <>
    <span className="code-keyword">from</span> ragify{' '}
    <span className="code-keyword">import</span> Evaluation
  </>,
  <>&nbsp;</>,
  <>
    run = Evaluation(
  </>,
  <>
    &nbsp;&nbsp;documents=
    <span className="code-string">"knowledge-base"</span>,
  </>,
  <>
    &nbsp;&nbsp;retrieval=
    <span className="code-string">"hybrid"</span>,
  </>,
  <>
    &nbsp;&nbsp;top_k=
    <span className="code-number">5</span>,
  </>,
  <>
    )
  </>,
  <>&nbsp;</>,
  <>
    results = run.evaluate()
  </>,
  <>&nbsp;</>,
  <>
    results.<span className="code-property">faithfulness</span>
    <span className="code-comment">  # 0.94</span>
  </>,
  <>
    results.<span className="code-property">context_precision</span>
    <span className="code-comment">  # 0.89</span>
  </>,
]

export default function Hero() {
  return (
    <section className="ragify-hero" aria-labelledby="hero-heading">
      <div className="container ragify-hero-grid">

        <div className="ragify-hero-copy">
          <h1 id="hero-heading">
            Evaluation for
            <br />
            real-life RAG
            <br />
            systems
          </h1>

          <p className="ragify-hero-description">
            Test retrieval strategies, evaluate answer quality and understand
            which RAG configuration actually works for your data.
          </p>

          <div className="ragify-hero-actions">
            <Link className="ragify-primary" to="/sign-up">
              Get started
              <ArrowRight size={16} />
            </Link>

            <Link className="ragify-secondary" to="/how-it-works">
              How it works
            </Link>
          </div>
        </div>

        <div className="ragify-editor-wrap">
          <div className="ragify-editor">

            <div className="editor-header">
              <div className="editor-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>

              <div className="editor-tabs">
                <span className="editor-tab active">
                  evaluation.py
                </span>
              </div>

              <span className="editor-status">
                RAGIFY
              </span>
            </div>

            <div className="editor-body">
              <div className="editor-gutter" aria-hidden="true">
                {codeLines.map((_, index) => (
                  <span key={index}>{index + 1}</span>
                ))}
              </div>

              <div className="editor-code">
                {codeLines.map((line, index) => (
                  <div
                    className={`editor-line ${
                      index === 8 ? 'editor-line-active' : ''
                    }`}
                    style={
                      {
                        '--line-delay': `${index * 80}ms`,
                      } as React.CSSProperties
                    }
                    key={index}
                  >
                    {line}
                  </div>
                ))}

                <span className="editor-cursor" aria-hidden="true" />
              </div>
            </div>

            <div className="editor-result">
              <div>
                <span className="result-label">EVALUATION COMPLETE</span>
                <strong>Hybrid retrieval</strong>
              </div>

              <div className="result-metrics">
                <span>
                  <small>Faithfulness</small>
                  <strong>94%</strong>
                </span>

                <span>
                  <small>Precision</small>
                  <strong>89%</strong>
                </span>

                <span>
                  <small>Relevancy</small>
                  <strong>93%</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="editor-accent" />
        </div>

      </div>
    </section>
  )
}