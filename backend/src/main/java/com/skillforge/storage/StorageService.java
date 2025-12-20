package com.skillforge.storage;

import java.io.File;
import java.io.InputStream;
import java.util.List;

public interface StorageService {
    String store(String folder, String filename, InputStream stream, String contentType) throws Exception;
    String storeFile(String folder, File file, String contentType) throws Exception;
    List<String> listFiles(String folder) throws Exception;
    void download(String folder, String filename, File destination) throws Exception; // Needed for FFmpeg
}