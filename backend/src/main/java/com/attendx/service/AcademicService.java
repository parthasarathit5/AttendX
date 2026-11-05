package com.attendx.service;

import com.attendx.dto.AcademicDTOs.*;
import com.attendx.entity.*;
import com.attendx.exception.ResourceNotFoundException;
import com.attendx.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AcademicService {

    private final AcademicYearRepository academicYearRepository;
    private final DegreeClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public AcademicService(AcademicYearRepository academicYearRepository,
                           DegreeClassRepository classRepository,
                           SectionRepository sectionRepository,
                           SubjectRepository subjectRepository,
                           TeacherAssignmentRepository teacherAssignmentRepository) {
        this.academicYearRepository = academicYearRepository;
        this.classRepository = classRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
    }

    @Transactional(readOnly = true)
    public List<AcademicYearDTO> getAcademicYears() {
        return academicYearRepository.findAll().stream()
                .map(AcademicYearDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DegreeClassDTO> getClasses() {
        return classRepository.findAll().stream()
                .map(c -> {
                    List<String> sectionNames = sectionRepository.findByDegreeClass(c).stream()
                            .map(Section::getName)
                            .collect(Collectors.toList());
                    if (sectionNames.isEmpty()) {
                        sectionNames = List.of("A", "B");
                    }
                    return DegreeClassDTO.fromEntity(c, sectionNames);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubjectDTO> getSubjects() {
        return subjectRepository.findAll().stream()
                .map(SubjectDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isTeacherAssignedToClassAndSubject(Teacher teacher, DegreeClass degreeClass, String section, Subject subject) {
        return teacherAssignmentRepository
                .findByTeacherAndDegreeClassAndSectionAndSubject(teacher, degreeClass, section, subject)
                .isPresent();
    }
}

