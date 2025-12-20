package com.skillforge.coding.service;

import com.skillforge.coding.entity.CodeSubmission;
import java.util.List;

public interface CodeSubmissionService {

    // ✅ Signature: 3 arguments
    CodeSubmission submitCode(Long problemId, Long studentId, String sourceCode);

    List<CodeSubmission> getSubmissionsByStudent(Long studentId);

    List<CodeSubmission> getSubmissionsByProblem(Long problemId);
}