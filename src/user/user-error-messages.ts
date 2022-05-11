type ErrorType = 'ALREADY_EXIST' | 'INVALID_PASSWORD' | 'NOT_FOUND' | 'UNKNOWN';

const ErrorTypeMap: {
    [key in ErrorType]: {
        errors: { field: string; message: string }[];
    };
} = {
    ALREADY_EXIST: {
        errors: [{ field: 'username', message: 'User already exist' }],
    },
    INVALID_PASSWORD: {
        errors: [{ field: 'username', message: 'User already exist' }],
    },
    NOT_FOUND: {
        errors: [{ field: 'username', message: 'user not found' }],
    },
    UNKNOWN: {
        errors: [{ field: 'unknown', message: 'unknown' }],
    },
};

export const createErrorMessage = (errorType: ErrorType) =>
    ErrorTypeMap[errorType];
