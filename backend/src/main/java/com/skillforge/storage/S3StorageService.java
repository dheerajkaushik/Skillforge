package com.skillforge.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.EnvironmentVariableCredentialsProvider;
import software.amazon.awssdk.auth.credentials.SystemPropertyCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.File;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class S3StorageService implements StorageService {

    private final S3Client s3;
    private final String bucket;
    private final String region;

    public S3StorageService(@Value("${aws.s3.region}") String region,
                            @Value("${aws.s3.bucket}") String bucket) {
        this.bucket = bucket;
        this.region = region;
        this.s3 = S3Client.builder()
                .region(Region.of(region))
                // Will look for AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env vars
                .credentialsProvider(EnvironmentVariableCredentialsProvider.create())
                .build();
    }

    @Override
    public String store(String folder, String filename, InputStream stream, String contentType) throws Exception {
        String key = folder + "/" + filename;
        PutObjectRequest por = PutObjectRequest.builder()
                .bucket(bucket).key(key).contentType(contentType).build(); // Removed ACL for modern S3 security defaults

        s3.putObject(por, RequestBody.fromInputStream(stream, stream.available()));
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }

    @Override
    public String storeFile(String folder, File file, String contentType) throws Exception {
        String key = folder + "/" + file.getName();
        PutObjectRequest por = PutObjectRequest.builder()
                .bucket(bucket).key(key).contentType(contentType).build();
        s3.putObject(por, RequestBody.fromFile(file));
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }

    @Override
    public List<String> listFiles(String folder) {
        ListObjectsV2Request req = ListObjectsV2Request.builder()
                .bucket(bucket).prefix(folder + "/").build();
        return s3.listObjectsV2(req).contents().stream()
                .map(o -> o.key().substring((folder + "/").length()))
                .collect(Collectors.toList());
    }

    @Override
    public void download(String folder, String filename, File destination) {
        String key = folder + "/" + filename;
        GetObjectRequest req = GetObjectRequest.builder().bucket(bucket).key(key).build();
        s3.getObject(req, destination.toPath());
    }
}