package com.skillforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.converter.ResourceRegionHttpMessageConverter;

@SpringBootApplication
public class SkillForgeApplication {
    public static void main(String[] args) {

        SpringApplication.run(SkillForgeApplication.class, args);
    }

    @Bean
    public ResourceRegionHttpMessageConverter resourceRegionHttpMessageConverter() {
        return new ResourceRegionHttpMessageConverter();
    }
}
