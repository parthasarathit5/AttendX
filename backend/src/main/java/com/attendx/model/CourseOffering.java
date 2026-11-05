package com.attendx.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "course_offerings")
public class CourseOffering {

    @Id
    @Column(name = "course_offering_id")
    @JsonProperty("course_offering_id")
    private String courseOfferingId;

    @Column(name = "course_code", nullable = false)
    @JsonProperty("course_code")
    private String courseCode;

    @Column(name = "course_name", nullable = false)
    @JsonProperty("course_name")
    private String courseName;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String semester;

    @Column(name = "academic_year", nullable = false)
    @JsonProperty("academic_year")
    private String academicYear;

    private Integer credits = 4;

    @Column(name = "faculty_name")
    @JsonProperty("faculty_name")
    private String facultyName;

    private Boolean launched = true;

    @Column(name = "syllabus_summary", length = 2000)
    @JsonProperty("syllabus_summary")
    private String syllabusSummary;

    @OneToMany(mappedBy = "courseOffering", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CourseTopic> topics = new ArrayList<>();

    @Column(name = "created_at")
    @JsonProperty("created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public CourseOffering() {}

    public CourseOffering(String courseOfferingId, String courseCode, String courseName, String department, String semester, String academicYear, Integer credits, String facultyName) {
        this.courseOfferingId = courseOfferingId;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.department = department;
        this.semester = semester;
        this.academicYear = academicYear;
        this.credits = credits;
        this.facultyName = facultyName;
    }

    public String getCourseOfferingId() { return courseOfferingId; }
    public void setCourseOfferingId(String courseOfferingId) { this.courseOfferingId = courseOfferingId; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public Boolean getLaunched() { return launched; }
    public void setLaunched(Boolean launched) { this.launched = launched; }

    public String getSyllabusSummary() { return syllabusSummary; }
    public void setSyllabusSummary(String syllabusSummary) { this.syllabusSummary = syllabusSummary; }

    public List<CourseTopic> getTopics() { return topics; }
    public void setTopics(List<CourseTopic> topics) { this.topics = topics; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
