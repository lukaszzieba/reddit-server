import 'module-alias/register';

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import Redis from 'ioredis';
import connectRedis from 'connect-redis';
import session from 'express-session';
import cors from 'cors';
import compression from 'compression';

import { isProd } from '@utils';
import { MyContext } from '@types';
import { COOKIE_NAME } from '@utils/constants';

import { UserResolver } from '@user';
import { PostResolver } from '@post';
import { dataSource } from './dataSource';
import { createUserLoader } from '@utils/createUserLoader';
import { createUpdootLoader } from '@utils/createVoteStatusLoader';

const main = async () => {
    await dataSource.initialize();
    await  dataSource.runMigrations();

    const app = express();

    app.set('trust proxy', !isProd);

    const redis = new Redis(process.env.REDIS_URL as string);
    const redisStore = connectRedis(session);

    const whitelist = [
        process.env.CORS_ORIGIN,
        'https://studio.apollographql.com',
    ];

    app.use(compression());
    app.set('trust proxy', 1);
    app.use(
        cors({
            origin: function (origin, callback) {
                if (!origin) {
                    callback(null, true);

                    return;
                }

                if (origin && whitelist.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        })
    );

    app.use(
        session({
            name: COOKIE_NAME,
            store: new redisStore({
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly: true,
                sameSite: 'lax',
                secure: isProd,
                domain: isProd ? ".finchdev.com " : undefined
            },
            saveUninitialized: false,
            secret: process.env.SECRET as string,
            resave: false,
        })
    );

    app.get('/', (_, res) => {
        res.send('Hello');
    });

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }: MyContext) => ({
            req,
            res,
            redis,
            userLoader: createUserLoader(),
            updootLoader: createUpdootLoader(),
        }),
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });

    app.listen(process.env.PORT, () => {
        console.log('Server started on localhost:4000');
    });
};

main().catch((err) => {
    console.error(err);
});
