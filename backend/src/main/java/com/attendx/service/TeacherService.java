package com.attendx.service;

import com.attendx.dto.TeacherDTO;
import com.attendx.entity.Teacher;
import com.attendx.entity.TeacherAssignment;
import com.attendx.exception.ResourceNotFoundException;
import com.attendx.repository.TeacherAssignmentRepository;
import com.attendx.repository.TeacherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public TeacherService(TeacherRepository teacherRepository,
                          TeacherAssignmentRepository teacherAssignmentRepository) {
        this.teacherRepository = teacherRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
    }

    @Transactional(readOnly = true)
    public List<TeacherDTO> getAllTeachers() {
        return teacherRepository.findAll().stream()
                .map(this::enrichTeacherDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeacherDTO getTeacherById(String id) {
        Teacher teacher = teacherRepository.findById(id)
                .or(() -> teacherRepository.findByEmployeeId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with identifier: " + id));
        return enrichTeacherDTO(teacher);
    }

    @Transactional(readOnly = true)
    public Teacher getTeacherEntityByEmail(String email) {
        return teacherRepository.findByEmail(email).orElse(null);
    }

    private TeacherDTO enrichTeacherDTO(Teacher teacher) {
        TeacherDTO dto = TeacherDTO.fromEntity(teacher);
        List<TeacherAssignment> assignments = teacherAssignmentRepository.findByTeacher(teacher);
        dto.setAssignedClasses(assignments.stream().map(a -> a.getDegreeClass().getId()).distinct().collect(Collectors.toList()));
        dto.setAssignedSubjects(assignments.stream().map(a -> a.getSubject().getCode()).distinct().collect(Collectors.toList()));
        return dto;
    }
}

