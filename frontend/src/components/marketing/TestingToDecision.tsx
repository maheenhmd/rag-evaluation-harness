export default function TestingToDecision() {
  return (
    <section
      className="decision-section"
      aria-labelledby="decision-heading"
    >
      <div className="container">
        <div className="decision-header">
          <div>
            <p className="decision-eyebrow">
              FROM TESTING TO DECISION
            </p>

            <h2 id="decision-heading">
              Compare the system.
              <br />
              Understand the result.
            </h2>
          </div>

          <p className="decision-intro">
            Ragify evaluates retrieval and answer quality together,
            then turns the results into a configuration you can
            actually act on.
          </p>
        </div>

        <div className="decision-flow">
          {/* RETRIEVAL */}
          <article className="decision-stage">
            <div className="decision-stage-top">
              <span className="decision-number">01</span>
              <span className="decision-stage-name">
                Retrieval
              </span>
            </div>

            <div className="retrieval-visual">
              <div className="retrieval-row">
                <span>Semantic</span>

                <div className="retrieval-track">
                  <span
                    className="retrieval-fill"
                    style={{ width: '68%' }}
                  />
                </div>
              </div>

              <div className="retrieval-row">
                <span>BM25</span>

                <div className="retrieval-track">
                  <span
                    className="retrieval-fill"
                    style={{ width: '51%' }}
                  />
                </div>
              </div>

              <div className="retrieval-row retrieval-row-best">
                <span>Hybrid</span>

                <div className="retrieval-track">
                  <span
                    className="retrieval-fill"
                    style={{ width: '88%' }}
                  />
                </div>
              </div>
            </div>

            <div className="decision-stage-footer">
              <h3>Compare retrieval strategies</h3>
              <p>
                Run the same questions against each approach.
              </p>
            </div>
          </article>

          {/* ANSWER QUALITY */}
          <article className="decision-stage">
            <div className="decision-stage-top">
              <span className="decision-number">02</span>
              <span className="decision-stage-name">
                Answer quality
              </span>
            </div>

            <div className="quality-visual">
              <div className="quality-row">
                <span>Faithfulness</span>
                <strong>94</strong>

                <div className="quality-line">
                  <span style={{ width: '94%' }} />
                </div>
              </div>

              <div className="quality-row">
                <span>Relevance</span>
                <strong>91</strong>

                <div className="quality-line">
                  <span style={{ width: '91%' }} />
                </div>
              </div>

              <div className="quality-row">
                <span>Context</span>
                <strong>87</strong>

                <div className="quality-line">
                  <span style={{ width: '87%' }} />
                </div>
              </div>

              <div className="quality-row">
                <span>Hallucination</span>
                <strong>06</strong>

                <div className="quality-line quality-line-low">
                  <span style={{ width: '6%' }} />
                </div>
              </div>
            </div>

            <div className="decision-stage-footer">
              <h3>Measure answer quality</h3>
              <p>
                See whether the model stayed grounded in context.
              </p>
            </div>
          </article>

          {/* RECOMMENDATION */}
          <article className="decision-stage decision-stage-final">
            <div className="decision-stage-top">
              <span className="decision-number">03</span>
              <span className="decision-stage-name">
                Recommendation
              </span>
            </div>

            <div className="recommendation-visual">
              <div className="recommendation-label">
                Recommended configuration
              </div>

              <div className="recommendation-choice">
                <strong>Hybrid retrieval</strong>
                <span>Selected</span>
              </div>

              <div className="recommendation-rule" />

              <dl className="recommendation-details">
                <div>
                  <dt>Chunk size</dt>
                  <dd>512</dd>
                </div>

                <div>
                  <dt>Top K</dt>
                  <dd>5</dd>
                </div>

                <div>
                  <dt>Retrieval</dt>
                  <dd>Hybrid</dd>
                </div>
              </dl>
            </div>

            <div className="decision-stage-footer">
              <h3>Move forward with evidence</h3>
              <p>
                Know what performed better and what to change next.
              </p>
            </div>
          </article>
        </div>

        <div className="decision-conclusion">
          <span>Evaluation should end in a decision.</span>

          <strong>
            Not just which setup won — why it won.
          </strong>
        </div>
      </div>
    </section>
  )
}