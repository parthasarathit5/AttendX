package com.attendx.exception;

public class DuplicateResourceException extends ApiException {
    public DuplicateResourceException(String message) {
        super(message, "DUPLICATE_RESOURCE");
    }
}

