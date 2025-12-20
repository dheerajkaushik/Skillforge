package com.skillforge.coding.repository;

import com.skillforge.coding.entity.CodeSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface CodeSubmissionRepository extends JpaRepository<CodeSubmission, Long> {

    List<CodeSubmission> findByProblemIdAndStudentId(Long problemId, Long studentId);

    List<CodeSubmission> findByStudentId(Long studentId);
    List<CodeSubmission> findByProblemId(Long problemId);

    @Query("SELECT cs.studentId, COUNT(cs) FROM CodeSubmission cs WHERE cs.problem.id = :problemId AND cs.accepted = true GROUP BY cs.studentId ORDER BY COUNT(cs) DESC")
    List<Object[]> getLeaderboard(@Param("problemId") Long problemId);

}
