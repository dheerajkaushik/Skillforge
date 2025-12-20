package com.skillforge.coding.controller;

import com.skillforge.coding.entity.CodingProblem;
import com.skillforge.coding.entity.TestCase;
import com.skillforge.coding.service.CodingProblemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coding/problems")
public class CodingProblemController {

    private final CodingProblemService codingProblemService;

    public CodingProblemController(CodingProblemService codingProblemService) {
        this.codingProblemService = codingProblemService;
    }

    // ===================== INSTRUCTOR APIs =====================

    @PostMapping
    public ResponseEntity<CodingProblem> createProblem(@RequestBody CodingProblem problem) {
        return ResponseEntity.ok(codingProblemService.createProblem(problem));
    }

    @PostMapping("/{problemId}/testcases")
    public ResponseEntity<TestCase> addTestCase(
            @PathVariable Long problemId,
            @RequestBody TestCase testCase
    ) {
        return ResponseEntity.ok(codingProblemService.addTestCase(problemId, testCase));
    }

    // ✅ FIXED: Removed the duplicate definition of this method
    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<CodingProblem>> getProblemsByInstructor(@PathVariable Long instructorId) {
        return ResponseEntity.ok(codingProblemService.getProblemsByInstructor(instructorId));
    }

    // ===================== STUDENT APIs =====================

    // ✅ ADDED: Endpoint to get a single problem by ID (Required for the solving page)
    @GetMapping("/{problemId}")
    public ResponseEntity<CodingProblem> getProblem(@PathVariable Long problemId) {
        return ResponseEntity.ok(codingProblemService.getProblemById(problemId));
    }

    // ✅ ADDED: Endpoint to get problem by Lesson ID (Required for "Solve Problem" button to appear)
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<CodingProblem> getProblemByLesson(@PathVariable Long lessonId) {
        CodingProblem cp = codingProblemService.getProblemByLessonId(lessonId);
        if (cp != null) {
            return ResponseEntity.ok(cp);
        } else {
            return ResponseEntity.noContent().build(); // 204 No Content if no problem attached
        }
    }

    @GetMapping("/{problemId}/samples")
    public ResponseEntity<List<TestCase>> getSampleTestCases(@PathVariable Long problemId) {
        return ResponseEntity.ok(codingProblemService.getSampleTestCases(problemId));
    }
}