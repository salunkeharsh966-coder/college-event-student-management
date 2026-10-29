package com.college.eventmanagement.controller;

import com.college.eventmanagement.model.CollegeEvent;
import com.college.eventmanagement.model.EventRegistration;
import com.college.eventmanagement.model.Student;
import com.college.eventmanagement.repository.CollegeEventRepository;
import com.college.eventmanagement.repository.EventRegistrationRepository;
import com.college.eventmanagement.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {
    private final EventRegistrationRepository registrations;
    private final StudentRepository students;
    private final CollegeEventRepository events;

    public RegistrationController(EventRegistrationRepository registrations,
                                  StudentRepository students,
                                  CollegeEventRepository events) {
        this.registrations = registrations;
        this.students = students;
        this.events = events;
    }

    @GetMapping
    public List<EventRegistration> getAll() {
        return registrations.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventRegistration register(@RequestBody Map<String, Long> body) {
        Long studentId = body.get("studentId");
        Long eventId = body.get("eventId");
        if (studentId == null || eventId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId and eventId are required");
        }
        Student student = students.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        CollegeEvent event = events.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        if (registrations.existsByStudentIdAndEventId(studentId, eventId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student is already registered for this event");
        }
        EventRegistration registration = new EventRegistration();
        registration.setStudent(student);
        registration.setEvent(event);
        return registrations.save(registration);
    }
}
