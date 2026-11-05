package com.attendx.controller;

import com.attendx.dto.AcademicDTOs.AcademicYearDTO;
import com.attendx.dto.AcademicDTOs.DegreeClassDTO;
import com.attendx.dto.AcademicDTOs.SubjectDTO;
import com.attendx.dto.ApiResponse;
import com.attendx.service.AcademicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academics")
public class AcademicController {

    private final AcademicService academicService;

    public AcademicController(AcademicService academicService) {
        this.academicService = academicService;
    }

    @GetMapping("/years")
    public ResponseEntity<ApiResponse<List<AcademicYearDTO>>> getAcademicYears() {
        return ResponseEntity.ok(ApiResponse.success(academicService.getAcademicYears()));
    }

    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<DegreeClassDTO>>> getClasses() {
        return ResponseEntity.ok(ApiResponse.success(academicService.getClasses()));
    }

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<SubjectDTO>>> getSubjects() {
        return ResponseEntity.ok(ApiResponse.success(academicService.getSubjects()));
    }
}

