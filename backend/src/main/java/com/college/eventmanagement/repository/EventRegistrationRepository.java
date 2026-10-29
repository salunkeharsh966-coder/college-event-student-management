package com.college.eventmanagement.repository;

import com.college.eventmanagement.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    boolean existsByStudentIdAndEventId(Long studentId, Long eventId);
}
