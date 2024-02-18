type ErrorMessage = { message: string; status: 'failure' };

/**
 * This HttpError class standardizes our response when there is an error on the client or server side.
 *  @example 
 * ```ts
 * import { HttpError } from '../../utils/httpError.util.js';
 * if (condition) {
 *     throw new HttpError(404, {
 *          message: <custom-message>, status: 'failure'
 *     });
 * }
 * ```
 */
export class HttpError extends Error {
    errorCode: number;
    public readonly error: ErrorMessage;

    constructor(errorCode: number, error: ErrorMessage) {
        super(error.message);
        this.errorCode = errorCode;
        this.error = error;
    }
}
