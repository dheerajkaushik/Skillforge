package com.skillforge.repository;

import com.skillforge.entity.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, Long> {
    List<CodingSubmission> findByUserId(Long userId);
    List<CodingSubmission> findByCourseId(Long courseId);

}
