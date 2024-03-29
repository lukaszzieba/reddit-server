import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
} from 'type-graphql';
import argon2 from 'argon2';
import { v4 } from 'uuid';

import { MyContext } from '@types';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '@utils/constants';
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
    setNewPassword,
} from '@user/user-service';
import {
    createErrorMessage,
    dbDuplicationError,
} from '@user/user-error-messages';
import { sendMail } from '@utils';

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

@InputType()
class ResetPasswordInput {
    @Field()
    token: string;

    @Field()
    newPassword: string;

    @Field()
    newPasswordRepeat: string;
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

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => String!)
    email(@Root() user: User, @Ctx() { req }: MyContext) {
        if (req.session.userId === user.id) {
            return user.email;
        }

        return '';
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() { req }: MyContext) {
        if (!req.session.userId) return null;

        return await findById(req.session.userId);
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('registerInput')
        { username, password: plainTextPassword, email }: RegisterInput,
        @Ctx() { req }: MyContext
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
        @Ctx() { req }: MyContext
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
    async logout(@Ctx() { req, res }: MyContext) {
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

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await findByUsernameOrEmail({ email });
        if (!user) {
            return false;
        }

        const token = v4();
        await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id);

        await sendMail(
            user.email,
            `<a href="http://localhost:3000/reset-password/${token}">Reset password</a>`
        );

        return true;
    }

    @Mutation(() => Boolean)
    async resetPassword(
        @Arg('resetPasswordInput')
        { token, newPassword, newPasswordRepeat }: ResetPasswordInput,
        @Ctx() { redis }: MyContext
    ) {
        const userId = await redis.get(FORGOT_PASSWORD_PREFIX + token);
        if (!userId) {
            // TODO
            // throw some error
            return false;
        }

        const passwordsMatch = newPassword === newPasswordRepeat;
        if (!passwordsMatch) {
            // TODO
            // throw some error
            return false;
        }

        try {
            const hashedNewPassword = await argon2.hash(newPassword);
            await setNewPassword(+userId, hashedNewPassword);

            return true;
        } catch (e) {
            console.error(e);

            return false;
        }
    }
}
