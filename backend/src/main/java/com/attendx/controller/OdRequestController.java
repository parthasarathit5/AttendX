package com.attendx.controller;

import com.attendx.model.OdRequest;
import com.attendx.service.OdRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/od-requests")
@CrossOrigin(origins = "*")
public class OdRequestController {

    private final OdRequestService odRequestService;

    public OdRequestController(OdRequestService odRequestService) {
        this.odRequestService = odRequestService;
    }

    @GetMapping
    public ResponseEntity<List<OdRequest>> getRequests(
            @RequestParam(required = false) String courseOfferingId,
            @RequestParam(required = false) String registerNumber) {
        if (registerNumber != null) {
            return ResponseEntity.ok(odRequestService.getRequestsByStudent(registerNumber));
        }
        if (courseOfferingId != null) {
            return ResponseEntity.ok(odRequestService.getRequestsByOffering(courseOfferingId));
        }
        return ResponseEntity.ok(odRequestService.getRequestsByOffering("2851d026-2f7b-46c4-92a5-053cf5e4f57d"));
    }

    @PostMapping
    public ResponseEntity<OdRequest> submitRequest(@RequestBody OdRequest req) {
        return ResponseEntity.ok(odRequestService.submitRequest(req));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OdRequest> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String comments = payload.getOrDefault("comments", "Status updated by faculty");
        String reviewer = payload.getOrDefault("reviewer", "Faculty Coordinator");
        return ResponseEntity.ok(odRequestService.updateStatus(id, status, comments, reviewer));
    }
}
