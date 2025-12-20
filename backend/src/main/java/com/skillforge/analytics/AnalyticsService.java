package com.skillforge.analytics;

import java.util.List;

public interface AnalyticsService {
    List<Object[]> getProblemLeaderboard(Long problemId);
}
