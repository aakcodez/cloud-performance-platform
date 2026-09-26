package cloud_performance_api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class PerformanceUploadController {

    private final Path uploadDirectory = Path.of("uploaded-projects");

    @PostMapping("/upload")
    public ResponseEntity<String> uploadProject(
            @RequestParam("files") MultipartFile[] files) throws IOException {

        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest()
                    .body("No project files were uploaded.");
        }

        Files.createDirectories(uploadDirectory);

        String projectName = getProjectName(files[0]);

        Path projectDirectory = uploadDirectory.resolve(projectName);

        Files.createDirectories(projectDirectory);

        for (MultipartFile file : files) {

            String relativePath = file.getOriginalFilename();

            if (relativePath == null || relativePath.isBlank()) {
                continue;
            }

            Path targetFile = projectDirectory.resolve(relativePath).normalize();

            // Prevent files from escaping the project directory.
            if (!targetFile.startsWith(projectDirectory.normalize())) {
                return ResponseEntity.badRequest()
                        .body("Invalid file path detected.");
            }

            if (file.isEmpty()) {
                continue;
            }

            Files.createDirectories(targetFile.getParent());

            file.transferTo(targetFile);
        }

        return ResponseEntity.ok(
                "Project uploaded successfully: " + projectName
        );
    }

    private String getProjectName(MultipartFile file) {

        String filename = file.getOriginalFilename();

        if (filename == null || filename.isBlank()) {
            return "uploaded-project";
        }

        String normalized = filename.replace("\\", "/");

        int slashIndex = normalized.indexOf('/');

        if (slashIndex > 0) {
            return normalized.substring(0, slashIndex);
        }

        return "uploaded-project";
    }
}
