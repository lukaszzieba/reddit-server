type ErrorType = 'INVALID_PASSWORD' | 'NOT_FOUND' | 'UNKNOWN';

const ErrorTypeMap: {
    [key in ErrorType]: {
        errors: { field: string; message: string }[];
    };
} = {
    INVALID_PASSWORD: {
        errors: [{ field: 'password', message: 'Wrong password' }],
    },
    NOT_FOUND: {
        errors: [{ field: 'usernameOrEmail', message: 'user not found' }],
    },
    UNKNOWN: {
        errors: [{ field: 'unknown', message: 'unknown' }],
    },
};

export const createErrorMessage = (errorType: ErrorType) =>
    ErrorTypeMap[errorType];

export const dbDuplicationError = (error: { detail: string }) => {
    let errors = [] as { field: string; message: string }[];

    if (error.detail.includes('email')) {
        errors = [{ field: 'email', message: 'Email already taken' }];
    }

    if (error.detail.includes('username')) {
        errors = [{ field: 'username', message: 'Username already taken' }];
    }

    return errors;
};
