package com.skillforge.coding.repository;

import com.skillforge.coding.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {

    List<TestCase> findByProblemId(Long problemId);

    List<TestCase> findByProblemIdAndIsSampleTrue(Long problemId);
}
