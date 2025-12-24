package com.skillforge.coding.service;

import com.skillforge.coding.entity.CodeSubmission;
import com.skillforge.coding.entity.CodingProblem;
import com.skillforge.coding.entity.TestCase;
import com.skillforge.coding.enums.Verdict;
import com.skillforge.coding.repository.CodeSubmissionRepository;
import com.skillforge.coding.repository.CodingProblemRepository;
import com.skillforge.coding.repository.TestCaseRepository;
import com.skillforge.coding.service.runner.RunnerClient;
import com.skillforge.coding.service.runner.RunnerResult;
import com.skillforge.coding.util.OutputComparator;
import org.springframework.stereotype.Service;
import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CodeSubmissionServiceImpl implements CodeSubmissionService {

    private final CodeSubmissionRepository codeSubmissionRepository;
    private final TestCaseRepository testCaseRepository;
    private final RunnerClient runnerClient;
    private final CodingProblemRepository codingProblemRepository;
    private final UserRepository userRepository;

    public CodeSubmissionServiceImpl(CodeSubmissionRepository codeSubmissionRepository,
                                     TestCaseRepository testCaseRepository,
                                     RunnerClient runnerClient,
                                     CodingProblemRepository codingProblemRepository,
                                     UserRepository userRepository) {
        this.codeSubmissionRepository = codeSubmissionRepository;
        this.testCaseRepository = testCaseRepository;
        this.runnerClient = runnerClient;
        this.codingProblemRepository = codingProblemRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CodeSubmission submitCode(Long problemId, Long studentId, String sourceCode) {

        CodeSubmission submission = new CodeSubmission();

        // 1. Setup Submission Metadata
        CodingProblem problem = codingProblemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        submission.setProblem(problem);
        submission.setStudentId(studentId);
        submission.setSourceCode(sourceCode);
        submission.setLanguage("JAVA");
        submission.setSubmittedAt(LocalDateTime.now());

        // 2. Fetch Test Cases
        List<TestCase> testCases = testCaseRepository.findByProblemId(problemId);

        // 3. Prepare Batch Data (Extract inputs)
        List<String> inputs = testCases.stream()
                .map(tc -> tc.getInput() != null ? tc.getInput() : "")
                .collect(Collectors.toList());

        // 4. ✅ ONE NETWORK CALL (Batch Execution)
        List<RunnerResult> results = runnerClient.runBatch(sourceCode, inputs);

        Verdict finalVerdict = Verdict.ACCEPTED;
        int passed = 0;
        int total = testCases.size();

        // 5. Validation Loop (Local processing only)
        if (results.isEmpty() || results.size() != total) {
            // Fallback if runner failed or returned partial results
            finalVerdict = Verdict.RUNTIME_ERROR;
            System.err.println("Mismatch in results count or empty response from Runner.");
        } else {
            for (int i = 0; i < total; i++) {
                TestCase testCase = testCases.get(i);
                RunnerResult result = results.get(i); // Match result to test case by index

                System.out.println("--- Test Case " + (i + 1) + " ---");
                System.out.println("Expected: [" + testCase.getExpectedOutput() + "]");
                if (result.getError() != null && !result.getError().isEmpty()) {
                    System.out.println("❌ RUNNER ERROR: " + result.getError());
                    finalVerdict = Verdict.RUNTIME_ERROR;
                    break;
                }else{
                System.out.println("Actual:   [" + result.getOutput() + "]");}

                // Check for Runtime Errors/Compilation Errors
                if (result.getError() != null && !result.getError().isEmpty()) {
                    finalVerdict = Verdict.RUNTIME_ERROR;
                    break;
                }

                // Check Logic Correctness
                boolean correct = OutputComparator.isOutputCorrect(
                        result.getOutput(),
                        testCase.getExpectedOutput()
                );

                if (!correct) {
                    finalVerdict = Verdict.WRONG_ANSWER;
                    break;
                }
                passed++;
            }
        }

        // 6. Save and Return
        submission.setPassedTestCases(passed);
        submission.setTotalTestCases(total);
        submission.setAccepted(finalVerdict == Verdict.ACCEPTED);
        submission.setVerdict(finalVerdict.name());

        return codeSubmissionRepository.save(submission);
    }

    @Override
    public List<CodeSubmission> getSubmissionsByStudent(Long studentId) {
        return codeSubmissionRepository.findByStudentId(studentId);
    }

    @Override
    public List<CodeSubmission> getSubmissionsByProblem(Long problemId) {
        return codeSubmissionRepository.findByProblemId(problemId);
    }

    @Override
    public List<CodeSubmission> getSubmissionsForUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));

        return codeSubmissionRepository.findByStudentIdOrderBySubmittedAtDesc(user.getId());
    }
}