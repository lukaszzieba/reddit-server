import { Post } from '@post/post';
import { User } from '@user';

const getAll = () => {
    return Post.find();
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
    getAll,
    getOneById,
    create,
    update,
    remove,
};
