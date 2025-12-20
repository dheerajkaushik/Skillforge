package com.skillforge.coding.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "coding_problems")
public class CodingProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 5000)
    private String description;

    @Column(nullable = false, length = 1000)
    private String inputDescription;

    @Column(nullable = false, length = 1000)
    private String outputDescription;

    @Column(length = 1000)
    private String constraints;

    // ✅ ADDED: Missing field required by Repository 'findByLessonId'
    private Long lessonId;

    // ✅ ADDED: Missing fields used by Frontend/Controller
    private String difficulty; // EASY, MEDIUM, HARD

    @Column(columnDefinition = "TEXT")
    private String starterCode;

    @Column(nullable = false)
    private Integer timeLimitMs;

    @Column(nullable = false)
    private Integer memoryLimitMb;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL)
    @JsonIgnore // Prevent infinite recursion when fetching problem
    private List<TestCase> testCases;

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInputDescription() { return inputDescription; }
    public void setInputDescription(String inputDescription) { this.inputDescription = inputDescription; }

    public String getOutputDescription() { return outputDescription; }
    public void setOutputDescription(String outputDescription) { this.outputDescription = outputDescription; }

    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }

    // ✅ Getter/Setter for lessonId
    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }

    // ✅ Getter/Setter for difficulty
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    // ✅ Getter/Setter for starterCode
    public String getStarterCode() { return starterCode; }
    public void setStarterCode(String starterCode) { this.starterCode = starterCode; }

    public Integer getTimeLimitMs() { return timeLimitMs; }
    public void setTimeLimitMs(Integer timeLimitMs) { this.timeLimitMs = timeLimitMs; }

    public Integer getMemoryLimitMb() { return memoryLimitMb; }
    public void setMemoryLimitMb(Integer memoryLimitMb) { this.memoryLimitMb = memoryLimitMb; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<TestCase> getTestCases() { return testCases; }
    public void setTestCases(List<TestCase> testCases) { this.testCases = testCases; }
}