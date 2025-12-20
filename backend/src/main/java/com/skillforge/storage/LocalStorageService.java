package com.skillforge.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.apache.commons.io.FileUtils;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LocalStorageService implements StorageService {

    @Value("${upload.local-base:uploads}")
    private String baseDir;

    @Override
    public String store(String folder, String filename, InputStream stream, String contentType) throws Exception {
        Path folderPath = Paths.get(baseDir, folder);
        Files.createDirectories(folderPath);
        Path filePath = folderPath.resolve(filename);
        Files.copy(stream, filePath, StandardCopyOption.REPLACE_EXISTING);
        return "/api/files/view/" + folder + "/" + filename;
    }

    @Override
    public String storeFile(String folder, File file, String contentType) throws Exception {
        Path folderPath = Paths.get(baseDir, folder);
        Files.createDirectories(folderPath);
        Path dest = folderPath.resolve(file.getName());
        FileUtils.copyFile(file, dest.toFile());
        return "/api/files/view/" + folder + "/" + file.getName();
    }

    @Override
    public List<String> listFiles(String folder) throws Exception {
        Path folderPath = Paths.get(baseDir, folder);
        if (!Files.exists(folderPath)) return Collections.emptyList();
        try (var s = Files.list(folderPath)) {
            return s.map(p -> p.getFileName().toString()).collect(Collectors.toList());
        }
    }

    @Override
    public void download(String folder, String filename, File destination) throws Exception {
        Path source = Paths.get(baseDir, folder, filename);
        FileUtils.copyFile(source.toFile(), destination);
    }
}