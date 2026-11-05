package com.attendx.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "course_sessions")
public class CourseSession {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "course_offering_id", nullable = false)
    @JsonProperty("course_offering_id")
    private String courseOfferingId;

    @Column(name = "session_number", nullable = false)
    @JsonProperty("session_number")
    private Integer sessionNumber;

    @Column(name = "session_date", nullable = false)
    @JsonProperty("session_date")
    private LocalDate sessionDate;

    @Column(name = "session_type")
    @JsonProperty("session_type")
    private String sessionType = "Theory"; // Theory, Lab, Practical

    @Column(nullable = false)
    private String title;

    @Column(name = "before_class_content", length = 1500)
    @JsonProperty("before_class_content")
    private String beforeClassContent;

    @Column(name = "in_class_activity", length = 1500)
    @JsonProperty("in_class_activity")
    private String inClassActivity;

    @Column(name = "after_class_task", length = 1500)
    @JsonProperty("after_class_task")
    private String afterClassTask;

    @Column(name = "qr_code_token")
    @JsonProperty("qr_code_token")
    private String qrCodeToken;

    @Column(name = "is_active")
    @JsonProperty("is_active")
    private Boolean isActive = false;

    @Column(name = "created_at")
    @JsonProperty("created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public CourseSession() {}

    public CourseSession(String courseOfferingId, Integer sessionNumber, LocalDate sessionDate, String sessionType, String title, String beforeClassContent, String inClassActivity, String afterClassTask) {
        this.courseOfferingId = courseOfferingId;
        this.sessionNumber = sessionNumber;
        this.sessionDate = sessionDate;
        this.sessionType = sessionType;
        this.title = title;
        this.beforeClassContent = beforeClassContent;
        this.inClassActivity = inClassActivity;
        this.afterClassTask = afterClassTask;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCourseOfferingId() { return courseOfferingId; }
    public void setCourseOfferingId(String courseOfferingId) { this.courseOfferingId = courseOfferingId; }

    public Integer getSessionNumber() { return sessionNumber; }
    public void setSessionNumber(Integer sessionNumber) { this.sessionNumber = sessionNumber; }

    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBeforeClassContent() { return beforeClassContent; }
    public void setBeforeClassContent(String beforeClassContent) { this.beforeClassContent = beforeClassContent; }

    public String getInClassActivity() { return inClassActivity; }
    public void setInClassActivity(String inClassActivity) { this.inClassActivity = inClassActivity; }

    public String getAfterClassTask() { return afterClassTask; }
    public void setAfterClassTask(String afterClassTask) { this.afterClassTask = afterClassTask; }

    public String getQrCodeToken() { return qrCodeToken; }
    public void setQrCodeToken(String qrCodeToken) { this.qrCodeToken = qrCodeToken; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
