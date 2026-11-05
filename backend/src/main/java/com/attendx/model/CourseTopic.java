package com.attendx.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "course_topics")
public class CourseTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_offering_id")
    @JsonIgnore
    private CourseOffering courseOffering;

    @Column(name = "unit_number", nullable = false)
    @JsonProperty("unit_number")
    private Integer unitNumber;

    @Column(name = "unit_title", nullable = false)
    @JsonProperty("unit_title")
    private String unitTitle;

    @Column(name = "topic_name", nullable = false)
    @JsonProperty("topic_name")
    private String topicName;

    @Column(name = "learning_outcomes", length = 1000)
    @JsonProperty("learning_outcomes")
    private String learningOutcomes;

    @Column(name = "hours_allocated")
    @JsonProperty("hours_allocated")
    private Integer hoursAllocated = 4;

    private Boolean completed = false;

    public CourseTopic() {}

    public CourseTopic(CourseOffering courseOffering, Integer unitNumber, String unitTitle, String topicName, String learningOutcomes, Integer hoursAllocated, Boolean completed) {
        this.courseOffering = courseOffering;
        this.unitNumber = unitNumber;
        this.unitTitle = unitTitle;
        this.topicName = topicName;
        this.learningOutcomes = learningOutcomes;
        this.hoursAllocated = hoursAllocated;
        this.completed = completed;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public CourseOffering getCourseOffering() { return courseOffering; }
    public void setCourseOffering(CourseOffering courseOffering) { this.courseOffering = courseOffering; }

    public Integer getUnitNumber() { return unitNumber; }
    public void setUnitNumber(Integer unitNumber) { this.unitNumber = unitNumber; }

    public String getUnitTitle() { return unitTitle; }
    public void setUnitTitle(String unitTitle) { this.unitTitle = unitTitle; }

    public String getTopicName() { return topicName; }
    public void setTopicName(String topicName) { this.topicName = topicName; }

    public String getLearningOutcomes() { return learningOutcomes; }
    public void setLearningOutcomes(String learningOutcomes) { this.learningOutcomes = learningOutcomes; }

    public Integer getHoursAllocated() { return hoursAllocated; }
    public void setHoursAllocated(Integer hoursAllocated) { this.hoursAllocated = hoursAllocated; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
}
