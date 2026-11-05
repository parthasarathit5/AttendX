package com.attendx.exception;

public class UnauthorizedException extends ApiException {
    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED_ACCESS");
    }
}

