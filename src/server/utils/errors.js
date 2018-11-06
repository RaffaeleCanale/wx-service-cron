export class NotFound extends Error {

    constructor(message = 'Resource not found') {
        super(message);
        this.httpCode = 404;
    }

}

export class ValidationError extends Error {

    constructor(message) {
        super(message);
        this.httpCode = 400;
    }

}
