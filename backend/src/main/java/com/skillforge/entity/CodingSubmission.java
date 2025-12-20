package com.skillforge.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "coding_submissions")
public class CodingSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", nullable=false)
    private Long userId;

    @Column(name="course_id", nullable=false)
    private Long courseId;

    @Column(length=10000)
    private String sourceCode;

    private String language;

    private String result;

    private Instant submittedAt = Instant.now();

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
}
