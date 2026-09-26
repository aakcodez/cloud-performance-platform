package cloud_performance_api.controller;

import cloud_performance_api.service.ProjectBuildService;
import cloud_performance_api.service.ProjectDetectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectController {

    private final ProjectDetectionService projectDetectionService;
    private final ProjectBuildService projectBuildService;

    public ProjectController(
            ProjectDetectionService projectDetectionService,
            ProjectBuildService projectBuildService) {

        this.projectDetectionService = projectDetectionService;
        this.projectBuildService = projectBuildService;
    }

    @GetMapping("/{projectName}/type")
    public ResponseEntity<String> detectProjectType(
            @PathVariable String projectName) {

        Path projectDirectory = getProjectDirectory(projectName);

        if (projectDirectory == null ||
                !Files.isDirectory(projectDirectory)) {

            return ResponseEntity.notFound().build();
        }

        String projectType =
                projectDetectionService.detectProjectType(projectDirectory);

        return ResponseEntity.ok(projectType);
    }

    @PostMapping("/{projectName}/build")
    public ResponseEntity<String> buildProject(
            @PathVariable String projectName)
            throws Exception {

        Path projectDirectory = getProjectDirectory(projectName);

        if (projectDirectory == null ||
                !Files.isDirectory(projectDirectory)) {

            return ResponseEntity.notFound().build();
        }

        String projectType =
                projectDetectionService.detectProjectType(projectDirectory);

        if (!"Java/Maven".equals(projectType)) {

            return ResponseEntity.badRequest()
                    .body("Unsupported project type: " + projectType);
        }

        String result =
                projectBuildService.buildProject(projectDirectory);

        return ResponseEntity.ok(result);
    }

    private Path getProjectDirectory(String projectName) {

        Path baseDirectory =
                Path.of("uploaded-projects").toAbsolutePath().normalize();

        Path projectDirectory =
                baseDirectory.resolve(projectName).normalize();

        if (!projectDirectory.startsWith(baseDirectory)) {
            return null;
        }

        return projectDirectory;
    }
}
