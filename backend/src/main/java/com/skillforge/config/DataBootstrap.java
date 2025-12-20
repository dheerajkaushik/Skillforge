package com.skillforge.config;

import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCrypt;

@Configuration
public class DataBootstrap {

    @Bean
    CommandLineRunner initUsers(UserRepository userRepository) {
        return args -> {
            // Create admin if not exists
            String adminEmail = "admin@skillforge.local";
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = new User();
                admin.setEmail(adminEmail);
                admin.setName("SkillForge Admin");
                admin.setPasswordHash(BCrypt.hashpw("Admin@123", BCrypt.gensalt()));
                admin.setRole(User.Role.ADMIN);
                userRepository.save(admin);
                System.out.println("Created ADMIN user: " + adminEmail + " / password: Admin@123");
            }

            // Create instructor if not exists
            String instEmail = "instructor@skillforge.local";
            if (userRepository.findByEmail(instEmail).isEmpty()) {
                User inst = new User();
                inst.setEmail(instEmail);
                inst.setName("Default Instructor");
                inst.setPasswordHash(BCrypt.hashpw("Instructor@123", BCrypt.gensalt()));
                inst.setRole(User.Role.INSTRUCTOR);
                userRepository.save(inst);
                System.out.println("Created INSTRUCTOR user: " + instEmail + " / password: Instructor@123");

            }
        };
    }
}
