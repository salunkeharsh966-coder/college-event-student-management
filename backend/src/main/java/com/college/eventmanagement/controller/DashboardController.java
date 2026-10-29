package com.college.eventmanagement.controller;

import com.college.eventmanagement.repository.CollegeEventRepository;
import com.college.eventmanagement.repository.EventRegistrationRepository;
import com.college.eventmanagement.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final StudentRepository students;
    private final CollegeEventRepository events;
    private final EventRegistrationRepository registrations;

    public DashboardController(StudentRepository students, CollegeEventRepository events,
                               EventRegistrationRepository registrations) {
        this.students = students;
        this.events = events;
        this.registrations = registrations;
    }

    @GetMapping
    public Map<String, Long> summary() {
        return Map.of(
                "totalStudents", students.count(),
                "totalEvents", events.count(),
                "totalRegistrations", registrations.count()
        );
    }
}
