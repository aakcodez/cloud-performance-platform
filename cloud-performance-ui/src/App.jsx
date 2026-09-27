import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [apiOnline, setApiOnline] = useState(false);
  const [report, setReport] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health');

      if (!response.ok) {
        throw new Error();
      }

      setApiOnline(true);
    } catch {
      setApiOnline(false);
    }
  };

  const loadReport = async () => {
    try {
      const response = await fetch('/api/performance/report');

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setReport(data);
    } catch {
      setReport(null);
    }
  };

  const loadScore = async () => {
    try {
      const response = await fetch('/api/performance/score');

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setScore(data);
    } catch {
      setScore(null);
    }
  };

  const refreshData = async () => {
    setLoading(true);

    await Promise.all([
      checkHealth(),
      loadReport(),
      loadScore(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="wrap">

      <header>
        <div>
          <h1>Cloud Performance Platform</h1>

          <p className="sub">
            k6 load test results, extracted metrics, and scoring
          </p>
        </div>

        <div className="health">
          <span
            className={
              apiOnline
                ? 'dot up'
                : 'dot down'
            }
          />

          <span>
            {apiOnline
              ? 'API online'
              : 'API unreachable'}
          </span>
        </div>
      </header>

      <div className="grid">

        <div>

          <div className="card">
            <h2>Upload report</h2>

            <div className="drop">
              <p>
                <strong>
                  k6-summary.json
                </strong>
              </p>

              <div className="file">
                Report upload will be connected
                to the backend next.
              </div>
            </div>

            <button disabled>
              Upload report
            </button>

            <div className="status-line">
              Project-based performance analysis
              is being integrated.
            </div>
          </div>

          <div className="card">
            <h2>Actions</h2>

            <button
              className="ghost"
              onClick={refreshData}
              disabled={loading}
            >
              {loading
                ? 'Refreshing…'
                : 'Refresh report & score'}
            </button>
          </div>

        </div>

        <div>

          <div className="card">
            <h2>Performance score</h2>

            {score ? (
              <Score score={score} />
            ) : (
              <p className="empty">
                No score yet — upload a report
                to calculate one.
              </p>
            )}
          </div>

          <div className="card">
            <h2>Extracted metrics</h2>

            {report ? (
              <Report report={report} />
            ) : (
              <p className="empty">
                No report loaded yet.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

function Score({ score }) {
  const rating = score.rating || '—';

  const ratingLower =
    rating.toLowerCase();

  let ratingClass = 'poor';

  if (ratingLower.includes('excel')) {
    ratingClass = 'excellent';
  } else if (ratingLower.includes('good')) {
    ratingClass = 'good';
  } else if (ratingLower.includes('improve')) {
    ratingClass = 'needs';
  }

  return (
    <>
      <div className="score-row">

        <div>
          <div className="score-num">
            {typeof score.score === 'number'
              ? score.score.toFixed(1)
              : score.score}
          </div>

          <div
            className={`rating ${ratingClass}`}
          >
            {rating}
          </div>
        </div>

      </div>

      <div className="bars">

        <ScoreBar
          label="Response time"
          value={score.responseTimeScore}
        />

        <ScoreBar
          label="Reliability"
          value={score.reliabilityScore}
        />

        <ScoreBar
          label="Throughput"
          value={score.throughputScore}
        />

      </div>
    </>
  );
}

function ScoreBar({ label, value }) {
  const numericValue =
    typeof value === 'number'
      ? value
      : 0;

  return (
    <div className="bar-row">

      <div className="label">
        <span>{label}</span>

        <span>
          {numericValue}
        </span>
      </div>

      <div className="bar-track">
        <div
          className="bar-fill"
          style={{
            width: `${numericValue}%`,
          }}
        />
      </div>

    </div>
  );
}

function Report({ report }) {
  const items = [
    [
      'Total requests',
      report.totalRequests,
    ],
    [
      'Error rate',
      `${report.errorRate ?? '—'}%`,
    ],
    [
      'Avg response',
      `${report.averageResponseTime ?? '—'} ms`,
    ],
    [
      'P95 response',
      `${report.p95ResponseTime ?? '—'} ms`,
    ],
    [
      'Max response',
      `${report.maxResponseTime ?? '—'} ms`,
    ],
    [
      'Req / sec',
      report.requestsPerSecond ?? '—',
    ],
  ];

  return (
    <div className="metrics">

      {items.map(([label, value]) => (
        <div
          className="metric"
          key={label}
        >
          <div className="v">
            {value}
          </div>

          <div className="l">
            {label}
          </div>
        </div>
      ))}

    </div>
  );
}

export default App;
