package com.attendx.controller;

import com.attendx.model.CourseOffering;
import com.attendx.model.CourseSession;
import com.attendx.model.CourseTopic;
import com.attendx.service.CourseOfferingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-offerings")
@CrossOrigin(origins = "*")
public class CourseOfferingController {

    private final CourseOfferingService courseOfferingService;

    public CourseOfferingController(CourseOfferingService courseOfferingService) {
        this.courseOfferingService = courseOfferingService;
    }

    @GetMapping
    public ResponseEntity<List<CourseOffering>> getAll() {
        return ResponseEntity.ok(courseOfferingService.getAllOfferings());
    }

    @GetMapping("/{courseOfferingId}")
    public ResponseEntity<CourseOffering> getById(@PathVariable String courseOfferingId) {
        return courseOfferingService.getOfferingById(courseOfferingId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{courseOfferingId}/topics")
    public ResponseEntity<List<CourseTopic>> getTopics(@PathVariable String courseOfferingId) {
        return ResponseEntity.ok(courseOfferingService.getTopics(courseOfferingId));
    }

    @GetMapping("/{courseOfferingId}/sessions")
    public ResponseEntity<List<CourseSession>> getSessions(@PathVariable String courseOfferingId) {
        return ResponseEntity.ok(courseOfferingService.getSessions(courseOfferingId));
    }
}
