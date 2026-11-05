package com.attendx.repository;

import com.attendx.entity.DegreeClass;
import com.attendx.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, String> {
    List<Section> findByDegreeClass(DegreeClass degreeClass);
    Optional<Section> findByDegreeClassAndName(DegreeClass degreeClass, String name);
}

