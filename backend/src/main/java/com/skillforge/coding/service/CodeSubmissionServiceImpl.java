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

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CodeSubmissionServiceImpl implements CodeSubmissionService {

    private final CodeSubmissionRepository codeSubmissionRepository;
    private final TestCaseRepository testCaseRepository;
    private final RunnerClient runnerClient;
    private final CodingProblemRepository codingProblemRepository;

    public CodeSubmissionServiceImpl(CodeSubmissionRepository codeSubmissionRepository,
                                     TestCaseRepository testCaseRepository,
                                     RunnerClient runnerClient,
                                     CodingProblemRepository codingProblemRepository) {
        this.codeSubmissionRepository = codeSubmissionRepository;
        this.testCaseRepository = testCaseRepository;
        this.runnerClient = runnerClient;
        this.codingProblemRepository = codingProblemRepository;
    }

    // ✅ FIXED: Signature matches Interface (3 arguments)
    @Override
    public CodeSubmission submitCode(Long problemId, Long studentId, String sourceCode) {

        CodeSubmission submission = new CodeSubmission();

        // Fetch Problem Relationship
        CodingProblem problem = codingProblemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        submission.setProblem(problem);
        submission.setStudentId(studentId);
        submission.setSourceCode(sourceCode); // Ensure CodeSubmission entity has setSourceCode()
        submission.setLanguage("JAVA");
        submission.setSubmittedAt(LocalDateTime.now());

        List<TestCase> testCases = testCaseRepository.findByProblemId(problemId);

        Verdict finalVerdict = Verdict.ACCEPTED;
        int passed = 0;
        int total = testCases.size();

        for (TestCase testCase : testCases) {
            RunnerResult result = runnerClient.runJavaCode(sourceCode, testCase);

            System.out.println("--- Test Case ---");
            System.out.println("Input: " + testCase.getInput());
            System.out.println("Expected: [" + testCase.getExpectedOutput() + "]");
            System.out.println("Actual:   [" + result.getOutput() + "]");

            if (result.getError() != null && !result.getError().isEmpty()) {
                finalVerdict = Verdict.RUNTIME_ERROR;
                break;
            }


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
}