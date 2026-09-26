package cloud_performance_api.model;

public class PerformanceReport {

    private int totalRequests;
    private double errorRate;
    private double averageResponseTime;
    private double p95ResponseTime;
    private double maxResponseTime;
    private double requestsPerSecond;

    public PerformanceReport(
            int totalRequests,
            double errorRate,
            double averageResponseTime,
            double p95ResponseTime,
            double maxResponseTime,
            double requestsPerSecond) {

        this.totalRequests = totalRequests;
        this.errorRate = errorRate;
        this.averageResponseTime = averageResponseTime;
        this.p95ResponseTime = p95ResponseTime;
        this.maxResponseTime = maxResponseTime;
        this.requestsPerSecond = requestsPerSecond;
    }

    public int getTotalRequests() {
        return totalRequests;
    }

    public double getErrorRate() {
        return errorRate;
    }

    public double getAverageResponseTime() {
        return averageResponseTime;
    }

    public double getP95ResponseTime() {
        return p95ResponseTime;
    }

    public double getMaxResponseTime() {
        return maxResponseTime;
    }

    public double getRequestsPerSecond() {
        return requestsPerSecond;
    }
}

