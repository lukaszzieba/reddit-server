import { DataSource } from 'typeorm';
import {User} from "@user";
import {Post} from "@post";

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'reddit',
    synchronize: true,
    logging: true,
    entities: [User, Post]
});

