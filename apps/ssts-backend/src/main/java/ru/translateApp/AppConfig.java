package ru.translateApp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Value("${projects.directory}")
    private String dataDirectory;

    @Value("${config.json}")
    private String configJSON;

    @Value("${projects.json}")
    private String projectsJSON;

    public String getProjectsDirectory() {
        return dataDirectory;
    }

    public String getConfigJSON() {
        return configJSON;
    }

    public String getProjectsJSON() {
        return projectsJSON;
    }
}
