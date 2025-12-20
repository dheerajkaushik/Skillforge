package com.skillforge.coding.service;

import com.skillforge.coding.entity.CodingProblem;
import com.skillforge.coding.entity.TestCase;
import com.skillforge.coding.repository.CodingProblemRepository;
import com.skillforge.coding.repository.TestCaseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CodingProblemServiceImpl implements CodingProblemService {

    private final CodingProblemRepository codingProblemRepository;
    private final TestCaseRepository testCaseRepository;

    public CodingProblemServiceImpl(CodingProblemRepository codingProblemRepository,
                                    TestCaseRepository testCaseRepository) {
        this.codingProblemRepository = codingProblemRepository;
        this.testCaseRepository = testCaseRepository;
    }

    @Override
    public CodingProblem createProblem(CodingProblem problem) {
        problem.setCreatedAt(LocalDateTime.now());
        return codingProblemRepository.save(problem);
    }

    @Override
    public CodingProblem getProblemById(Long id) {
        return codingProblemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
    }

    @Override
    public TestCase addTestCase(Long problemId, TestCase testCase) {
        CodingProblem problem = getProblemById(problemId);
        testCase.setProblem(problem); // Ensure TestCase entity has setProblem()
        return testCaseRepository.save(testCase);
    }

    // ✅ FIXED: Implements the interface method
    @Override
    public CodingProblem getProblemByLessonId(Long lessonId) {
        return codingProblemRepository.findByLessonId(lessonId).orElse(null);
    }

    // ✅ FIXED: Implements the interface method
    @Override
    public List<CodingProblem> getProblemsByInstructor(Long instructorId) {
        return codingProblemRepository.findByCreatedBy(instructorId);
    }

    // ✅ FIXED: Implements the interface method
    @Override
    public List<TestCase> getSampleTestCases(Long problemId) {
        return testCaseRepository.findByProblemId(problemId)
                .stream()
                .filter(TestCase::isSample) // Ensure TestCase entity has isSample()
                .collect(Collectors.toList());
    }
}