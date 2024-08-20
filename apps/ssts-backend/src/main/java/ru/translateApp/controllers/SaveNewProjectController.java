package ru.translateApp.controllers;

import com.fasterxml.jackson.core.exc.StreamWriteException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.TextNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.translateApp.AppConfig;
import ru.translateApp.entity.Data;
import ru.translateApp.entity.PathInfo;
import ru.translateApp.security.SecurityConfig;
import ru.translateApp.entity.Project;
import ru.translateApp.entity.User;


import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@RestController
@RequestMapping("/api")
public class SaveNewProjectController {

    @Autowired
    private AppConfig appConfig;

    @Autowired
    private SecurityConfig securityConfig;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/saveProject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> saveProject(@RequestParam("zipFile") MultipartFile zipFile, @RequestParam("projectData") String projectDataJson) {
        Map<String, String> response = new HashMap<>();
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Project project = objectMapper.readValue(projectDataJson, Project.class);
            String folderPath = appConfig.getProjectsDirectory() + project.getName();
            File folder = new File(folderPath);

            if (!folder.exists()) {
                boolean result = folder.mkdirs();
                if (result) {
                    System.out.println("The folder was created successfully");
                } else {
                    System.out.println("The folder could not be created");
                }
            } else {
                System.out.println("The folder already exists");
            }

            Path path = Paths.get(folderPath + "/" + zipFile.getOriginalFilename());
            Files.copy(zipFile.getInputStream(), path);
            createJsonFile(folderPath, folderPath + "/" + zipFile.getOriginalFilename());
            addProjectToProjectsJson(project);

            System.out.println("A new project has been added: " + projectDataJson);
            System.out.println("File name: " + zipFile.getOriginalFilename());

            addTranslatorToConfig(project.getLogin(), project.getPassword());

            response.put("message", "The project has been successfully saved");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("Error saving the project: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/prepareProject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> prepareProject(@RequestBody Map<String, String> requestBody) {
        Map<String, String> response = new HashMap<>();
        try {
            String projectName = requestBody.get("projectName");
            Project project = getProjectByName(projectName);
            createJsonFilesWithHashs(new File(project.getPath()).getParent());

            Data data = objectMapper.readValue(new File(project.getPath()), Data.class);
            String pathToSourceLocaleFolder = createFolderIfDoesNotExists(data.getPathToSourceArchive(), project.getSourceLocale());
            String pathToWorkFolder = createFolderIfDoesNotExists(data.getPathToSourceArchive(), "work");

            unzip(data.getPathToSourceArchive(), pathToSourceLocaleFolder);
            unzip(data.getPathToSourceArchive(), pathToWorkFolder);

            findAllHTMLFiles(pathToWorkFolder);
            List<PathInfo> pathsToHTMLFiles = new ArrayList<>();

            try (Stream<Path> paths = Files.walk(Paths.get(new File(project.getPath()).getParent() + "/work"))) {
                paths.filter(Files::isRegularFile)
                        .filter(path -> {
                            String fileName = path.getFileName().toString().toLowerCase();
                            return fileName.endsWith(".html") || fileName.endsWith(".htm");
                        })
                        .forEach(htmlPath -> {
                            int[] infoAboutTextNodes;
                            if (htmlPath.getFileName().toString().endsWith(".html")) {
                                infoAboutTextNodes = countTextNodesFromJson(new File(htmlPath.getParent() + "/hashWord" + htmlPath.getFileName().toString().replace(".html","") + ".json").toPath());
                            } else {
                                infoAboutTextNodes = countTextNodesFromJson(new File(htmlPath.getParent() + "/hashWord" + htmlPath.getFileName().toString().replace(".htm","") + ".json").toPath());

                            }
                            PathInfo pathToHTMLFileInfo = new PathInfo();
                            pathToHTMLFileInfo.setPath(htmlPath.toString());
                            pathToHTMLFileInfo.setCounterOfTextNodes(infoAboutTextNodes[0]);
                            pathToHTMLFileInfo.setCounterOfUntranslatedTextNodes(infoAboutTextNodes[1]);
                            pathToHTMLFileInfo.setHasUntranslatedTextNodes(pathToHTMLFileInfo.getCounterOfUntranslatedTextNodes() > 0);
                            pathsToHTMLFiles.add(pathToHTMLFileInfo);
                        });
            } catch (IOException e) {
                e.printStackTrace();
            }

            Map<String, String> hashsWordsCommon;
            try {
                hashsWordsCommon = objectMapper.readValue(new File(appConfig.getProjectsDirectory() + projectName + "/hashsWordsCommon.json"), new TypeReference<>() {});
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            BufferedWriter writer = new BufferedWriter(new FileWriter(appConfig.getProjectsDirectory() + projectName + "/All.txt"));
            int counterOfUntranslatedWords = 0;
            for (Map.Entry<String, String> entry : hashsWordsCommon.entrySet()) {
                if (entry.getKey().equals(hashText(entry.getValue()))) {
                    writer.write(entry.getValue() + "\n");
                    counterOfUntranslatedWords += entry.getValue().split(" ").length;
                }
            }

            writer.close();

            data.setPathsToHTML(pathsToHTMLFiles);
            data.setCounterOfUntranslatedWords(counterOfUntranslatedWords);
            objectMapper.writeValue(new File(project.getPath()), data);

            response.put("message", "The preparation for the transfer has worked out");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error when starting translation preparation: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/refreshMetaData")
    public ResponseEntity<Map<String, String>> prepareMetaData(@RequestBody Map<String, String> requestBody) {
        Map<String, String> response = new HashMap<>();
        try {
            String projectName = requestBody.get("projectName");
            Project project = getProjectByName(projectName);
            Data data = objectMapper.readValue(new File(project.getPath()), Data.class);
            List<PathInfo> pathsToHTMLFiles = new ArrayList<>();

            System.out.println(Paths.get(new File(project.getPath()).getParent() + "/work/site"));
            try (Stream<Path> paths = Files.walk(Paths.get(new File(project.getPath()).getParent() + "/work"))) {
                paths.filter(Files::isRegularFile)
                        .filter(path -> {
                            String fileName = path.getFileName().toString().toLowerCase();
                            return fileName.endsWith(".html") || fileName.endsWith(".htm");
                        })
                        .forEach(htmlPath -> {
                            int[] infoAboutTextNodes;
                            if (htmlPath.getFileName().toString().endsWith(".html")) {
                                infoAboutTextNodes = countTextNodesFromJson(new File(htmlPath.getParent() + "/hashWord" + htmlPath.getFileName().toString().replace(".html","") + ".json").toPath());
                            } else {
                                infoAboutTextNodes = countTextNodesFromJson(new File(htmlPath.getParent() + "/hashWord" + htmlPath.getFileName().toString().replace(".htm","") + ".json").toPath());

                            }
                            PathInfo pathToHTMLFileInfo = new PathInfo();
                            pathToHTMLFileInfo.setPath(htmlPath.toString());
                            pathToHTMLFileInfo.setCounterOfTextNodes(infoAboutTextNodes[0]);
                            pathToHTMLFileInfo.setCounterOfUntranslatedTextNodes(infoAboutTextNodes[1]);
                            pathToHTMLFileInfo.setHasUntranslatedTextNodes(pathToHTMLFileInfo.getCounterOfUntranslatedTextNodes() > 0);
                            pathsToHTMLFiles.add(pathToHTMLFileInfo);
                        });
            } catch (IOException e) {
                e.printStackTrace();
            }

            Map<String, String> hashsWordsCommon;
            try {
                hashsWordsCommon = objectMapper.readValue(new File(appConfig.getProjectsDirectory() + projectName + "/hashsWordsCommon.json"), new TypeReference<>() {});
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
//            BufferedWriter writer = new BufferedWriter(new FileWriter(appConfig.getProjectsDirectory() + projectName + "/All.txt"));
//            int counterOfUntranslatedWords = 0;
//            for (Map.Entry<String, String> entry : hashsWordsCommon.entrySet()) {
//                if (entry.getKey().equals(hashText(entry.getValue()))) {
//                    writer.write(entry.getValue() + "\n");
//                    counterOfUntranslatedWords += entry.getValue().split(" ").length;
//                }
//            }
//            writer.close();

            data.setPathsToHTML(pathsToHTMLFiles);
//            data.setCounterOfUntranslatedWords(counterOfUntranslatedWords);
            objectMapper.writeValue(new File(project.getPath()), data);

            response.put("message", "Metadata preparation has worked");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error in preparing metadata for translation: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    private void addTranslatorToConfig(String login, String password) throws Exception {
        File configFile = new File(appConfig.getConfigJSON());
        List<User> users;
        users = objectMapper.readValue(configFile, new TypeReference<>() {});
        System.out.println(users);

        boolean translatorExists = users.stream().anyMatch(user -> user.getLogin().equals(login));

        if (!translatorExists) {
            User newTranslator = new User();
            newTranslator.setLogin(login);
            newTranslator.setPassword(password);
            newTranslator.setRole("user");
            users.add(newTranslator);
            securityConfig.addUserToInMemory(login, password, "USER");
        }
        objectMapper.writeValue(configFile, users);
    }

    private void createJsonFile(String pathToFile, String pathToSourceArchive) {
        Map<String, Object> data = new HashMap<>();
        data.put("pathToSourceArchive", pathToSourceArchive);
        data.put("counterOfUntranslatedWords", 0);
        data.put("pathsToHTML", new ArrayList<Map<String, String>>());
        data.put("statusOfTranslatedPage", "browse");

        try {
            objectMapper.writeValue(new File(pathToFile + "/data.json"), data);
            System.out.println("JSON file was created successfully");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void createJsonFilesWithHashs(String pathToFile) {
        Map<String, String> data = new HashMap<>();
        try {
            objectMapper.writeValue(new File(pathToFile + "/hashsWordsCommon.json"), data);
            objectMapper.writeValue(new File(pathToFile + "/hashsWordsSource.json"), data);
        } catch (StreamWriteException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void addProjectToProjectsJson(Project project) throws IOException {
        String projectsJsonPath = appConfig.getProjectsJSON();
        File projectsJsonFile = new File(projectsJsonPath);
        List<Project> projects;
        projects = objectMapper.readValue(projectsJsonFile, new TypeReference<>() {});
        project.setName(project.getName());
        project.setLogin(project.getLogin());
        project.setPassword(project.getPassword());
        project.setSourceLocale(project.getSourceLocale());
        project.setTargetLocale(project.getTargetLocale());
        project.setPath(appConfig.getProjectsDirectory() + project.getName() + "/data.json");
        projects.add(project);

        objectMapper.writeValue(projectsJsonFile, projects);
    }

    private String createFolderIfDoesNotExists(String pathToFolder, String sourceLocale) {
        String pathToFolderWithSourceFile = new File(pathToFolder).getParent()  + "/" + sourceLocale;
        File newFolder = new File(pathToFolderWithSourceFile);

        if (newFolder.exists()) {
            System.out.println("Directory exists: " + pathToFolder);
        } else {
            boolean created = newFolder.mkdirs();
            if (created) {
                System.out.println("Directory created successfully: " + pathToFolderWithSourceFile);
            } else {
                System.out.println("Failed to create directory: " + pathToFolderWithSourceFile);
            }
            System.out.println("Directory does not exist: " + pathToFolder);
        }

        return new File(pathToFolder).getParent()  + "/" + sourceLocale;
    }

    private Project getProjectByName(String projectName) throws IOException {
        String projectsJsonPath = appConfig.getProjectsJSON();
        File projectsJsonFile = new File(projectsJsonPath);
        List<Project> projects;
        projects = objectMapper.readValue(projectsJsonFile, new TypeReference<>() {});

        return projects.stream()
                .filter(project -> project.getName().equals(projectName))
                .findFirst().get();
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

    private void findAllHTMLFiles(String rootPath) {
        try (Stream<Path> paths = Files.walk(Paths.get(rootPath))) {
            paths.filter(Files::isRegularFile)
                    .filter(path -> {
                        String fileName = path.getFileName().toString().toLowerCase();
                        return fileName.endsWith(".html") || fileName.endsWith(".htm");
                    })
                    .forEach(htmlPath -> {
                        try {
                            Map<String, String> data = new HashMap<>();
                            try {
                                if (htmlPath.getFileName().toString().endsWith(".html")) {
                                    objectMapper.writeValue(new File(htmlPath.getParent() + "/hashWord" + htmlPath.getFileName().toString().replace(".html","") + ".json"), data);
                                } else {
                                    objectMapper.writeValue(new File(htmlPath.getParent() + "/hashWord" + htmlPath.getFileName().toString().replace(".htm","") + ".json"), data);
                                }
                                startHTMLParser(htmlPath, Path.of(Paths.get(rootPath).getParent() + "/hashsWordsCommon.json"));
                            } catch (StreamWriteException e) {
                                throw new RuntimeException(e);
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                        } catch (RuntimeException e) {
                            throw new RuntimeException(e);
                        }
                    });
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void startHTMLParser (Path pathToHTML, Path pathToHashsWordsCommonJson) throws IOException {
        Map<String, String> hashsWordsCommon = new HashMap<>();
        hashsWordsCommon = objectMapper.readValue(pathToHashsWordsCommonJson.toFile(), new TypeReference<>() {});

        Document doc = Jsoup.parse(pathToHTML.toFile(),"UTF-8");

        List<TextNode> textNodes = doc.select(":not(iframe, script, code *)").textNodes();
        Map<String, String> data = new HashMap<>();
        for (TextNode textNode : textNodes) {
            if (!textNode.text().isBlank()) {
                String originalText = textNode.text().trim();
                String hash = hashText(textNode.text().trim());

                textNode.text(hash);

                data.put(hash, originalText);
                if (!hashsWordsCommon.containsKey(hash)) {
                    hashsWordsCommon.put(hash, originalText);
                    objectMapper.writeValue(pathToHashsWordsCommonJson.toFile(), hashsWordsCommon);
                    objectMapper.writeValue(new File(pathToHashsWordsCommonJson.toString().replace("/hashsWordsCommon.json", "/hashsWordsSource.json")), hashsWordsCommon);
                }
                Files.write(pathToHTML, doc.outerHtml().getBytes("UTF-8"));
            }

        }

        if (pathToHTML.getFileName().toString().endsWith(".html")) {
            objectMapper.writeValue(new File(pathToHTML.getParent() + "/hashWord" + pathToHTML.getFileName().toString().replace(".html","") + ".json"), data);
        } else {
            objectMapper.writeValue(new File(pathToHTML.getParent() + "/hashWord" + pathToHTML.getFileName().toString().replace(".htm","") + ".json"), data);

        }
    }

    private static String hashText(String text) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = md.digest(text.getBytes());
            StringBuilder hashBuilder = new StringBuilder();
            for (byte b : hashBytes) {
                hashBuilder.append(String.format("%02x", b));
            }
            return hashBuilder.toString();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }

    private int[] countTextNodesFromJson (Path pathToJson)  {
        int counterOfAllTextNodes = 0;
        int counterOfUntranslatedTextNodes = 0;
        Map<String, String> hashWord;
        try {
            hashWord = objectMapper.readValue(pathToJson.toFile(), new TypeReference<>() {});
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        counterOfAllTextNodes = hashWord.size();
        for (Map.Entry<String, String> entry : hashWord.entrySet()) {
            if (entry.getKey().equals(hashText(entry.getValue()))) {
                counterOfUntranslatedTextNodes += 1;
            }
        }

        int[] res = new int[2];
        res[0] = counterOfAllTextNodes;
        res[1] = counterOfUntranslatedTextNodes;
        return res;
    }
}