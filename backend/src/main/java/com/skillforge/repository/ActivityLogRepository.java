package com.skillforge.repository;

import com.skillforge.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop100ByOrderByCreatedAtDesc();
    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}
