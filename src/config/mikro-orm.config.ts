import path from 'path';
import { MikroORM } from '@mikro-orm/core';

import { isProd } from '@utils';
import { Post } from '@post';
import { User } from '@user';

export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
    },
    allowGlobalContext: true,
    entities: [Post, User],
    dbName: 'reddit',
    type: 'postgresql',
    debug: !isProd,
} as Parameters<typeof MikroORM.init>[0];
