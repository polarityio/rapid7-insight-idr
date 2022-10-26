/*
 * Copyright (c) 2022, Polarity.io, Inc.
 */

class RequestError extends Error {
    constructor(detail, statusCode, body) {
        super(detail);
        this.detail = detail;
        this.name = 'requestError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

module.exports = RequestError;