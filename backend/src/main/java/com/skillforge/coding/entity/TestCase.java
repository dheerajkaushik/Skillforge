package com.skillforge.coding.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "test_cases")
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String input;

    @Column(columnDefinition = "TEXT")
    private String expectedOutput;

    // ✅ FIXED: Added this field for the 'isSample' error
    private boolean isSample;

    @ManyToOne
    @JoinColumn(name = "problem_id")
    @JsonIgnore
    private CodingProblem problem;

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }

    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

    // ✅ FIXED: Added getter/setter for isSample
    public boolean isSample() { return isSample; }
    public void setSample(boolean sample) { isSample = sample; }

    // ✅ FIXED: Added getter/setter for CodingProblem object
    public CodingProblem getProblem() { return problem; }
    public void setProblem(CodingProblem problem) { this.problem = problem; }
}