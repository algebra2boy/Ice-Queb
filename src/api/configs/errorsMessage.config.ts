/**
 * Error messages configuration object.
 */
export const ErrorMessages = {
    // Auth service error messages
    USER_NOT_FOUND: (email: string) => `User with ${email} does not exist in the database`,
    USER_PASSWORD_NOT_CORRECT: (email: string) => `User password is not correct for ${email}`,
    USER_ALREADY_EXISTS: (email: string) => `User with ${email} already exists in the database`,

    // Office Hour service error messages
    STUDENT_OFFICE_HOUR_NOT_FOUND: (email: string) =>
        `There is student office hour document; however, no office hour is found for ${email}`,
    STUDENT_OFFICE_HOUR_DOCUMENT_NOT_FOUND: (email: string) =>
        `No student office hour document is found for ${email}`,
    OFFICE_HOUR_ALREADY_EXISTS: 'Office Hour already exists',
    OFFICE_HOUR_NOT_FOUND: 'Office Hour not found',
    OFFICE_HOUR_ID_ALREADY_EXISTS: (officeHourID: string) =>
        `Office Hour ID ${officeHourID} does not exist in the office hour collection`,
};
