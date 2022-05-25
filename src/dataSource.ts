import { DataSource, EntityTarget } from 'typeorm';

import { User } from '@user';
import { Post } from '@post';
import path from 'path';
import { Updoot } from './updoot/updoot';

export const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'reddit',
    synchronize: true,
    logging: true,
    entities: [Post, User, Updoot],
    migrationsTableName: 'migrations',
    migrations: [path.join(__dirname, './migrations/*')],
});

export const getQueryBuilder = <T extends EntityTarget<any>>(
    entity: T,
    alias?: string
) => dataSource.getRepository<T>(entity).createQueryBuilder(alias);

// export const getQuery = dataSource.query;
