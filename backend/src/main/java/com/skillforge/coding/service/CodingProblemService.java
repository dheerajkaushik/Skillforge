package com.skillforge.coding.service;

import com.skillforge.coding.entity.CodingProblem;
import com.skillforge.coding.entity.TestCase;
import java.util.List;

public interface CodingProblemService {

    CodingProblem createProblem(CodingProblem problem);

    CodingProblem getProblemById(Long id);

    TestCase addTestCase(Long problemId, TestCase testCase);

    // ✅ Method required by Controller
    CodingProblem getProblemByLessonId(Long lessonId);

    // ✅ Method required by Controller
    List<CodingProblem> getProblemsByInstructor(Long instructorId);

    // ✅ Method required by Implementation
    List<TestCase> getSampleTestCases(Long problemId);
}