package com.skillforge.dto.dashboard;

public class CourseSummaryDto {
    public Long courseId;
    public String title;
    public Long enrollments;
    public Long modules;
    public Long lessons;
    public Long submissions;

    public CourseSummaryDto(Long courseId, String title, Long enrollments, Long modules, Long lessons, Long submissions) {
        this.courseId = courseId;
        this.title = title;
        this.enrollments = enrollments;
        this.modules = modules;
        this.lessons = lessons;
        this.submissions = submissions;
    }
}
