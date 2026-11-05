package com.attendx.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "sections")
public class Section {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private DegreeClass degreeClass;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "room_number", length = 50)
    private String roomNumber;

    private int capacity = 60;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Section() {}

    public Section(String id, DegreeClass degreeClass, String name, String roomNumber) {
        this.id = id;
        this.degreeClass = degreeClass;
        this.name = name;
        this.roomNumber = roomNumber;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public DegreeClass getDegreeClass() { return degreeClass; }
    public void setDegreeClass(DegreeClass degreeClass) { this.degreeClass = degreeClass; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}

