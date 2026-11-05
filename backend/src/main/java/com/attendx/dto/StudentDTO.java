package com.attendx.dto;

import com.attendx.entity.Student;
import java.time.LocalDate;

public class StudentDTO {
    private String id;
    private String registrationNumber;
    private String rollNumber;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dob;
    private String classId;
    private String className;
    private String section;
    private String academicYearId;
    private String status;
    private String avatarUrl;

    public StudentDTO() {}

    public static StudentDTO fromEntity(Student s) {
        StudentDTO dto = new StudentDTO();
        dto.setId(s.getId());
        dto.setRegistrationNumber(s.getRegistrationNumber());
        dto.setRollNumber(s.getRollNumber());
        dto.setFirstName(s.getFirstName());
        dto.setLastName(s.getLastName());
        dto.setFullName(s.getFullName());
        dto.setEmail(s.getEmail());
        dto.setPhone(s.getPhone());
        dto.setGender(s.getGender());
        dto.setDob(s.getDob());
        if (s.getDegreeClass() != null) {
            dto.setClassId(s.getDegreeClass().getId());
            dto.setClassName(s.getDegreeClass().getName());
        }
        dto.setSection(s.getSection());
        if (s.getAcademicYear() != null) {
            dto.setAcademicYearId(s.getAcademicYear().getId());
        }
        dto.setStatus(s.getStatus());
        dto.setAvatarUrl(s.getAvatarUrl());
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(String academicYearId) { this.academicYearId = academicYearId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}

