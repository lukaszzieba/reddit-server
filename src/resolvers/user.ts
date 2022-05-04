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
import { User } from '@entities';

@InputType()
class UserInput {
    @Field()
    username: string;

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

        return await em.findOne(User, { id: req.session.userId });
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('registerInput')
        { username, password: plainTextPassword }: UserInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        if (!username?.length) {
            return {
                errors: [
                    { field: 'username', message: 'User can not be empty' },
                ],
            };
        }

        if (!plainTextPassword?.length) {
            return {
                errors: [
                    { field: 'password', message: 'Password can not be empty' },
                ],
            };
        }

        const password = await argon2.hash(plainTextPassword);

        try {
            // const user = (em as EntityManager)
            //     .createQueryBuilder(User)
            //     .getKnexQuery()
            //     .insert({
            //         username,
            //         password,
            //         created_at: new Date(),
            //         updated_at: new Date(),
            //     })
            //     .returning('*');
            const user = em.create(User, { username, password });
            await em.persistAndFlush(user);

            console.log('CREATE SESSION', user.id);

            req.session.userId = user.id;

            console.log(req.session);

            return { user };
        } catch (error) {
            if (error?.code === '23505') {
                return {
                    errors: [
                        { field: 'username', message: 'User already exist' },
                    ],
                };
            }

            return { errors: [{ field: 'unknown', message: 'unknown' }] };
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('loginInput')
        { username, password }: UserInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username });

        if (!user) {
            return {
                errors: [{ field: 'username', message: 'user not fouund' }],
            };
        }

        if (user) {
            const passwordValid = await argon2.verify(user?.password, password);
            if (!passwordValid) {
                return {
                    errors: [
                        { field: 'password', message: 'password invalid' },
                    ],
                };
            }
        }

        req.session.userId = user.id;

        return { user };
    }
}
