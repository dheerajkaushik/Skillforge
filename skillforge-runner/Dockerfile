# --- Stage 1: Build the JAR ---
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# --- Stage 2: Run the Application ---
# FIX: Changed 'jre' to 'jdk' so 'javac' is available for student code
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy the JAR from the "build" stage
COPY --from=build /app/target/skillforge-runner-0.0.1-SNAPSHOT.jar runner.jar

# Create user (Alpine syntax)
RUN adduser -D runneruser
USER runneruser

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "runner.jar"]