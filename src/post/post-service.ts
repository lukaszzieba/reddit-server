import { Post } from '@post';
import { User } from '@user';
import { getQueryBuilder } from '../dataSource';

const getPosts = (limit: number, cursor: string) => {
    const query = getQueryBuilder(Post, 'post')
        .orderBy('"createdAt"', 'DESC')
        .take(limit);

    if (cursor) {
        query.where('"createdAt" < :cursor', {
            cursor: new Date(parseInt(cursor)),
        });
    }

    return query.getMany();
};

const getOneById = (id: number) => {
    return Post.findOneBy({ id });
};

const create = (title: string, text: string, user: User) => {
    return Post.create({ title, text, user }).save();
};

const update = (id: number, title?: string, text?: string) => {
    return Post.update({ id }, { title, text });
};

const remove = (id: number) => {
    return Post.delete({ id });
};

export const PostService = {
    getPosts,
    getOneById,
    create,
    update,
    remove,
};
