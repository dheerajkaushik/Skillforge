package com.skillforge.runner;

import com.skillforge.runner.RunnerResult;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;

import java.io.*;
import java.nio.file.Files;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RunnerService {

    private static final long TIME_LIMIT_MS = 5000;

    public RunnerResult runJava(String sourceCode, String input) {
        RunnerResult result = new RunnerResult();
        long start = System.currentTimeMillis();
        File dir = null;
        ExecutorService executor = null;

        try {
            // 1. Setup Directory
            dir = Files.createTempDirectory("java-runner").toFile();
            File javaFile = new File(dir, "Main.java");

            // 2. FIX: Rename 'public class X' to 'public class Main'
            // This prevents "class X is public, should be declared in file X.java" errors
            String correctedCode = sourceCode.replaceAll("public\\s+class\\s+\\w+", "public class Main");

            try (FileWriter fw = new FileWriter(javaFile)) {
                fw.write(correctedCode);
            }

            // 3. Compile
            Process compile = new ProcessBuilder("javac", "Main.java")
                    .directory(dir)
                    .redirectErrorStream(true)
                    .start();

            String compileOutput = readStream(compile.getInputStream());
            if (compile.waitFor() != 0) {
                result.setSuccess(false);
                result.setError("Compilation Error:\n" + compileOutput);
                return result;
            }

            // 4. Run
            ProcessBuilder runBuilder = new ProcessBuilder("java", "-Xmx128m", "-Xms64m", "Main");
            runBuilder.directory(dir);
            Process run = runBuilder.start();

            // 5. Pass Input (stdin)
            if (input != null && !input.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(run.getOutputStream()))) {
                    // FIX: Clean input to remove JSON artifacts like [10, 20]
                    String cleanInput = input.replace("[", "").replace("]", "").replace(",", " ");
                    writer.write(cleanInput);
                    writer.newLine(); // Crucial for Scanner
                    writer.flush();
                }
            }

            // 6. Read Output (Parallel)
            executor = Executors.newFixedThreadPool(2);
            Future<String> outputFuture = executor.submit(() -> readStream(run.getInputStream()));
            Future<String> errorFuture = executor.submit(() -> readStream(run.getErrorStream()));

            try {
                String output = outputFuture.get(TIME_LIMIT_MS, TimeUnit.MILLISECONDS);
                String error = errorFuture.get(TIME_LIMIT_MS, TimeUnit.MILLISECONDS);

                // FIX: Log to Docker Console for Debugging
                System.out.println("--- EXECUTION DEBUG ---");
                System.out.println("STDOUT: " + output);
                System.out.println("STDERR: " + error);
                System.out.println("-----------------------");

                if (!error.isEmpty()) {
                    result.setSuccess(false);
                    result.setError(error); // This is what you need to see!
                    // If there is ANY output before the crash, capture it too
                    if (!output.isEmpty()) {
                        result.setError(error + "\nPartial Output: " + output);
                    }
                } else {
                    result.setSuccess(true);
                    result.setOutput(output.trim());
                }

            } catch (TimeoutException e) {
                run.destroyForcibly();
                result.setSuccess(false);
                result.setError("Time Limit Exceeded");
            }

        } catch (Exception e) {
            e.printStackTrace();
            result.setSuccess(false);
            result.setError("Internal Error: " + e.getMessage());
        } finally {
            if (executor != null) executor.shutdownNow();
            if (dir != null) FileSystemUtils.deleteRecursively(dir);
            result.setExecutionTime(System.currentTimeMillis() - start);
        }

        return result;
    }

    private String readStream(InputStream stream) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(stream));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line).append("\n");
        }
        return sb.toString();
    }
}