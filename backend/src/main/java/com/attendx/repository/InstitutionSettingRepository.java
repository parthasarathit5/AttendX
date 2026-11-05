package com.attendx.repository;

import com.attendx.entity.InstitutionSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstitutionSettingRepository extends JpaRepository<InstitutionSetting, String> {
    Optional<InstitutionSetting> findBySettingKey(String settingKey);
}

