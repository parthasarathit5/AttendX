package com.attendx.controller;

import com.attendx.dto.ApiResponse;
import com.attendx.dto.TeacherDTO;
import com.attendx.service.TeacherService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<TeacherDTO>>> getAllTeachers() {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getAllTeachers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<TeacherDTO>> getTeacherById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getTeacherById(id)));
    }
}

