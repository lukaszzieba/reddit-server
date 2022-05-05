import 'module-alias/register';

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { MikroORM } from '@mikro-orm/core';
import { buildSchema } from 'type-graphql';

import { createClient } from 'redis';
import connectRedis from 'connect-redis';
import session from 'express-session';
import cors from 'cors';

import microConfig from '@config';
import { resolvers } from '@resolvers';
import { isProd } from '@utils';
import { MyContext } from '@types';
import { COOKIE_NAME } from '@utils/constants';

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const app = express();

    app.set('trust proxy', !isProd);

    const redisClient = createClient({ legacyMode: true });
    const redisStore = connectRedis(session);
    redisClient.connect().catch(console.error);
    const whitelist = [
        'http://localhost:3000',
        'http://localhost:4000/graphql',
        'https://studio.apollographql.com',
    ];

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
            store: new redisStore({ client: redisClient, disableTouch: true }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly: true,
                sameSite: 'lax',
                secure: isProd,
            },
            saveUninitialized: false,
            secret: 'keyboard cat',
            resave: false,
        })
    );

    app.get('/', (_, res) => {
        res.send('Hello');
    });

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers,
            validate: false,
        }),
        context: ({ req, res }: MyContext) => ({ em: orm.em, req, res }),
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });

    app.listen(4000, () => {
        console.log('Server started on localhost:4000');
    });
};

main().catch((err) => {
    console.error(err);
});
