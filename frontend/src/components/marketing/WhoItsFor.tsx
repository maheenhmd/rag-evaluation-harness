const audiences = [
  {
    number: '01',
    title: 'AI Engineers',
    description:
      'Compare retrieval approaches, inspect evaluation results, and trace weak answers back to the part of the pipeline causing them.',
  },
  {
    number: '02',
    title: 'RAG Developers',
    description:
      'Test chunking, retrieval, and generation settings before committing to a configuration or building further on top of it.',
  },
  {
    number: '03',
    title: 'Product & AI Teams',
    description:
      'Evaluate knowledge assistants against your own documents and create a shared, measurable standard for answer quality.',
  },
  {
    number: '04',
    title: 'Students & Researchers',
    description:
      'Experiment with retrieval systems using repeatable datasets, comparable runs, and results you can inspect.',
  },
]

export default function WhoItsFor() {
  return (
    <section
      className="who-section"
      aria-labelledby="who-heading"
    >
      <div className="container">
        <div className="who-heading">
          <p className="who-eyebrow">WHO IT’S FOR</p>

          <div className="who-heading-grid">
            <h2 id="who-heading">
              Built for people
              <br />
              making RAG work.
            </h2>

            <p>
              Ragify is for anyone who needs more than a working demo.
              It helps turn retrieval and generation choices into results
              that can be tested, compared, and explained.
            </p>
          </div>
        </div>

        <div className="who-list">
          {audiences.map((audience) => (
            <article
              className="who-item"
              key={audience.number}
            >
              <span className="who-number">
                {audience.number}
              </span>

              <h3>{audience.title}</h3>

              <p>{audience.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}