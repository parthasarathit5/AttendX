package com.attendx.dto;

import com.attendx.entity.UserRole;
import java.util.List;

public class AuthDTOs {

    public static class UserProfileResponse {
        private String id;
        private String email;
        private String fullName;
        private UserRole role;
        private String phoneNumber;
        private String institutionId;
        private String institutionName;
        private TeacherSummaryDTO teacher;
        private StudentSummaryDTO student;
        private ParentSummaryDTO parent;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public UserRole getRole() { return role; }
        public void setRole(UserRole role) { this.role = role; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getInstitutionId() { return institutionId; }
        public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }
        public String getInstitutionName() { return institutionName; }
        public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
        public TeacherSummaryDTO getTeacher() { return teacher; }
        public void setTeacher(TeacherSummaryDTO teacher) { this.teacher = teacher; }
        public StudentSummaryDTO getStudent() { return student; }
        public void setStudent(StudentSummaryDTO student) { this.student = student; }
        public ParentSummaryDTO getParent() { return parent; }
        public void setParent(ParentSummaryDTO parent) { this.parent = parent; }
    }

    public static class TeacherSummaryDTO {
        private String teacherId;
        private String employeeId;
        private String department;
        private String designation;
        private String cabinLocation;
        private List<String> assignedClasses;
        private List<String> assignedSubjects;

        public String getTeacherId() { return teacherId; }
        public void setTeacherId(String teacherId) { this.teacherId = teacherId; }
        public String getEmployeeId() { return employeeId; }
        public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getDesignation() { return designation; }
        public void setDesignation(String designation) { this.designation = designation; }
        public String getCabinLocation() { return cabinLocation; }
        public void setCabinLocation(String cabinLocation) { this.cabinLocation = cabinLocation; }
        public List<String> getAssignedClasses() { return assignedClasses; }
        public void setAssignedClasses(List<String> assignedClasses) { this.assignedClasses = assignedClasses; }
        public List<String> getAssignedSubjects() { return assignedSubjects; }
        public void setAssignedSubjects(List<String> assignedSubjects) { this.assignedSubjects = assignedSubjects; }
    }

    public static class StudentSummaryDTO {
        private String studentId;
        private String registrationNumber;
        private String rollNumber;
        private String classId;
        private String className;
        private String section;
        private double attendancePercentage;

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
        public String getClassId() { return classId; }
        public void setClassId(String classId) { this.classId = classId; }
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }
        public double getAttendancePercentage() { return attendancePercentage; }
        public void setAttendancePercentage(double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    }

    public static class ParentSummaryDTO {
        private String guardianId;
        private String guardianName;
        private String relationship;
        private List<StudentSummaryDTO> linkedStudents;

        public String getGuardianId() { return guardianId; }
        public void setGuardianId(String guardianId) { this.guardianId = guardianId; }
        public String getGuardianName() { return guardianName; }
        public void setGuardianName(String guardianName) { this.guardianName = guardianName; }
        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
        public List<StudentSummaryDTO> getLinkedStudents() { return linkedStudents; }
        public void setLinkedStudents(List<StudentSummaryDTO> linkedStudents) { this.linkedStudents = linkedStudents; }
    }

    public static class MockTokenRequest {
        private String role;
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class MockTokenResponse {
        private String token;
        private String role;
        private UserProfileResponse profile;

        public MockTokenResponse() {}
        public MockTokenResponse(String token, String role, UserProfileResponse profile) {
            this.token = token;
            this.role = role;
            this.profile = profile;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public UserProfileResponse getProfile() { return profile; }
        public void setProfile(UserProfileResponse profile) { this.profile = profile; }
    }
}

