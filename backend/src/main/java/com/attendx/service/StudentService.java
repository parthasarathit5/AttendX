package com.attendx.service;

import com.attendx.dto.CreateStudentRequest;
import com.attendx.dto.StudentDTO;
import com.attendx.dto.UpdateStudentRequest;
import com.attendx.entity.*;
import com.attendx.exception.DuplicateResourceException;
import com.attendx.exception.ResourceNotFoundException;
import com.attendx.exception.ValidationException;
import com.attendx.repository.*;
import com.attendx.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class StudentService {

    private static final Logger log = LoggerFactory.getLogger(StudentService.class);

    private final StudentRepository studentRepository;
    private final DegreeClassRepository classRepository;
    private final AcademicYearRepository academicYearRepository;
    private final InstitutionRepository institutionRepository;

    public StudentService(StudentRepository studentRepository,
                          DegreeClassRepository classRepository,
                          AcademicYearRepository academicYearRepository,
                          InstitutionRepository institutionRepository) {
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
        this.academicYearRepository = academicYearRepository;
        this.institutionRepository = institutionRepository;
    }

    @Transactional(readOnly = true)
    public Page<StudentDTO> getStudents(String classId, String section, String query, Pageable pageable) {
        String cleanClassId = (classId != null && !classId.isBlank() && !"ALL".equalsIgnoreCase(classId)) ? classId : null;
        String cleanSection = (section != null && !section.isBlank() && !"ALL".equalsIgnoreCase(section)) ? section : null;
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : null;

        return studentRepository.searchStudents(cleanClassId, cleanSection, cleanQuery, pageable)
                .map(StudentDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public StudentDTO getStudentById(String id) {
        Student student = studentRepository.findById(id)
                .or(() -> studentRepository.findByRegistrationNumber(id))
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with identifier: " + id));
        return StudentDTO.fromEntity(student);
    }

    @Transactional
    public StudentDTO createStudent(CreateStudentRequest req) {
        if (studentRepository.findByRegistrationNumber(req.getRegistrationNumber()).isPresent()) {
            throw new DuplicateResourceException("A student with Registration Number '" + req.getRegistrationNumber() + "' already exists");
        }

        if (studentRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new DuplicateResourceException("A student with email '" + req.getEmail() + "' already exists");
        }

        DegreeClass degreeClass = classRepository.findById(req.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + req.getClassId()));

        Institution institution = degreeClass.getInstitution();
        if (institution == null) {
            institution = institutionRepository.findByCode("SSE-SIMATS").orElse(null);
        }

        AcademicYear academicYear = null;
        if (req.getAcademicYearId() != null) {
            academicYear = academicYearRepository.findById(req.getAcademicYearId()).orElse(null);
        }
        if (academicYear == null) {
            academicYear = academicYearRepository.findByCurrentTrue().orElse(null);
        }

        Student student = new Student();
        student.setId("stu-" + UUID.randomUUID().toString().substring(0, 8));
        student.setInstitution(institution);
        student.setDegreeClass(degreeClass);
        student.setSection(req.getSection());
        student.setAcademicYear(academicYear);
        student.setRegistrationNumber(req.getRegistrationNumber().trim().toUpperCase());
        student.setRollNumber(req.getRollNumber());
        student.setFirstName(req.getFirstName().trim());
        student.setLastName(req.getLastName().trim());
        student.setEmail(req.getEmail().trim().toLowerCase());
        student.setPhone(req.getPhone());
        student.setGender(req.getGender());
        student.setDob(req.getDob());
        student.setBloodGroup(req.getBloodGroup());
        student.setAddress(req.getAddress());
        student.setStatus("ACTIVE");

        Student saved = studentRepository.save(student);
        log.info("Student created successfully: {} ({}) by {}", saved.getFullName(), saved.getRegistrationNumber(), SecurityUtils.getCurrentUserEmail());
        return StudentDTO.fromEntity(saved);
    }

    @Transactional
    public StudentDTO updateStudent(String id, UpdateStudentRequest req) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        // Audit registration number change
        if (req.getRegistrationNumber() != null && !req.getRegistrationNumber().equalsIgnoreCase(student.getRegistrationNumber())) {
            if (req.getAuthorizedRegNoChangeReason() == null || req.getAuthorizedRegNoChangeReason().isBlank()) {
                throw new ValidationException("Modifying official student registration number requires an explicit authorized justification reason.");
            }
            log.warn("REGISTRATION NUMBER MODIFICATION: Student {} changed from {} to {} by {}. Reason: {}",
                    student.getId(), student.getRegistrationNumber(), req.getRegistrationNumber(), SecurityUtils.getCurrentUserEmail(), req.getAuthorizedRegNoChangeReason());
            student.setRegistrationNumber(req.getRegistrationNumber().trim().toUpperCase());
        }

        if (req.getFirstName() != null) student.setFirstName(req.getFirstName().trim());
        if (req.getLastName() != null) student.setLastName(req.getLastName().trim());
        if (req.getPhone() != null) student.setPhone(req.getPhone());
        if (req.getGender() != null) student.setGender(req.getGender());
        if (req.getDob() != null) student.setDob(req.getDob());
        if (req.getBloodGroup() != null) student.setBloodGroup(req.getBloodGroup());
        if (req.getAddress() != null) student.setAddress(req.getAddress());
        if (req.getStatus() != null) student.setStatus(req.getStatus());

        if (req.getClassId() != null) {
            DegreeClass degreeClass = classRepository.findById(req.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + req.getClassId()));
            student.setDegreeClass(degreeClass);
        }
        if (req.getSection() != null) {
            student.setSection(req.getSection());
        }

        student.setUpdatedAt(OffsetDateTime.now());
        Student saved = studentRepository.save(student);
        return StudentDTO.fromEntity(saved);
    }

    @Transactional
    public void deactivateStudent(String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        student.setStatus("INACTIVE");
        student.setUpdatedAt(OffsetDateTime.now());
        studentRepository.save(student);
        log.info("Student deactivated safely: {} ({}) by {}", student.getFullName(), student.getRegistrationNumber(), SecurityUtils.getCurrentUserEmail());
    }
}

