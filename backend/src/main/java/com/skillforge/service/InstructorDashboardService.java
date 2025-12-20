package com.skillforge.service;

import com.skillforge.dto.dashboard.CourseSummaryDto;
import com.skillforge.dto.dashboard.InstructorDashboardDto;
import com.skillforge.entity.Course;
import com.skillforge.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class InstructorDashboardService {

    private final CourseRepository courseRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final ModuleRepository moduleRepo;
    private final LessonRepository lessonRepo;
    private final CodingSubmissionRepository codingRepo;

    public InstructorDashboardService(CourseRepository courseRepo,
                                      EnrollmentRepository enrollmentRepo,
                                      ModuleRepository moduleRepo,
                                      LessonRepository lessonRepo,
                                      CodingSubmissionRepository codingRepo) {
        this.courseRepo = courseRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.moduleRepo = moduleRepo;
        this.lessonRepo = lessonRepo;
        this.codingRepo = codingRepo;
    }

    public InstructorDashboardDto getDashboardForInstructor(Long instructorId) {
        // fetch courses authored by this instructor
        List<Course> courses = courseRepo.findAll().stream()
                .filter(c -> c.getInstructorId() != null && c.getInstructorId().equals(instructorId))
                .collect(Collectors.toList());

        long totalCourses = courses.size();

        long totalEnrollments = 0;
        long totalSubmissions = 0;
        List<CourseSummaryDto> list = new ArrayList<>();

        for (Course c : courses) {
            Long cid = c.getId();
            long enrollCount = enrollmentRepo.countByCourseId(cid);
            long moduleCount = moduleRepo.findByCourseIdOrderByPositionAsc(cid).size();
            // count lessons for course via module -> lessons
            long lessonCount = 0;
            for (var m : moduleRepo.findByCourseIdOrderByPositionAsc(cid)) {
                lessonCount += lessonRepo.findByModuleIdOrderByPositionAsc(m.getId()).size();
            }
            long submissionCount = codingRepo.findAll().stream().filter(s -> s.getCourseId().equals(cid)).count();

            totalEnrollments += enrollCount;
            totalSubmissions += submissionCount;

            list.add(new CourseSummaryDto(cid, c.getTitle(), enrollCount, moduleCount, lessonCount, submissionCount));
        }

        // sort courses by enrollments desc
        list.sort((a,b) -> Long.compare(b.enrollments, a.enrollments));

        return new InstructorDashboardDto(totalCourses, totalEnrollments, totalSubmissions, list);
    }
}
