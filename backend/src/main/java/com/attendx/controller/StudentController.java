package com.attendx.controller;

import com.attendx.dto.ApiResponse;
import com.attendx.dto.CreateStudentRequest;
import com.attendx.dto.StudentDTO;
import com.attendx.dto.UpdateStudentRequest;
import com.attendx.entity.UserRole;
import com.attendx.exception.UnauthorizedException;
import com.attendx.security.SecurityUtils;
import com.attendx.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<StudentDTO>>> getStudents(
            @RequestParam(required = false) String classId,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "registrationNumber") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<StudentDTO> studentPage = studentService.getStudents(classId, section, query, pageable);

        ApiResponse<List<StudentDTO>> response = ApiResponse.success(studentPage.getContent());
        response.setPagination(new ApiResponse.PaginationMetadata(
                studentPage.getNumber(),
                studentPage.getTotalPages(),
                studentPage.getTotalElements(),
                studentPage.getSize()
        ));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')")
    public ResponseEntity<ApiResponse<StudentDTO>> getStudentById(@PathVariable String id) {
        // Enforce ownership if Student role
        if (SecurityUtils.hasRole(UserRole.STUDENT)) {
            StudentDTO student = studentService.getStudentById(id);
            if (!student.getEmail().equalsIgnoreCase(SecurityUtils.getCurrentUserEmail())) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: You may only view your own student academic profile.");
            }
            return ResponseEntity.ok(ApiResponse.success(student));
        }

        StudentDTO student = studentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success(student));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDTO>> createStudent(@Valid @RequestBody CreateStudentRequest req) {
        StudentDTO created = studentService.createStudent(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student record successfully registered in institution database", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDTO>> updateStudent(@PathVariable String id,
                                                                 @Valid @RequestBody UpdateStudentRequest req) {
        StudentDTO updated = studentService.updateStudent(id, req);
        return ResponseEntity.ok(ApiResponse.success("Student record updated successfully", updated));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateStudent(@PathVariable String id) {
        studentService.deactivateStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student account deactivated. Official records preserved in database.", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable String id) {
        studentService.deactivateStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student account deactivated. Official records preserved in database.", null));
    }
}

