package com.skillforge.analytics;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
//@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/leaderboard/{problemId}")
    public List<Object[]> leaderboard(@PathVariable Long problemId) {
        return analyticsService.getProblemLeaderboard(problemId);
    }
}
