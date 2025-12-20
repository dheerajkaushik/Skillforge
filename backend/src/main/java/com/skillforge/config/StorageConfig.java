package com.skillforge.config;

import com.skillforge.storage.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class StorageConfig {
    @Value("${upload.mode}")
    private String mode;

    @Bean
    @Primary
    public StorageService storageService(LocalStorageService local, S3StorageService s3) {
        return "s3".equalsIgnoreCase(mode) ? s3 : local;
    }
}