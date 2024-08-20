package ru.translateApp.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.translateApp.AppConfig;
import ru.translateApp.entity.Data;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;

@RestController
@RequestMapping("/api/projectMetaData")
public class ProjectMetaDataController {

    @Autowired
    private AppConfig appConfig;

    @GetMapping("/{projectName}")
    @ResponseBody
    public Data getProjectMetaData(Authentication authentication,
                                   @PathVariable String projectName) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        Data projectData;
        projectData = objectMapper.readValue(new File(appConfig.getProjectsDirectory() + projectName + "/data.json"), new TypeReference<>() {});

        return projectData;
    }

    @GetMapping("/{projectName}/getStatusOfTranslatedPage")
    @ResponseBody
    public HashMap<String, String> getStatusOfTranslatedPage(@PathVariable String projectName) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        Data projectData;
        projectData = objectMapper.readValue(new File(appConfig.getProjectsDirectory() + projectName + "/data.json"), new TypeReference<>() {});

        HashMap<String, String> response = new HashMap<>();
        response.put("status", projectData.getStatusOfTranslatedPage());

        return response;
    }

    @PostMapping("/{projectName}/setStatusOfTranslatedPage")
    @ResponseBody
    public ResponseEntity<String> setStatusOfTranslatedPage(@PathVariable String projectName, @RequestBody HashMap<String, String> newStatusOfTranslatedPage) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        Data projectData;
        projectData = objectMapper.readValue(new File(appConfig.getProjectsDirectory() + projectName + "/data.json"), new TypeReference<>() {});
        projectData.setStatusOfTranslatedPage(newStatusOfTranslatedPage.get("status"));
        objectMapper.writeValue(new File(appConfig.getProjectsDirectory() + projectName + "/data.json"), projectData);

        return ResponseEntity.status(HttpStatus.CREATED).body("Status of the translated page is set");
    }
}
