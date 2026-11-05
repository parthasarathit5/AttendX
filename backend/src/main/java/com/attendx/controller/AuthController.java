package com.attendx.controller;

import com.attendx.dto.ApiResponse;
import com.attendx.dto.AuthDTOs.*;
import com.attendx.entity.*;
import com.attendx.exception.ResourceNotFoundException;
import com.attendx.exception.UnauthorizedException;
import com.attendx.repository.*;
import com.attendx.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@Transactional(readOnly = true)
public class AuthController {

    private final UserProfileRepository userProfileRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StudentRepository studentRepository;
    private final StudentGuardianRepository studentGuardianRepository;

    public AuthController(UserProfileRepository userProfileRepository,
                          TeacherRepository teacherRepository,
                          TeacherAssignmentRepository teacherAssignmentRepository,
                          StudentRepository studentRepository,
                          StudentGuardianRepository studentGuardianRepository) {
        this.userProfileRepository = userProfileRepository;
        this.teacherRepository = teacherRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.studentRepository = studentRepository;
        this.studentGuardianRepository = studentGuardianRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User profile not found in institutional database for: " + email));

        return ResponseEntity.ok(ApiResponse.success(buildUserProfileResponse(profile)));
    }

    @PostMapping("/mock-token")
    public ResponseEntity<ApiResponse<MockTokenResponse>> generateMockToken(@RequestBody(required = false) MockTokenRequest req) {
        String roleStr = req != null && req.getRole() != null ? req.getRole().toUpperCase() : "ADMIN";
        String token;
        String email;

        switch (roleStr) {
            case "TEACHER":
                token = "dev-token-teacher-001";
                email = "senthil.k@saveetha.com";
                break;
            case "STUDENT":
                token = "dev-token-student-192211001";
                email = "aarav.sharma@saveetha.com";
                break;
            case "PARENT":
                token = "dev-token-parent-001";
                email = "parent.aarav@gmail.com";
                break;
            case "ADMIN":
            default:
                token = "dev-token-admin";
                email = "admin@attendx.saveetha.com";
                roleStr = "ADMIN";
                break;
        }

        final String finalRole = roleStr;
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Institutional profile not found for demo role: " + finalRole));

        UserProfileResponse response = buildUserProfileResponse(profile);
        return ResponseEntity.ok(ApiResponse.success(new MockTokenResponse(token, finalRole, response)));
    }

    private UserProfileResponse buildUserProfileResponse(UserProfile profile) {
        UserProfileResponse res = new UserProfileResponse();
        res.setId(profile.getId());
        res.setEmail(profile.getEmail());
        res.setFullName(profile.getFullName());
        res.setRole(profile.getRole());
        res.setPhoneNumber(profile.getPhoneNumber());

        if (profile.getInstitution() != null) {
            res.setInstitutionId(profile.getInstitution().getId());
            res.setInstitutionName(profile.getInstitution().getName());
        }

        if (profile.getRole() == UserRole.TEACHER) {
            teacherRepository.findByEmail(profile.getEmail()).ifPresent(teacher -> {
                TeacherSummaryDTO tDto = new TeacherSummaryDTO();
                tDto.setTeacherId(teacher.getId());
                tDto.setEmployeeId(teacher.getEmployeeId());
                tDto.setDepartment(teacher.getDepartment());
                tDto.setDesignation(teacher.getDesignation());
                tDto.setCabinLocation(teacher.getCabinLocation());

                List<TeacherAssignment> assignments = teacherAssignmentRepository.findByTeacher(teacher);
                tDto.setAssignedClasses(assignments.stream().map(a -> a.getDegreeClass().getId()).distinct().collect(Collectors.toList()));
                tDto.setAssignedSubjects(assignments.stream().map(a -> a.getSubject().getCode()).distinct().collect(Collectors.toList()));
                res.setTeacher(tDto);
            });
        } else if (profile.getRole() == UserRole.STUDENT) {
            studentRepository.findByEmail(profile.getEmail()).ifPresent(student -> {
                StudentSummaryDTO sDto = new StudentSummaryDTO();
                sDto.setStudentId(student.getId());
                sDto.setRegistrationNumber(student.getRegistrationNumber());
                sDto.setRollNumber(student.getRollNumber());
                if (student.getDegreeClass() != null) {
                    sDto.setClassId(student.getDegreeClass().getId());
                    sDto.setClassName(student.getDegreeClass().getName());
                }
                sDto.setSection(student.getSection());
                res.setStudent(sDto);
            });
        } else if (profile.getRole() == UserRole.PARENT) {
            List<StudentGuardian> guardians = studentGuardianRepository.findByUserProfile(profile);
            ParentSummaryDTO pDto = new ParentSummaryDTO();
            if (!guardians.isEmpty()) {
                pDto.setGuardianId(guardians.get(0).getId());
                pDto.setGuardianName(guardians.get(0).getGuardianName());
                pDto.setRelationship(guardians.get(0).getRelationship());
            }

            List<StudentSummaryDTO> linkedList = new ArrayList<>();
            for (StudentGuardian g : guardians) {
                Student s = g.getStudent();
                if (s != null) {
                    StudentSummaryDTO sDto = new StudentSummaryDTO();
                    sDto.setStudentId(s.getId());
                    sDto.setRegistrationNumber(s.getRegistrationNumber());
                    sDto.setRollNumber(s.getRollNumber());
                    if (s.getDegreeClass() != null) {
                        sDto.setClassId(s.getDegreeClass().getId());
                        sDto.setClassName(s.getDegreeClass().getName());
                    }
                    sDto.setSection(s.getSection());
                    linkedList.add(sDto);
                }
            }
            pDto.setLinkedStudents(linkedList);
            res.setParent(pDto);
        }

        return res;
    }
}

