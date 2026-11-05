package com.attendx.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private Instant timestamp;
    private String errorCode;
    private Map<String, String> validationErrors;
    private PaginationMetadata pagination;

    public ApiResponse() {
        this.timestamp = Instant.now();
    }

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = Instant.now();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Operation successful", data);
    }

    public static <T> ApiResponse<T> error(String message, String errorCode) {
        ApiResponse<T> response = new ApiResponse<>(false, message, null);
        response.setErrorCode(errorCode);
        return response;
    }

    public static <T> ApiResponse<T> validationError(String message, Map<String, String> fieldErrors) {
        ApiResponse<T> response = new ApiResponse<>(false, message, null);
        response.setErrorCode("VALIDATION_FAILED");
        response.setValidationErrors(fieldErrors);
        return response;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public Map<String, String> getValidationErrors() { return validationErrors; }
    public void setValidationErrors(Map<String, String> validationErrors) { this.validationErrors = validationErrors; }

    public PaginationMetadata getPagination() { return pagination; }
    public void setPagination(PaginationMetadata pagination) { this.pagination = pagination; }

    public static class PaginationMetadata {
        private int currentPage;
        private int totalPages;
        private long totalElements;
        private int pageSize;

        public PaginationMetadata(int currentPage, int totalPages, long totalElements, int pageSize) {
            this.currentPage = currentPage;
            this.totalPages = totalPages;
            this.totalElements = totalElements;
            this.pageSize = pageSize;
        }

        public int getCurrentPage() { return currentPage; }
        public int getTotalPages() { return totalPages; }
        public long getTotalElements() { return totalElements; }
        public int getPageSize() { return pageSize; }
    }
}

