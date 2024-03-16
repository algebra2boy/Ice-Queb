/**
 * Error messages configuration object.
 */
export const ErrorMessages = {
    // Auth service error messages
    USER_NOT_FOUND: (email: string) => `user with ${email} does not exist in the database`,
    USER_PASSWORD_NOT_CORRECT: (email: string) => `user password is not correct for ${email}`,
    USER_ALREADY_EXISTS: (email: string) => `user with ${email} already exists in the database`,
};
