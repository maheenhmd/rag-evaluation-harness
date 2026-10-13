const questions = [
  {
    number: '01',
    title: 'Which retrieval strategy fits your documents?',
    description:
      'Compare semantic, BM25, and hybrid retrieval against the same corpus and evaluation set.',
  },
  {
    number: '02',
    title: 'How should you choose chunk size and overlap?',
    description:
      'See how chunking choices affect retrieval quality and the context available to your model.',
  },
  {
    number: '03',
    title: 'Are the answers grounded in retrieved context?',
    description:
      'Measure faithfulness, answer relevancy, and context quality instead of relying on manual inspection.',
  },
  {
    number: '04',
    title: 'Which change is actually worth making next?',
    description:
      'Compare evaluation runs and identify which configuration produces a measurable improvement.',
  },
]

export default function WhyRagify() {
  return (
    <section
      className="why-ragify"
      aria-labelledby="why-ragify-heading"
    >
      <div className="container why-ragify-grid">
        <div className="why-ragify-copy">
          <p className="why-ragify-eyebrow">
            WHY RAGIFY
          </p>

          <h2 id="why-ragify-heading">
            A working pipeline
            <br />
            is only the beginning.
          </h2>

          <p className="why-ragify-intro">
            Building a RAG application is one problem. Knowing whether
            retrieval is effective, answers are grounded, and one
            configuration is genuinely better than another is a
            different problem.
          </p>

          <p className="why-ragify-intro">
            Ragify gives you a repeatable way to evaluate those decisions
            against your own documents and test cases.
          </p>
        </div>

        <div className="why-ragify-questions">
          <div className="why-questions-header">
            <span>Questions worth measuring</span>
          </div>

          <div className="why-question-list">
            {questions.map((question) => (
              <article
                className="why-question"
                key={question.number}
              >
                <span className="why-question-number">
                  {question.number}
                </span>

                <div className="why-question-content">
                  <h3>{question.title}</h3>
                  <p>{question.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}