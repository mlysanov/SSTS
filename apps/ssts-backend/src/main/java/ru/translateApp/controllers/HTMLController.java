package ru.translateApp.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.HandlerMapping;
import ru.translateApp.AppConfig;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/api/files")
public class HTMLController {

    @Autowired
    private AppConfig appConfig;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/{projectName}/{resourcePath}/**")
    @ResponseBody
    public FileSystemResource appDoc(@PathVariable String projectName,
                                     @PathVariable String resourcePath,
                                     HttpServletRequest request) {
        String fullPath = (String) request.getAttribute(
                HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        String replacedPath = fullPath.replace("/api/files/", appConfig.getProjectsDirectory());
        File file = new File(replacedPath);

        if (file.getName().endsWith(".html") || file.getName().endsWith(".htm")) {
            try {
                FileInputStream inputStream = new FileInputStream(file);
                BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, "UTF-8"));

                StringBuilder contentBuilder = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    contentBuilder.append(line);
                    contentBuilder.append(System.getProperty("line.separator"));
                }
                reader.close();

                String content = contentBuilder.toString();

                InputStream scriptInputStream = getClass().getClassLoader().getResourceAsStream("injectedScript.js");
                BufferedReader scriptReader = new BufferedReader(new InputStreamReader(scriptInputStream));
                String injectedScript = scriptReader.lines().collect(Collectors.joining("\n"));
                scriptReader.close();

                injectedScript = injectedScript.replace("{{projectName}}", projectName);
                injectedScript = injectedScript.replace("{{pathToHashs}}", replacedPath);
                injectedScript = "<script>" + injectedScript + "</script>";
                content = content.replace("</body>", injectedScript + "</body>");

                InputStream scriptInputStream3 = getClass().getClassLoader().getResourceAsStream("markupToolWithRender.bundle.js");
                BufferedReader scriptReader3 = new BufferedReader(new InputStreamReader(scriptInputStream3));
                String injectedScript3 = scriptReader3.lines().collect(Collectors.joining("\n"));
                scriptReader3.close();

                injectedScript3 = injectedScript3.replace("{{projectName}}", projectName);

                injectedScript3 = "<script>" + injectedScript3 + "</script>";
                content = content.replace("</body>", injectedScript3 + "</body>");

                File tempFile = File.createTempFile("temp", ".tmp");
                FileWriter writer = new FileWriter(tempFile);
                writer.write(content);
                writer.close();

                return new FileSystemResource(tempFile);
            } catch (FileNotFoundException e) {
                throw new RuntimeException(e);
            } catch (UnsupportedEncodingException e) {
                throw new RuntimeException(e);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        return new FileSystemResource(file);
    }

    @GetMapping("/{projectName}/hashsWordsCommon")
    public ResponseEntity<Resource> getJsonFile(@PathVariable String projectName) {
        try {
            File file = new File(appConfig.getProjectsDirectory() + projectName + "/hashsWordsCommon.json");
            Resource fileResource = new FileSystemResource(file);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(fileResource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{projectName}/hashsWordsSource")
    public ResponseEntity<Resource> getJsonFileWithSourceLocale(@PathVariable String projectName) {
        try {
            File file = new File(appConfig.getProjectsDirectory() + projectName + "/hashsWordsSource.json");
            Resource fileResource = new FileSystemResource(file);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(fileResource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{projectName}/updateHashs")
    public void changeHashs(@PathVariable String projectName, @RequestBody HashMap<String, String> data) throws IOException {
        Map<String, String> hashsWordsCommon;
        hashsWordsCommon = objectMapper.readValue(new File(appConfig.getProjectsDirectory() + projectName + "/hashsWordsCommon.json"), new TypeReference<>() {});

        String inputFilePath = appConfig.getProjectsDirectory() + projectName +"/work/site/search/search_index.json";
        try {
            String content = new String(Files.readAllBytes(Path.of(inputFilePath)));
            String modifiedContent = content.replaceAll(hashsWordsCommon.get(data.get("spanId")), data.get("newText"));
            Files.write(Path.of(inputFilePath), modifiedContent.getBytes());

            String content2 = new String(Files.readAllBytes(Path.of(inputFilePath.replace(".json", ".js"))));
            String modifiedContent2 = content2.replaceAll(hashsWordsCommon.get(data.get("spanId")), data.get("newText"));
            Files.write(Path.of(inputFilePath.replace(".json", ".js")), modifiedContent2.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
        }

        hashsWordsCommon.put(data.get("spanId"), data.get("newText"));
        objectMapper.writeValue(new File(appConfig.getProjectsDirectory() + projectName + "/hashsWordsCommon.json"), hashsWordsCommon);

        Map<String, String> hashWordLocal;
        Path path = Paths.get(data.get("pathToHashs"));

        Path relativePath = Path.of("/" + path.subpath(0, path.getNameCount() - 1));
        if (Paths.get(data.get("pathToHashs")).getFileName().toString().endsWith(".html")) {
            hashWordLocal = objectMapper.readValue(new File(relativePath + "/hashWord" + Paths.get(data.get("pathToHashs")).getFileName().toString().replace(".html", ".json")), new TypeReference<>() {});
            hashWordLocal.put(data.get("spanId"), data.get("newText"));
            objectMapper.writeValue(new File(relativePath + "/hashWord" + Paths.get(data.get("pathToHashs")).getFileName().toString().replace(".html", ".json")), hashWordLocal);
        } else {
            hashWordLocal = objectMapper.readValue(new File(relativePath + "/hashWord" + Paths.get(data.get("pathToHashs")).getFileName().toString().replace(".htm", ".json")), new TypeReference<>() {});
            hashWordLocal.put(data.get("spanId"), data.get("newText"));
            objectMapper.writeValue(new File(relativePath + "/hashWord" + Paths.get(data.get("pathToHashs")).getFileName().toString().replace(".htm", ".json")), hashWordLocal);
        }
    }
}