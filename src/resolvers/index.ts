import { NonEmptyArray } from 'type-graphql';
import { HelloResolver } from './hello';
import { PostResolver } from './post';
import { UserResolver } from './user';

export const resolvers: NonEmptyArray<Function> = [
    HelloResolver,
    PostResolver,
    UserResolver,
];
