import {
    Arg,
    Ctx,
    Field,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
} from 'type-graphql';
import argon2 from 'argon2';

import { MyContext } from '@types';
import { COOKIE_NAME } from '@utils/constants';
import { errorMap } from '@utils/errorMap';

import { User } from '@user';
import {
    emailSchema,
    loginSchema,
    registerSchema,
} from '@user/user-validation';
import {
    createUser,
    findByUsernameOrEmail,
    findById,
} from '@user/user-service';
import {
    createErrorMessage,
    dbDuplicationError,
} from '@user/user-error-messages';

@InputType()
class RegisterInput {
    @Field()
    username: string;

    @Field()
    email: string;

    @Field()
    password: string;
}

@InputType()
class LoginInput {
    @Field()
    usernameOrEmail: string;

    @Field()
    password: string;
}

@ObjectType()
class ErrorField {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [ErrorField], { nullable: true })
    errors?: ErrorField[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(@Ctx() { em, req }: MyContext) {
        if (!req.session.userId) return null;

        return await findById(req.session.userId);
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('registerInput')
        { username, password: plainTextPassword, email }: RegisterInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const { error } = registerSchema.validate({
            username,
            password: plainTextPassword,
            email,
        });

        if (error) {
            return { errors: errorMap(error) };
        }

        const password = await argon2.hash(plainTextPassword);

        try {
            const user = await createUser(username, password, email);
            req.session.userId = user.id;

            return { user };
        } catch (error) {
            console.error(error);
            if (error?.code === '23505') {
                return { errors: dbDuplicationError(error) };
            }
            return createErrorMessage('UNKNOWN');
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('loginInput')
        { usernameOrEmail, password }: LoginInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const { error: loginDataError } = loginSchema.validate({
            usernameOrEmail,
            password,
        });

        if (loginDataError) {
            return { errors: errorMap(loginDataError) };
        }

        const { error: emailError } = emailSchema.validate(usernameOrEmail);

        const query = emailError
            ? { username: usernameOrEmail }
            : { email: usernameOrEmail };

        const user = await findByUsernameOrEmail(query);

        if (!user) {
            return createErrorMessage('NOT_FOUND');
        }

        if (user) {
            const passwordValid = await argon2.verify(user?.password, password);
            if (!passwordValid) {
                return createErrorMessage('INVALID_PASSWORD');
            }
        }

        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() { em, req, res }: MyContext) {
        return new Promise((resolve) => {
            res.clearCookie(COOKIE_NAME);
            req.session.destroy((err) => {
                if (err) {
                    console.error(err);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }
}
