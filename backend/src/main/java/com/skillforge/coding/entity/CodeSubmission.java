package com.skillforge.coding.entity;

//import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*; // Use javax.persistence if on older Spring Boot
import java.time.LocalDateTime;

@Entity
@Table(name = "code_submissions")
public class CodeSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ FIXED: Relationship to CodingProblem (replaces simple problemId Long)
    @ManyToOne
    @JoinColumn(name = "problem_id", nullable = false)
    @JsonIgnoreProperties({"submissions", "hibernateLazyInitializer", "handler"})// Prevent infinite recursion when serializing
    private CodingProblem problem;

    private Long studentId;

    @Column(columnDefinition = "TEXT")
    private String sourceCode; // ✅ FIXED: Standardized name

    private String language;

    private String verdict; // e.g., ACCEPTED, WRONG_ANSWER

    private Integer passedTestCases;
    private Integer totalTestCases;
    private boolean accepted;

    private LocalDateTime submittedAt;

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CodingProblem getProblem() { return problem; }
    // ✅ This fixes "cannot find symbol method setProblem"
    public void setProblem(CodingProblem problem) { this.problem = problem; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getSourceCode() { return sourceCode; }
    // ✅ This fixes "cannot find symbol method setCode" (by renaming service call to setSourceCode)
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }

    public Integer getPassedTestCases() { return passedTestCases; }
    public void setPassedTestCases(Integer passedTestCases) { this.passedTestCases = passedTestCases; }

    public Integer getTotalTestCases() { return totalTestCases; }
    public void setTotalTestCases(Integer totalTestCases) { this.totalTestCases = totalTestCases; }

    public boolean isAccepted() { return accepted; }
    public void setAccepted(boolean accepted) { this.accepted = accepted; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}