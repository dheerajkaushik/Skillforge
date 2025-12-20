package com.skillforge.service;

import com.skillforge.entity.ActivityLog;
import com.skillforge.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

@Service
public class ActivityLogService {
    private final ActivityLogRepository repo;
    public ActivityLogService(ActivityLogRepository repo) { this.repo = repo; }

    public void log(Long userId, String action, String details) {
        ActivityLog a = new ActivityLog();
        a.setUserId(userId);
        a.setAction(action);
        a.setDetails(details);
        repo.save(a);
    }
}
