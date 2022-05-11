import { ValidationError } from 'joi';

export const errorMap = (error: ValidationError) => {
    return error.details.map(({ message, path }) => ({
        field: path[0].toString(),
        message,
    }));
};
