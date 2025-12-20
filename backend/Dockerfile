# ----------------------------------------
# Stage 1: Build the Application
# ----------------------------------------
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy only the project definition first (better caching)
COPY pom.xml .

# Download dependencies (offline mode)
RUN mvn dependency:go-offline -B

# Copy the actual source code
COPY src ./src

# Build the JAR file inside Docker
RUN mvn clean package -DskipTests

# ----------------------------------------
# Stage 2: Run the Application
# ----------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# ----------------------------------------------------
# FIX: Install FFmpeg so the backend can process video
# ----------------------------------------------------
RUN apk add --no-cache ffmpeg

# Copy the built JAR from Stage 1
COPY --from=build /app/target/skillforge-backend-0.0.1-SNAPSHOT.jar app.jar

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]