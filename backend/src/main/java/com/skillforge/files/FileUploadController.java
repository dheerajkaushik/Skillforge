//package com.skillforge.files;
//
//import com.skillforge.service.VideoProcessingService;
//import com.skillforge.storage.StorageService;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.*;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.util.HashMap;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/files")
//public class FileUploadController {
//
//    private final StorageService storage;
//    private final VideoProcessingService videoProcessor;
//
//    @Value("${upload.local-base:uploads}")
//    private String uploadDir;
//
//
//    public FileUploadController(StorageService storage, VideoProcessingService videoProcessor) {
//        this.storage = storage;
//        this.videoProcessor = videoProcessor;
//    }
//
//    private boolean isInstructor(Authentication auth) {
//        return auth != null && auth.getAuthorities().stream()
//                .anyMatch(a -> a.getAuthority().equals("ROLE_INSTRUCTOR") ||
//                        a.getAuthority().equals("ROLE_ADMIN"));
//    }
//
//    @PostMapping("/upload")
//    public ResponseEntity<?> uploadFile(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam("folder") String folder,
//            Authentication auth
//    ) throws Exception {
//
//        if (!isInstructor(auth))
//            return ResponseEntity.status(403).body("Only instructors can upload files");
//
//        // 1. Sanitize Filename
//        String sanitizedParams = file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_");
//        String filename = System.currentTimeMillis() + "_" + sanitizedParams;
//
//        // 2. Store the file
//        storage.store(folder, filename, file.getInputStream(), file.getContentType());
//
//        // Build URLs
//        String url = "/api/files/view/" + folder + "/" + filename;
//        String hlsUrl = null;
//
//        // 3. Async HLS Conversion for video
//        if (file.getContentType() != null && file.getContentType().startsWith("video")) {
//            videoProcessor.processVideoAsync(folder, filename);
//            String jobId = filename.replace(".", "-");
//            hlsUrl = "/api/files/view/" + folder + "/hls/" + jobId + "/index.m3u8";
//        }
//
//        Map<String, String> response = new HashMap<>();
//        response.put("url", url);
//        response.put("hlsUrl", hlsUrl);
//
//        return ResponseEntity.ok(response);
//    }
//
//    @GetMapping("/list")
//    public ResponseEntity<?> listFiles(@RequestParam String folder) {
//        try {
//            return ResponseEntity.ok(storage.listFiles(folder));
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("Error listing files: " + e.getMessage());
//        }
//    }
//
//    // ✅ FIXED: Manual Byte Streaming (Bypasses Spring Converters entirely)
//    // This fixes the "No converter for ResourceRegion" error 100%
//    @GetMapping("/view/{folder}/**")
//    public void getFile(
//            @PathVariable String folder,
//            HttpServletRequest request,
//            HttpServletResponse response
//    ) throws Exception {
//
//        String fullUri = request.getRequestURI();
//        String prefix = "/api/files/view/" + folder + "/";
//
//        if (!fullUri.contains(prefix)) {
//            response.sendError(400, "Invalid URL");
//            return;
//        }
//
//        String filename = fullUri.substring(fullUri.indexOf(prefix) + prefix.length());
//
//        // Basic Security
//        if (filename.contains("..")) {
//            response.sendError(400, "Security Check Failed");
//            return;
//        }
//
//        Path path = Paths.get(uploadDir, folder, filename).normalize();
//        File file = path.toFile();
//
//        if (!file.exists() || !file.canRead()) {
//            response.sendError(404, "File Not Found");
//            return;
//        }
//
//        // 1. Determine Content Type
//        String contentType = "application/octet-stream";
//        String lowerName = filename.toLowerCase();
//        if (lowerName.endsWith(".pdf")) contentType = "application/pdf";
//        else if (lowerName.endsWith(".mp4")) contentType = "video/mp4";
//        else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) contentType = "image/jpeg";
//        else if (lowerName.endsWith(".png")) contentType = "image/png";
//
//        response.setContentType(contentType);
//        response.setHeader("Accept-Ranges", "bytes");
//
//        // 2. Handle Range Header (Video Chunking)
//        String rangeHeader = request.getHeader("Range");
//        long fileLength = file.length();
//        long start = 0;
//        long end = fileLength - 1;
//
//        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
//            String[] ranges = rangeHeader.substring(6).split("-");
//            try {
//                start = Long.parseLong(ranges[0]);
//                if (ranges.length > 1 && !ranges[1].isEmpty()) {
//                    end = Long.parseLong(ranges[1]);
//                }
//            } catch (NumberFormatException e) {
//                // Ignore invalid range, verify start/end logic below
//            }
//        }
//
//        // Ensure valid range
//        if (start > end || start >= fileLength) {
//            response.setHeader("Content-Range", "bytes */" + fileLength);
//            response.sendError(416, "Requested Range Not Satisfiable");
//            return;
//        }
//
//        long contentLength = end - start + 1;
//
//        // 3. Set Headers & Status
//        if (rangeHeader != null) {
//            response.setStatus(206); // Partial Content
//            response.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + fileLength);
//        } else {
//            response.setStatus(200); // Full Content
//            response.setHeader("Content-Disposition", "inline; filename=\"" + filename + "\"");
//        }
//        response.setContentLengthLong(contentLength);
//
//        // 4. Stream the Bytes (Manual Copy)
//        try (InputStream is = new FileInputStream(file);
//             OutputStream os = response.getOutputStream()) {
//
//            long skipped = is.skip(start);
//            if (skipped < start) {
//                // Should technically handle this, but for local files usually fine
//            }
//
//            byte[] buffer = new byte[8192]; // 8KB buffer
//            long bytesNeeded = contentLength;
//
//            while (bytesNeeded > 0) {
//                int bytesToRead = (int) Math.min(buffer.length, bytesNeeded);
//                int bytesRead = is.read(buffer, 0, bytesToRead);
//
//                if (bytesRead == -1) break;
//
//                os.write(buffer, 0, bytesRead);
//                bytesNeeded -= bytesRead;
//            }
//            os.flush();
//        } catch (Exception e) {
//            // Client likely disconnected (video player stopped buffering), which is normal.
//            // We ignore this error to avoid cluttering logs.
//        }
//    }
//}


