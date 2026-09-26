package cloud_performance_api.controller;

import cloud_performance_api.model.PerformanceReport;
import cloud_performance_api.model.PerformanceScore;
import cloud_performance_api.service.PerformanceReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
public class PerformanceController {

    private final PerformanceReportService performanceReportService;

    public PerformanceController(PerformanceReportService performanceReportService) {
        this.performanceReportService = performanceReportService;
    }

    @GetMapping("/api/performance/report")
    public PerformanceReport getPerformanceReport() throws IOException {
        return performanceReportService.getPerformanceReport();
    }

    @GetMapping("/api/performance/score")
    public PerformanceScore getPerformanceScore() throws IOException {
        return performanceReportService.calculateScore();
    }
}