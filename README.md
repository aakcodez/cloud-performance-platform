# Cloud Performance Platform

A Spring Boot-based performance analysis platform that runs load tests using **k6**, processes performance reports, and calculates an overall application performance score based on response time, reliability, and throughput.

## Overview

The Cloud Performance Platform provides a simple workflow for evaluating the performance of a web application.

The current implementation:

* Runs HTTP performance tests using k6
* Generates a JSON performance summary
* Uploads the generated report to the Spring Boot application
* Extracts key performance metrics
* Calculates individual performance scores
* Produces an overall performance score and rating
* Runs the application inside a Docker container
* Uses GitHub Actions for automated CI

## Architecture

```text
                    ┌──────────────────┐
                    │   Target API     │
                    │ Spring Boot API  │
                    └────────┬─────────┘
                             │
                             │ HTTP requests
                             ▼
                    ┌──────────────────┐
                    │       k6         │
                    │ Performance Test │
                    └────────┬─────────┘
                             │
                             │ k6-summary.json
                             ▼
                    ┌──────────────────┐
                    │ Spring Boot API  │
                    │ Report Upload    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Report Analysis  │
                    │ & Score Engine   │
                    └────────┬─────────┘
                             │
                    ┌────────┴─────────┐
                    ▼                  ▼
             Performance Report   Performance Score
```

## Technologies

* **Java 21**
* **Spring Boot**
* **Maven**
* **k6**
* **Docker**
* **GitHub Actions**
* **Jackson**
* **REST API**

## Project Structure

```text
cloud-performance-platform/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── src/
│   └── main/
│       ├── java/
│       │   └── cloud_performance_api/
│       │       ├── controller/
│       │       │   ├── PerformanceController.java
│       │       │   └── PerformanceUploadController.java
│       │       │
│       │       ├── model/
│       │       │   ├── PerformanceReport.java
│       │       │   └── PerformanceScore.java
│       │       │
│       │       └── service/
│       │           └── PerformanceReportService.java
│       │
│       └── resources/
│           └── application.properties
│
├── performance-test.js
├── Dockerfile
├── pom.xml
├── mvnw
└── README.md
```

## Performance Testing with k6

The project uses k6 to generate load against the application health endpoint.

The current test configuration uses:

* **10 virtual users**
* **30 second test duration**
* 1 second sleep between iterations
* HTTP status validation
* Response-time threshold
* HTTP failure-rate threshold

The main endpoint tested is:

```text
GET /api/health
```

### k6 thresholds

```text
95th percentile response time < 500 ms
HTTP failure rate < 1%
```

The test generates a `k6-summary.json` report containing metrics used by the Spring Boot application.

## Performance Metrics

The application extracts the following metrics from the k6 report:

| Metric                | Description                        |
| --------------------- | ---------------------------------- |
| Total Requests        | Total number of HTTP requests      |
| Error Rate            | Percentage of failed HTTP requests |
| Average Response Time | Average HTTP request duration      |
| P95 Response Time     | 95th percentile request duration   |
| Maximum Response Time | Maximum observed request duration  |
| Requests Per Second   | Request throughput                 |

## REST API

### Health Check

```http
GET /api/health
```

Used as the target endpoint for the k6 performance test.

### Upload Performance Report

```http
POST /api/performance/upload
```

Uploads the generated k6 JSON report.

The uploaded file is stored as:

```text
performance-reports/k6-summary.json
```

### Get Performance Report

```http
GET /api/performance/report
```

Returns the extracted performance metrics.

Example response:

```json
{
  "totalRequests": 300,
  "errorRate": 0.0,
  "averageResponseTime": 25.4,
  "p95ResponseTime": 42.1,
  "maxResponseTime": 75.3,
  "requestsPerSecond": 10.0
}
```

### Get Performance Score

```http
GET /api/performance/score
```

Returns the calculated performance score and individual category scores.

Example:

```json
{
  "score": 95.0,
  "rating": "Excellent",
  "responseTimeScore": 100.0,
  "reliabilityScore": 100.0,
  "throughputScore": 85.0
}
```

