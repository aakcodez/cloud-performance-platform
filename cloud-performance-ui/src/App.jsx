import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [apiOnline, setApiOnline] = useState(false);
  const [report, setReport] = useState(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchReport = () => {
    fetch('/api/performance/report')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Performance report unavailable');
        }

        return response.json();
      })
      .then((data) => {
        setReport(data);
      })
      .catch((error) => {
        console.error('Report error:', error);
        setReport(null);
      });
  };

  useEffect(() => {
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error('API unavailable');
        }

        return response.text();
      })
      .then((data) => {
        setApiStatus(data);
        setApiOnline(true);
      })
      .catch((error) => {
        console.error('API error:', error);
        setApiStatus('API is unavailable');
        setApiOnline(false);
      });

    fetchReport();
  }, []);

  const handleProjectFolderChange = (event) => {
    const allFiles = Array.from(event.target.files);

    if (allFiles.length === 0) {
      setSelectedFiles([]);
      setProjectName('');
      setUploadStatus('');
      return;
    }

    const ignoredDirectories = [
      'build',
      '.git',
      '.dart_tool',
      '.idea',
      '.gradle',
      'node_modules',
      'target',
    ];

    const files = allFiles.filter((file) => {
      const path = file.webkitRelativePath || file.name;
      const parts = path.split('/');

      return !parts.some((part) =>
        ignoredDirectories.includes(part)
      );
    });

    setSelectedFiles(files);

    const firstPath = files[0]?.webkitRelativePath;

    if (firstPath) {
      const firstFolder = firstPath.split('/')[0];
      setProjectName(firstFolder);
    } else {
      setProjectName('Selected Project');
    }

    const ignoredCount = allFiles.length - files.length;

    setUploadStatus(
      `${files.length} files selected` +
      (ignoredCount > 0
        ? ` (${ignoredCount} generated/unnecessary files excluded)`
        : '')
    );
  };
  const uploadProject = async () => {
    if (selectedFiles.length === 0) {
      setUploadStatus('Please select a project folder first.');
      return;
    }

    setIsUploading(true);
    setUploadStatus(
      `Uploading ${selectedFiles.length} files...`
    );

    try {
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append(
          'files',
          file,
          file.webkitRelativePath || file.name
        );
      });

      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData,
      });

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || 'Project upload failed.');
      }

      setUploadStatus(message);

    } catch (error) {
      console.error('Upload error:', error);

      setUploadStatus(
        `Upload failed: ${error.message}`
      );

    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app">

      <header className="header">
        <div>
          <h1>Cloud Performance Platform</h1>
          <p>Application Performance Dashboard</p>
        </div>

        <div className="status-badge">
          <span
            className={`status-dot ${apiOnline ? 'online' : 'offline'}`}
          ></span>

          {apiOnline ? 'API Online' : 'API Offline'}
        </div>
      </header>

      <main className="dashboard">

        <section className="status-card">
          <div>
            <p className="label">API STATUS</p>
            <h2>{apiStatus}</h2>
          </div>

          <div
            className={`health-icon ${
              apiOnline ? 'healthy' : 'unhealthy'
            }`}
          >
            {apiOnline ? '✓' : '!'}
          </div>
        </section>

        <section className="upload-card">

          <div>
            <p className="label">PROJECT ANALYSIS</p>

            <h2>Analyze Your Application</h2>

            <p className="upload-description">
              Select your complete project folder. The platform will
              preserve the folder structure and use it for performance
              analysis.
            </p>
          </div>

          <div className="upload-controls">

            <label className="file-input">
              <input
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleProjectFolderChange}
              />

              <span>
                {projectName
                  ? `📁 ${projectName}`
                  : 'Choose Project Folder'}
              </span>
            </label>

            <button
              onClick={uploadProject}
              disabled={
                isUploading || selectedFiles.length === 0
              }
            >
              {isUploading ? 'Uploading...' : 'Analyze Project'}
            </button>

          </div>

          {selectedFiles.length > 0 && (
            <div className="upload-status">

              <p>
                <strong>{projectName}</strong>
              </p>

              <p>{selectedFiles.length} files selected</p>

              <p>Folder structure detected ✓</p>

            </div>
          )}

          {uploadStatus && (
            <p className="upload-status">
              {uploadStatus}
            </p>
          )}

        </section>

        {report ? (
          <>
            <div className="section-heading">
              <p className="label">PERFORMANCE</p>
              <h2>Application Performance</h2>
            </div>

            <section className="metrics-grid">

              <div className="metric-card">
                <p className="label">AVERAGE RESPONSE</p>
                <h2>
                  {report.averageResponseTime.toFixed(2)}
                  <span> ms</span>
                </h2>
              </div>

              <div className="metric-card">
                <p className="label">P95 RESPONSE</p>
                <h2>
                  {report.p95ResponseTime.toFixed(2)}
                  <span> ms</span>
                </h2>
              </div>

              <div className="metric-card">
                <p className="label">MAX RESPONSE</p>
                <h2>
                  {report.maxResponseTime.toFixed(2)}
                  <span> ms</span>
                </h2>
              </div>

              <div className="metric-card">
                <p className="label">TOTAL REQUESTS</p>
                <h2>{report.totalRequests}</h2>
              </div>

              <div className="metric-card">
                <p className="label">ERROR RATE</p>
                <h2>
                  {report.errorRate.toFixed(2)}
                  <span> %</span>
                </h2>
              </div>

              <div className="metric-card">
                <p className="label">REQUESTS / SEC</p>
                <h2>
                  {report.requestsPerSecond.toFixed(2)}
                </h2>
              </div>

            </section>

            <div className="section-heading">
              <p className="label">QUALITY CHECKS</p>
              <h2>Performance Thresholds</h2>
            </div>

            <section className="threshold-card">

              <div className="threshold-row">
                <div>
                  <strong>P95 Response Time</strong>
                  <p>Target: less than 500 ms</p>
                </div>

                <span
                  className={
                    report.p95ResponseTime < 500
                      ? 'pass'
                      : 'fail'
                  }
                >
                  {report.p95ResponseTime < 500
                    ? '✓ PASS'
                    : '✗ FAIL'}
                </span>
              </div>

              <div className="threshold-row">
                <div>
                  <strong>Error Rate</strong>
                  <p>Target: less than 1%</p>
                </div>

                <span
                  className={
                    report.errorRate < 1
                      ? 'pass'
                      : 'fail'
                  }
                >
                  {report.errorRate < 1
                    ? '✓ PASS'
                    : '✗ FAIL'}
                </span>
              </div>

            </section>
          </>
        ) : (
          <section className="status-card">
            <div>
              <p className="label">PERFORMANCE REPORT</p>
              <h2>No performance report available yet</h2>
              <p>
                Analyze a project to generate performance metrics.
              </p>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default App;
