package cloud_performance_api.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class ProjectBuildService {

    public String buildProject(Path projectDirectory)
            throws IOException, InterruptedException {

        String buildCommand;

        if (Files.exists(projectDirectory.resolve("mvnw"))) {
            buildCommand = "./mvnw";
        } else {
            buildCommand = "mvn";
        }

        ProcessBuilder processBuilder = new ProcessBuilder(
                buildCommand,
                "clean",
                "package",
                "-DskipTests"
        );

        processBuilder.directory(projectDirectory.toFile());
        processBuilder.inheritIO();

        Process process = processBuilder.start();

        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new IOException(
                    "Project build failed with exit code: " + exitCode
            );
        }

        return "Project built successfully";
    }
}
