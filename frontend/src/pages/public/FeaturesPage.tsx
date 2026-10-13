import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import FinalCTA from '../../components/marketing/FinalCTA'

const groups = [
  {
    number: '01',
    title: 'Evaluation setup',
    description: 'Start with the knowledge your system actually uses.',
    items: [
      {
        title: 'Automatic Evaluation Dataset',
        body: 'Generate reusable questions and evidence-backed reference answers from your uploaded corpus.',
      },
    ],
  },
  {
    number: '02',
    title: 'Retrieval evaluation',
    description:
      'Compare how context is found, not just what an answer sounds like.',
    items: [
      {
        title: 'Retrieval Strategy Comparison',
        body: 'Compare strategy, chunk size, overlap and retrieved context against the same questions.',
      },
      {
        title: 'Semantic Retrieval',
        body: 'Retrieve context by meaning through embedding similarity.',
      },
      {
        title: 'BM25 Retrieval',
        body: 'Rank passages using keyword relevance when exact terminology matters.',
      },
      {
        title: 'Hybrid Retrieval',
        body: 'Combine semantic and keyword signals into a single retrieval strategy.',
      },
      {
        title: 'Retrieval Metrics',
        body: 'Measure Hit@K, Precision@K, Recall@K and MRR across comparable runs.',
      },
    ],
  },
  {
    number: '03',
    title: 'Answer quality',
    description:
      'Evaluate the generated answer as well as the context behind it.',
    items: [
      {
        title: 'Faithfulness',
        body: 'Measure whether answer claims are supported by retrieved context.',
      },
      {
        title: 'Relevance',
        body: 'Measure how directly the answer addresses the question.',
      },
      {
        title: 'Correctness',
        body: 'Compare the generated answer with a reference grounded in source evidence.',
      },
      {
        title: 'Hallucination Detection',
        body: 'Flag claims that lack support in the retrieved information.',
      },
    ],
  },
  {
    number: '04',
    title: 'Failure analysis & recommendation',
    description:
      'Connect evaluation results to the next engineering decision.',
    items: [
      {
        title: 'Failure Analysis',
        body: 'Trace weak answers back to missed retrieval, poor grounding, low relevance or unsupported claims.',
      },
      {
        title: 'Explainable Recommendations',
        body: 'See which configuration performed better, why it was selected and what should improve next.',
      },
    ],
  },
]

function FeatureVisual({ number }: { number: string }) {
  if (number === '01') {
    return (
      <div className="feature-visual feature-dataset" aria-hidden="true">
        <div className="feature-doc-lines">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="feature-dataset-arrow">→</div>

        <div className="feature-question-lines">
          <span />
          <span />
          <span />
        </div>
      </div>
    )
  }

  if (number === '02') {
    return (
      <div className="feature-visual feature-retrieval" aria-hidden="true">
        <div>
          <span>Semantic</span>
          <i className="retrieval-semantic" />
        </div>

        <div>
          <span>BM25</span>
          <i className="retrieval-bm25" />
        </div>

        <div className="feature-retrieval-best">
          <span>Hybrid</span>
          <i className="retrieval-hybrid" />
        </div>
      </div>
    )
  }

  if (number === '03') {
    return (
      <div className="feature-visual feature-quality" aria-hidden="true">
        <div>
          <span>Faithfulness</span>
          <strong>94</strong>
        </div>

        <div>
          <span>Relevance</span>
          <strong>91</strong>
        </div>

        <div>
          <span>Correctness</span>
          <strong>88</strong>
        </div>
      </div>
    )
  }

  return (
    <div className="feature-visual feature-recommendation" aria-hidden="true">
      <span>RECOMMENDED CONFIGURATION</span>

      <strong>Hybrid retrieval</strong>

      <div>
        <span>top_k 5</span>
        <span>chunk 512</span>
      </div>
    </div>
  )
}

export default function FeaturesPage() {
  return (
    <>
      <main className="features-page">
        <section className="features-hero">
          <div className="container features-hero-grid">
            <div>
              <p className="features-eyebrow">
                RAGIFY CAPABILITIES
              </p>

              <h1>
                See the whole
                <br />
                RAG system.
              </h1>
            </div>

            <div className="features-hero-copy">
              <p>
                Evaluate retrieval, answer quality and failure modes
                together so configuration decisions are based on evidence,
                not intuition.
              </p>

              <Link
                className="features-hero-link"
                to="/how-it-works"
              >
                See how it fits together
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <div className="container features-groups">
          {groups.map((group) => (
            <section
              className="features-group"
              key={group.number}
              aria-labelledby={`feature-${group.number}`}
            >
              <div className="features-group-heading">
                <span className="features-index">
                  {group.number}
                </span>

                <h2 id={`feature-${group.number}`}>
                  {group.title}
                </h2>

                <p>
                  {group.description}
                </p>

                <FeatureVisual number={group.number} />
              </div>

              <div className="features-items">
                {group.items.map((item) => (
                  <article key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <FinalCTA />
    </>
  )
}