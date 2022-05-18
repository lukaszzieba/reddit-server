import * as Joi from 'joi';

export const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),

    password: Joi.string().required(),
    // .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

    email: Joi.string()
        // .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),
}).options({ abortEarly: false });

export const loginSchema = Joi.object({
    usernameOrEmail: Joi.string().required(),

    password: Joi.string().required(),
}).options({ abortEarly: false });

export const emailSchema = Joi.string()
    .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
    })
    .required();
