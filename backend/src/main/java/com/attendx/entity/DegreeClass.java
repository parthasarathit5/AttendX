package com.attendx.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "classes")
public class DegreeClass {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(name = "year_of_study", nullable = false)
    private int yearOfStudy;

    @Column(nullable = false)
    private int semester;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public DegreeClass() {}

    public DegreeClass(String id, String code, String name, String department, int yearOfStudy, int semester) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.department = department;
        this.yearOfStudy = yearOfStudy;
        this.semester = semester;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }

    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getYearOfStudy() { return yearOfStudy; }
    public void setYearOfStudy(int yearOfStudy) { this.yearOfStudy = yearOfStudy; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}

