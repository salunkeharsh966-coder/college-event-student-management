package com.college.eventmanagement.controller;

import com.college.eventmanagement.model.CollegeEvent;
import com.college.eventmanagement.repository.CollegeEventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class CollegeEventController {
    private final CollegeEventRepository events;

    public CollegeEventController(CollegeEventRepository events) {
        this.events = events;
    }

    @GetMapping
    public List<CollegeEvent> getAll() {
        return events.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CollegeEvent create(@RequestBody CollegeEvent event) {
        if (event.getTitle() == null || event.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event title is required");
        }
        event.setId(null);
        return events.save(event);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!events.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        }
        events.deleteById(id);
    }
}
