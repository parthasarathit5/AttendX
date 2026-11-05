package com.attendx.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "od_requests")
public class OdRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "register_number", nullable = false)
    @JsonProperty("register_number")
    private String registerNumber;

    @Column(name = "student_name", nullable = false)
    @JsonProperty("student_name")
    private String studentName;

    @Column(name = "course_offering_id", nullable = false)
    @JsonProperty("course_offering_id")
    private String courseOfferingId;

    @Column(name = "session_number", nullable = false)
    @JsonProperty("session_number")
    private Integer sessionNumber;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String reason;

    private String category = "Symposium"; // Symposium, Sports, Medical, Conference

    @Column(name = "proof_document_url")
    @JsonProperty("proof_document_url")
    private String proofDocumentUrl;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "reviewed_by")
    @JsonProperty("reviewed_by")
    private String reviewedBy;

    @Column(name = "review_comments")
    @JsonProperty("review_comments")
    private String reviewComments;

    @Column(name = "created_at")
    @JsonProperty("created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public OdRequest() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getCourseOfferingId() { return courseOfferingId; }
    public void setCourseOfferingId(String courseOfferingId) { this.courseOfferingId = courseOfferingId; }

    public Integer getSessionNumber() { return sessionNumber; }
    public void setSessionNumber(Integer sessionNumber) { this.sessionNumber = sessionNumber; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getProofDocumentUrl() { return proofDocumentUrl; }
    public void setProofDocumentUrl(String proofDocumentUrl) { this.proofDocumentUrl = proofDocumentUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public String getReviewComments() { return reviewComments; }
    public void setReviewComments(String reviewComments) { this.reviewComments = reviewComments; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
