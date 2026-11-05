package com.attendx.repository;

import com.attendx.entity.AttendanceCorrectionAudit;
import com.attendx.entity.AttendanceRecord;
import com.attendx.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceCorrectionAuditRepository extends JpaRepository<AttendanceCorrectionAudit, String> {

    List<AttendanceCorrectionAudit> findByRecordOrderByChangedAtDesc(AttendanceRecord record);

    List<AttendanceCorrectionAudit> findByStudentOrderByChangedAtDesc(Student student);
}

