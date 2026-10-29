package com.college.eventmanagement.repository;

import com.college.eventmanagement.model.CollegeEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CollegeEventRepository extends JpaRepository<CollegeEvent, Long> {}
