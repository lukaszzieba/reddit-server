import { Middleware } from 'type-graphql/dist/interfaces/Middleware';
import { MyContext } from '@types';
import { ApolloError } from 'apollo-server-express';

export const isAuth: Middleware<MyContext> = ({ context }, next) => {
    if (!context.req.session.userId) {
        throw new ApolloError('User is not authenticated', 'FORBIDDEN');
    }

    return next();
};
