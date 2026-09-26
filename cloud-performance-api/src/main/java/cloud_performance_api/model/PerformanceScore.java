package cloud_performance_api.model;

public class PerformanceScore {

    private double score;
    private String rating;

    private double responseTimeScore;
    private double reliabilityScore;
    private double throughputScore;

    public PerformanceScore(
            double score,
            String rating,
            double responseTimeScore,
            double reliabilityScore,
            double throughputScore) {

        this.score = score;
        this.rating = rating;
        this.responseTimeScore = responseTimeScore;
        this.reliabilityScore = reliabilityScore;
        this.throughputScore = throughputScore;
    }

    public double getScore() {
        return score;
    }

    public String getRating() {
        return rating;
    }

    public double getResponseTimeScore() {
        return responseTimeScore;
    }

    public double getReliabilityScore() {
        return reliabilityScore;
    }

    public double getThroughputScore() {
        return throughputScore;
    }
}