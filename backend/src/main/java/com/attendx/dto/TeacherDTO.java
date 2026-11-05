package com.attendx.dto;

import com.attendx.entity.Teacher;
import java.util.List;

public class TeacherDTO {
    private String id;
    private String employeeId;
    private String fullName;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private String qualification;
    private String specialization;
    private String cabinLocation;
    private String status;
    private List<String> assignedClasses;
    private List<String> assignedSubjects;

    public TeacherDTO() {}

    public static TeacherDTO fromEntity(Teacher t) {
        TeacherDTO dto = new TeacherDTO();
        dto.setId(t.getId());
        dto.setEmployeeId(t.getEmployeeId());
        dto.setFullName(t.getFullName());
        dto.setEmail(t.getEmail());
        dto.setPhone(t.getPhone());
        dto.setDepartment(t.getDepartment());
        dto.setDesignation(t.getDesignation());
        dto.setQualification(t.getQualification());
        dto.setSpecialization(t.getSpecialization());
        dto.setCabinLocation(t.getCabinLocation());
        dto.setStatus(t.getStatus());
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getCabinLocation() { return cabinLocation; }
    public void setCabinLocation(String cabinLocation) { this.cabinLocation = cabinLocation; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getAssignedClasses() { return assignedClasses; }
    public void setAssignedClasses(List<String> assignedClasses) { this.assignedClasses = assignedClasses; }

    public List<String> getAssignedSubjects() { return assignedSubjects; }
    public void setAssignedSubjects(List<String> assignedSubjects) { this.assignedSubjects = assignedSubjects; }
}

