package com.skillforge.dto.dashboard;

import java.util.List;

public class InstructorDashboardDto {
    public Long totalCourses;
    public Long totalEnrollments;
    public Long totalSubmissions;
    public List<CourseSummaryDto> courses;

    public InstructorDashboardDto(Long totalCourses, Long totalEnrollments, Long totalSubmissions, List<CourseSummaryDto> courses) {
        this.totalCourses = totalCourses;
        this.totalEnrollments = totalEnrollments;
        this.totalSubmissions = totalSubmissions;
        this.courses = courses;
    }
}
