package com.attendx.repository;

import com.attendx.entity.AttendanceRecord;
import com.attendx.entity.AttendanceSession;
import com.attendx.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, String> {

    List<AttendanceRecord> findBySession(AttendanceSession session);

    List<AttendanceRecord> findByStudent(Student student);

    List<AttendanceRecord> findByRegistrationNumber(String registrationNumber);

    Optional<AttendanceRecord> findBySessionAndStudent(AttendanceSession session, Student student);
}

