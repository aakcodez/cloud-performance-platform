package cloud_performance_api.service;

import cloud_performance_api.model.PerformanceReport;
import cloud_performance_api.model.PerformanceScore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.nio.file.Path;

import java.io.File;
import java.io.IOException;

@Service
public class PerformanceReportService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    @Value("${performance.report.path:k6-summary.json}")
    private String reportPath;

    public PerformanceReport getPerformanceReport() throws IOException {

        File file = Path.of(reportPath).toFile();

        JsonNode root = objectMapper.readTree(file);

        JsonNode metrics = root.get("metrics");

        int totalRequests =
                metrics.get("http_reqs").get("count").asInt();

        double errorRate =
                metrics.get("http_req_failed").get("value").asDouble();

        double averageResponseTime =
                metrics.get("http_req_duration").get("avg").asDouble();

        double p95ResponseTime =
                metrics.get("http_req_duration").get("p(95)").asDouble();

        double maxResponseTime =
                metrics.get("http_req_duration").get("max").asDouble();

        double requestsPerSecond =
                metrics.get("http_reqs").get("rate").asDouble();

                return new PerformanceReport(
                totalRequests,
                errorRate,
                averageResponseTime,
                p95ResponseTime,
                maxResponseTime,
                requestsPerSecond
        );
    }

    public PerformanceScore calculateScore() throws IOException {

        PerformanceReport report = getPerformanceReport();

        double responseTimeScore = 100.0;
        double reliabilityScore = 100.0;
        double throughputScore = 100.0;

        // Response Time Score
        if (report.getP95ResponseTime() > 500) {
                responseTimeScore -= 40;
        } else if (report.getP95ResponseTime() > 200) {
                responseTimeScore -= 20;
        } else if (report.getP95ResponseTime() > 100) {
                responseTimeScore -= 10;
        }

        // Reliability Score
        if (report.getErrorRate() > 0.05) {
                reliabilityScore -= 30;
        } else if (report.getErrorRate() > 0.01) {
                reliabilityScore -= 15;
        }

        // Throughput Score
        if (report.getRequestsPerSecond() < 5) {
                throughputScore -= 30;
        } else if (report.getRequestsPerSecond() < 10) {
                throughputScore -= 15;
        }

        // Overall Score
        double score =
                (responseTimeScore +
                reliabilityScore +
                throughputScore) / 3.0;

        String rating;

        if (score >= 90) {
                rating = "Excellent";
        } else if (score >= 75) {
                rating = "Good";
        } else if (score >= 50) {
                rating = "Needs Improvement";
        } else {
                rating = "Poor";
        }

                return new PerformanceScore(
                score,
                rating,
                responseTimeScore,
                reliabilityScore,
                throughputScore
        );
    }
}