package com.skillforge.files;

import com.skillforge.service.VideoProcessingService;
import com.skillforge.storage.StorageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final StorageService storage;
    private final VideoProcessingService videoProcessor;

    // ✅ NEW: Inject S3 settings to construct URLs
    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    public FileUploadController(StorageService storage, VideoProcessingService videoProcessor) {
        this.storage = storage;
        this.videoProcessor = videoProcessor;
    }

    private boolean isInstructor(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_INSTRUCTOR") ||
                        a.getAuthority().equals("ROLE_ADMIN"));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder,
            Authentication auth
    ) throws Exception {

        if (!isInstructor(auth))
            return ResponseEntity.status(403).body("Only instructors can upload files");

        // 1. Sanitize Filename
        String sanitizedParams = file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_");
        String filename = System.currentTimeMillis() + "_" + sanitizedParams;

        // 2. Store the file to S3
        // The storage service uploads it and returns the S3 URL
        String s3Url = storage.store(folder, filename, file.getInputStream(), file.getContentType());

        // 3. Async HLS (Note: This might need updates if VideoProcessor relies on local files,
        // but for now we focus on the upload/view fix)
        String hlsUrl = null;
        if (file.getContentType() != null && file.getContentType().startsWith("video")) {
            // videoProcessor.processVideoAsync(folder, filename);
            // Warning: Existing video processor likely needs local files.
            // For S3, you typically use AWS MediaConvert. Keeping null for now to prevent errors.
        }

        Map<String, String> response = new HashMap<>();
        // ✅ FIX: Return the S3 URL directly.
        // This makes new uploads work instantly without hitting your backend for viewing.
        response.put("url", s3Url);
        response.put("hlsUrl", hlsUrl);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    public ResponseEntity<?> listFiles(@RequestParam String folder) {
        try {
            return ResponseEntity.ok(storage.listFiles(folder));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error listing files: " + e.getMessage());
        }
    }

    // ✅ FIXED: Redirect to S3 (Solves the 404 Error)
    // Instead of trying to read bytes from disk, we send the browser to AWS.
    @GetMapping("/view/{folder}/**")
    public void getFile(
            @PathVariable String folder,
            HttpServletRequest request,
            HttpServletResponse response
    ) throws Exception {

        String fullUri = request.getRequestURI();
        String prefix = "/api/files/view/" + folder + "/";

        if (!fullUri.contains(prefix)) {
            response.sendError(400, "Invalid URL");
            return;
        }

        // Extract filename (e.g., "1766158013442_Dheeraj.pdf")
        String filename = fullUri.substring(fullUri.indexOf(prefix) + prefix.length());

        // ✅ 1. Construct the Public S3 URL
        // Format: https://BUCKET.s3.REGION.amazonaws.com/FOLDER/FILENAME
        String s3Url = String.format("https://%s.s3.%s.amazonaws.com/%s/%s",
                bucketName, region, folder, filename);

        // ✅ 2. Redirect the browser
        // 307 Temporary Redirect preserves the method (GET) and tells browser "Go here instead"
        response.sendRedirect(s3Url);
    }
}