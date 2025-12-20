package com.skillforge.analytics;

import org.springframework.stereotype.Service;
import com.skillforge.coding.repository.CodeSubmissionRepository;
import java.util.List;
import java.util.Collections;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final CodeSubmissionRepository repository;

    public AnalyticsServiceImpl(CodeSubmissionRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Object[]> getProblemLeaderboard(Long problemId) {
        return repository.getLeaderboard(problemId);
    }
}
