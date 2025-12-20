package com.skillforge.service;

import com.skillforge.storage.StorageService;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class VideoProcessingService {

    private final StorageService storage;
    @Value("${ffmpeg.path:ffmpeg}")
    private String ffmpegPath;

    public VideoProcessingService(StorageService storage) {
        this.storage = storage;
    }

    @Async("videoExecutor")
    public void processVideoAsync(String folder, String filename) {
        String jobId = filename.replace(".", "-");
        File tempDir = new File(System.getProperty("java.io.tmpdir"), "vf-" + jobId);

        try {
            if (tempDir.exists()) FileUtils.deleteDirectory(tempDir);
            tempDir.mkdirs();

            // 1. Download Source
            File sourceFile = new File(tempDir, filename);
            storage.download(folder, filename, sourceFile);

            // 2. Prepare HLS Output Directory
            File hlsDir = new File(tempDir, "hls");
            hlsDir.mkdirs();

            // 3. Run FFmpeg
            // Command: ffmpeg -i source.mp4 -profile:v baseline -level 3.0 -start_number 0 -hls_time 6 -hls_list_size 0 -f hls index.m3u8
            ProcessBuilder pb = new ProcessBuilder(
                    ffmpegPath, "-i", sourceFile.getAbsolutePath(),
                    "-profile:v", "baseline", "-level", "3.0",
                    "-start_number", "0", "-hls_time", "6", "-hls_list_size", "0",
                    "-f", "hls", new File(hlsDir, "index.m3u8").getAbsolutePath()
            );

            pb.redirectErrorStream(true);
            Process p = pb.start();
            p.waitFor(10, TimeUnit.MINUTES); // Wait max 10 mins

            if (p.exitValue() != 0) throw new RuntimeException("FFmpeg failed");

            // 4. Upload HLS Files
            String targetFolder = folder + "/hls/" + jobId; // e.g. lesson-videos/hls/myvideo-mp4
            for (File f : hlsDir.listFiles()) {
                storage.storeFile(targetFolder, f, Files.probeContentType(f.toPath()));
            }

            System.out.println("HLS Conversion Complete: " + targetFolder);

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try { FileUtils.deleteDirectory(tempDir); } catch (Exception ignored) {}
        }
    }
}