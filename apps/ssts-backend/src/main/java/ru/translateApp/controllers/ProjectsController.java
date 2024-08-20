package ru.translateApp.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.translateApp.AppConfig;
import ru.translateApp.entity.Data;
import ru.translateApp.entity.PathInfo;
import ru.translateApp.entity.Project;
import ru.translateApp.entity.User;
import ru.translateApp.security.SecurityConfig;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api")
public class ProjectsController {

    @Autowired
    private AppConfig appConfig;

    @Autowired
    private SecurityConfig securityConfig;

    @Autowired
    ObjectMapper objectMapper;

    @GetMapping("/getProjects")
    @ResponseBody
    public List<Map<String, String>> getProjects(Authentication authentication) {
        String authenticatedUser = authentication.getName();
        ObjectMapper objectMapper = new ObjectMapper();
        List<Map<String, String>> projects = new ArrayList<>();

        try {
            File configFile = new File(appConfig.getProjectsJSON());
            projects = objectMapper.readValue(configFile, new TypeReference<>() {});
            if (authenticatedUser.equals("admin")) {
                return projects;
            } else {
                projects = projects.stream().filter(entry -> entry.get("login").equals(authenticatedUser)).collect(Collectors.toList());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return projects;
    }

    @PostMapping("/changeProjectCredentials")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> prepareProject(@RequestBody Map<String, String> requestBody) throws IOException {
        Map<String, String> response = new HashMap<>();

        try {
            String projectName = requestBody.get("projectName");
            String projectsJsonPath = appConfig.getProjectsJSON();
            File projectsJsonFile = new File(projectsJsonPath);
            List<Project> projects;
            projects = objectMapper.readValue(projectsJsonFile, new TypeReference<>() {});
            projects.stream()
                            .filter(project -> project.getName().equals(projectName))
                                    .forEach(project -> {
                                        project.setLogin(requestBody.get("newLogin"));
                                        project.setPassword(requestBody.get("newPassword"));
                                    });
            objectMapper.writeValue(projectsJsonFile, projects);

            File configFile = new File(appConfig.getConfigJSON());
            List<User> users;
            users = objectMapper.readValue(configFile, new TypeReference<>() {});
            boolean translatorExists = users.stream().anyMatch(user -> user.getLogin().equals(requestBody.get("currentLogin")));

            if (!translatorExists) {
                User newTranslator = new User();
                newTranslator.setLogin(requestBody.get("newLogin"));
                newTranslator.setPassword(requestBody.get("newPassword"));
                newTranslator.setRole("user");
                users.add(newTranslator);

                securityConfig.addUserToInMemory(requestBody.get("newLogin"), requestBody.get("newPassword"), "USER");
            } else { // ToDo: If there is a translator with this username, do we replace his password?
                users.stream()
                        .filter(user -> user.getLogin().equals(requestBody.get("currentLogin")))
                        .forEach(user -> {
                            user.setPassword(requestBody.get("newPassword"));
                        });

                securityConfig.addUserToInMemory(requestBody.get("newLogin"), requestBody.get("newPassword"), "USER");
            }
            objectMapper.writeValue(configFile, users);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error when changing login and password: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/deleteProject/{projectName}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseBody
    public String deleteProject(@PathVariable String projectName) {
        List<Map<String, String>> projects;

        try {
            File configFile = new File(appConfig.getProjectsJSON());
            projects = objectMapper.readValue(configFile, new TypeReference<>() {});
            boolean projectRemoved = projects.removeIf(project -> project.get("name").equals(projectName));
            if (projectRemoved) {
                objectMapper.writeValue(configFile, projects);
                String projectFolderPath = appConfig.getProjectsDirectory() + projectName;
                File projectFolder = new File(projectFolderPath);
                if (projectFolder.exists()) {
                    FileUtils.deleteDirectory(projectFolder);
                    return "Project " + projectName + " successfully deleted, along with the folder";
                } else {
                    return "Project " + projectName + " successfully deleted, but its folder was not found";
                }
            } else {
                return "Project " + projectName + " not found";
            }
        } catch (IOException e) {
            e.printStackTrace();
            return "An error occurred while deleting the project " + projectName;
        }
    }

    @GetMapping("/resultZip/{projectName}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseBody
    public ResponseEntity<Resource> getResultZip(@PathVariable String projectName, Authentication authentication) throws IOException {
        String sourceFile2 = appConfig.getProjectsDirectory() + projectName + "/work";
        FileOutputStream fos2 = new FileOutputStream(appConfig.getProjectsDirectory() + projectName + "/workResult.zip");
        ZipOutputStream zipOut2 = new ZipOutputStream(fos2);
        File fileToZip2 = new File(sourceFile2);
        zipFile(fileToZip2, fileToZip2.getName(), zipOut2);
        zipOut2.close();
        fos2.close();

        String resultFolderPath = appConfig.getProjectsDirectory() + projectName + "/result";
        File folder = new File(resultFolderPath);

        if (!folder.exists()) {
            folder.mkdirs();
        }

        unzip(appConfig.getProjectsDirectory() + projectName + "/workResult.zip", appConfig.getProjectsDirectory() + projectName + "/result");

        Map<String, String> hashsWordsCommon;
        hashsWordsCommon = objectMapper.readValue(new File(appConfig.getProjectsDirectory() + projectName + "/hashsWordsCommon.json"), new TypeReference<>() {});
        Data data = new Data();
        data = objectMapper.readValue(new File(appConfig.getProjectsDirectory() + projectName + "/data.json"), new TypeReference<>() {});
        for (PathInfo pathInfo : data.getPathsToHTML()) {
            String inputFilePath = pathInfo.getPath().replace(appConfig.getProjectsDirectory() + projectName, appConfig.getProjectsDirectory() + projectName + "/result");
            try {
                for (String key : hashsWordsCommon.keySet()) {
                    String content = new String(Files.readAllBytes(Paths.get(inputFilePath)));
                    String modifiedContent = content.replaceAll(key, hashsWordsCommon.get(key));
                    Files.write(Path.of(inputFilePath), modifiedContent.getBytes());
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
            File jsonFile = new File(inputFilePath.substring(0, inputFilePath.lastIndexOf("/")) + "/hashWord" + inputFilePath.substring(inputFilePath.lastIndexOf("/") + 1).replace("html", "json"));
            jsonFile.delete();
        }

        String sourceFile = appConfig.getProjectsDirectory() + projectName + "/result/work";
        FileOutputStream fos = new FileOutputStream(appConfig.getProjectsDirectory() + projectName + "/dirCompressed.zip");
        ZipOutputStream zipOut = new ZipOutputStream(fos);

        File fileToZip = new File(sourceFile);
        zipFile2(fileToZip, "", zipOut);
        zipOut.close();
        fos.close();

        Path filePath = Paths.get(appConfig.getProjectsDirectory() + projectName + "/dirCompressed.zip").toAbsolutePath();
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists()) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/downloadSourceText/{projectName}")
    @ResponseBody
    public ResponseEntity<Resource> getFileWithSourceText(@PathVariable String projectName, Authentication authentication) throws IOException {
        Path filePath = Paths.get(appConfig.getProjectsDirectory() + projectName + "/All.txt").toAbsolutePath();
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists()) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    private static void zipFile(File fileToZip, String fileName, ZipOutputStream zipOut) throws IOException {
        if (fileToZip.isDirectory()) {
            if (fileName.endsWith("/")) {
                zipOut.putNextEntry(new ZipEntry(fileName));
                zipOut.closeEntry();
            } else {
                zipOut.putNextEntry(new ZipEntry(fileName + "/"));
                zipOut.closeEntry();
            }
            File[] children = fileToZip.listFiles();
            for (File childFile : children) {
                zipFile(childFile, fileName + "/" + childFile.getName(), zipOut);
            }
            return;
        }
        FileInputStream fis = new FileInputStream(fileToZip);
        ZipEntry zipEntry = new ZipEntry(fileName);
        zipOut.putNextEntry(zipEntry);
        byte[] bytes = new byte[1024];
        int length;
        while ((length = fis.read(bytes)) >= 0) {
            zipOut.write(bytes, 0, length);
        }
        fis.close();
    }

    private static void zipFile2(File fileToZip, String parentDirectory, ZipOutputStream zipOut) throws IOException {
        if (fileToZip.isDirectory()) {
            File[] children = fileToZip.listFiles();
            for (File childFile : children) {
                zipFile2(childFile, parentDirectory + childFile.getName() + (childFile.isDirectory() ? "/" : ""), zipOut);
            }
            return;
        }
        try (FileInputStream fis = new FileInputStream(fileToZip)) {
            ZipEntry zipEntry = new ZipEntry(parentDirectory);
            zipOut.putNextEntry(zipEntry);

            byte[] bytes = new byte[1024];
            int length;
            while ((length = fis.read(bytes)) >= 0) {
                zipOut.write(bytes, 0, length);
            }
            zipOut.closeEntry();
        }
    }

    public void unzip(String zipFilePath, String destDir) throws IOException {
        try (ZipInputStream zipIn = new ZipInputStream(new FileInputStream(zipFilePath))) {
            ZipEntry entry;
            while ((entry = zipIn.getNextEntry()) != null) {
                String filePath = destDir + File.separator + entry.getName();
                if (!entry.isDirectory()) {
                    extractFile(zipIn, filePath);
                } else {
                    File dir = new File(filePath);
                    dir.mkdir();
                }
                zipIn.closeEntry();
            }
        }
    }

    private void extractFile(ZipInputStream zipIn, String filePath) throws IOException {
        try (BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(filePath))) {
            byte[] bytesIn = new byte[4096];
            int read;
            while ((read = zipIn.read(bytesIn)) != -1) {
                bos.write(bytesIn, 0, read);
            }
        }
    }
}
