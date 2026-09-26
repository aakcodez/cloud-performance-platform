package cloud_performance_api.service;

import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class ProjectDetectionService {

    public String detectProjectType(Path projectDirectory) {

        if (Files.exists(projectDirectory.resolve("pom.xml"))) {
            return "Java/Maven";
        }

        return "Unsupported";
    }
}
