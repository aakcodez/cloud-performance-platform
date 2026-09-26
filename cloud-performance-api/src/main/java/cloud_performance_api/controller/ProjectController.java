package cloud_performance_api.controller;

import cloud_performance_api.service.ProjectDetectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectController {

    private final ProjectDetectionService projectDetectionService;

    public ProjectController(ProjectDetectionService projectDetectionService) {
        this.projectDetectionService = projectDetectionService;
    }

    @GetMapping("/{projectName}/type")
    public ResponseEntity<String> detectProjectType(
            @PathVariable String projectName) {

        Path projectDirectory =
                Path.of("uploaded-projects").resolve(projectName).normalize();

        String projectType =
                projectDetectionService.detectProjectType(projectDirectory);

        return ResponseEntity.ok(projectType);
    }
}
