package com.attendx.controller;

import com.attendx.dto.ApiResponse;
import com.attendx.entity.InstitutionSetting;
import com.attendx.exception.ValidationException;
import com.attendx.repository.InstitutionSettingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    private final InstitutionSettingRepository settingRepository;

    public SettingsController(InstitutionSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> getSettings() {
        String threshold = settingRepository.findBySettingKey("attendance_threshold")
                .map(InstitutionSetting::getSettingValue)
                .orElse("75.0");
        String debarred = settingRepository.findBySettingKey("debarred_threshold")
                .map(InstitutionSetting::getSettingValue)
                .orElse("65.0");
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "attendance_threshold", threshold,
                "debarred_threshold", debarred
        )));
    }

    @PutMapping("/threshold")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> updateThreshold(@RequestBody Map<String, Object> body) {
        Object valObj = body.get("threshold");
        if (valObj == null) {
            throw new ValidationException("Threshold percentage is required");
        }

        double val = Double.parseDouble(valObj.toString());
        if (val < 1.0 || val > 100.0) {
            throw new ValidationException("Threshold must be between 1.0% and 100.0%");
        }

        InstitutionSetting setting = settingRepository.findBySettingKey("attendance_threshold")
                .orElse(new InstitutionSetting("set-001", null, "attendance_threshold", "75.0"));

        setting.setSettingValue(String.format("%.1f", val));
        setting.setUpdatedAt(OffsetDateTime.now());
        settingRepository.save(setting);

        return ResponseEntity.ok(ApiResponse.success("Institutional attendance threshold updated to " + val + "%", setting.getSettingValue()));
    }
}

