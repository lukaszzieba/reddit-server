import { Connection, EntityManager, IDatabaseDriver } from '@mikro-orm/core';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type MyContext = {
    em: EntityManager<IDatabaseDriver<Connection>>;
    req: Request;
    res: Response;
    redis: Redis;
};

declare module 'express-session' {
    interface SessionData {
        userId: number;
    }
}
