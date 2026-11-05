package com.attendx.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "student_guardians")
public class StudentGuardian {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id")
    private UserProfile userProfile;

    @Column(name = "guardian_name", nullable = false, length = 150)
    private String guardianName;

    @Column(nullable = false, length = 50)
    private String relationship;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(length = 100)
    private String occupation;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public StudentGuardian() {}

    public StudentGuardian(String id, Student student, String guardianName, String relationship, String phone) {
        this.id = id;
        this.student = student;
        this.guardianName = guardianName;
        this.relationship = relationship;
        this.phone = phone;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public UserProfile getUserProfile() { return userProfile; }
    public void setUserProfile(UserProfile userProfile) { this.userProfile = userProfile; }

    public String getGuardianName() { return guardianName; }
    public void setGuardianName(String guardianName) { this.guardianName = guardianName; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}

