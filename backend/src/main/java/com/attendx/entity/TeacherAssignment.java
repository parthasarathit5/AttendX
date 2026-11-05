package com.attendx.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "teacher_assignments")
public class TeacherAssignment {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private DegreeClass degreeClass;

    @Column(nullable = false, length = 10)
    private String section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @Column(length = 50)
    private String role = "PRIMARY_FACULTY";

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public TeacherAssignment() {}

    public TeacherAssignment(String id, Teacher teacher, DegreeClass degreeClass, String section, Subject subject) {
        this.id = id;
        this.teacher = teacher;
        this.degreeClass = degreeClass;
        this.section = section;
        this.subject = subject;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public DegreeClass getDegreeClass() { return degreeClass; }
    public void setDegreeClass(DegreeClass degreeClass) { this.degreeClass = degreeClass; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}