## Scoring System

The platform calculates three category scores using the metrics extracted from the k6 performance report.

### 1. Response Time Score

The response-time score starts at 100 and is reduced based on the P95 response time.

| P95 Response Time | Score Deduction |
| ----------------- | --------------: |
| ≤ 100 ms          |               0 |
| > 100 ms          |              10 |
| > 200 ms          |              20 |
| > 500 ms          |              40 |

### 2. Reliability Score

The reliability score starts at 100 and is reduced according to the HTTP error rate.

| Error Rate | Score Deduction |
| ---------- | --------------: |
| ≤ 1%       |               0 |
| > 1%       |              15 |
| > 5%       |              30 |

### 3. Throughput Score

The throughput score starts at 100 and is reduced according to requests per second.

| Requests Per Second | Score Deduction |
| ------------------- | --------------: |
| ≥ 10                |               0 |
| < 10                |              15 |
| < 5                 |              30 |

### Overall Score

The overall performance score is the average of the three category scores:

```text
Overall Score =
(Response Time Score + Reliability Score + Throughput Score) / 3
```

The resulting score is mapped to a rating:

| Overall Score | Rating            |
| ------------- | ----------------- |
| ≥ 90          | Excellent         |
| ≥ 75          | Good              |
| ≥ 50          | Needs Improvement |
| < 50          | Poor              |

The scoring logic is implemented in `PerformanceReportService.java`.

## Running Locally

### Prerequisites

Install:

* Java 21
* Maven or use the included Maven Wrapper
* k6
* Docker (optional)

### 1. Clone the repository

```bash
git clone https://github.com/aakcodez/cloud-performance-platform.git
cd cloud-performance-platform
```

### 2. Build the application

```bash
./mvnw clean package
```

### 3. Run the Spring Boot application

```bash
./mvnw spring-boot:run
```

The application runs on:

```text
http://localhost:8080
```

### 4. Run the k6 performance test

With the Spring Boot application running:

```bash
k6 run performance-test.js
```

The test generates performance metrics that can be exported as a JSON summary for analysis.

## Docker

Build the Docker image:

```bash
docker build -t cloud-performance-api:1.0 .
```

Run the container:

```bash
docker run -p 8080:8080 cloud-performance-api:1.0
```

The application will then be available at:

```text
http://localhost:8080
```

## CI/CD

GitHub Actions is used to automate the build and test process.

The CI pipeline:

1. Checks out the source code
2. Sets up Java 21
3. Configures Maven caching
4. Runs the test suite
5. Builds the Spring Boot application

```text
Git Push / Pull Request
          │
          ▼
   GitHub Actions
          │
          ▼
     Java 21 Setup
          │
          ▼
       Run Tests
          │
          ▼
     Maven Build
          │
          ▼
       Build JAR
```

## Future Improvements

Planned improvements include:

* Azure cloud deployment
* Automated performance-test execution in CI/CD
* Persistent storage for performance reports
* Performance history and trend analysis
* Dashboard for visualizing performance metrics
* Configurable scoring thresholds
* Container image publishing
* Automated performance regression detection

## Author

**Anvita A Kattimani**

MCA Student | Software & Cloud/DevOps Projects

GitHub: [@aakcodez](https://github.com/aakcodez)

## Current Development Status

The platform is currently being developed in stages.

### Implemented

* Spring Boot performance analysis backend
* k6-based HTTP performance testing
* Performance report extraction
* Response time, reliability, and throughput scoring
* REST APIs for health, reports, and scores
* Docker support for the backend
* GitHub Actions CI pipeline
* React-based performance dashboard
* Project upload foundation for complete project folders
* Java/Maven project type detection
* Initial project build workflow

### Planned

* Run uploaded projects in isolated Docker environments
* Automatically execute performance tests against uploaded projects
* Support additional project types such as Node.js and Python
* Display project analysis and performance results through the React dashboard
* Add performance history and comparison
* Improve security and resource isolation for uploaded projects

