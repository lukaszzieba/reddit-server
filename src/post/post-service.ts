import { Post } from '@post';
import { User } from '@user';
import { dataSource } from '../dataSource';

const getPosts = async (limit: number, cursor: string) => {
    let parameters: any = [limit];

    if (cursor) {
        parameters = [...parameters, new Date(parseInt(cursor))];
    }

    return await dataSource.query(
        `
            select p.*, json_build_object('id', u.id , 'username', u.username , 'email', u.email, 'createdAt', u."createdAt", 'updatedAt', u."updatedAt") user
            from post p inner join "user" u on p."userId" = u.id
            ${cursor ? 'where p."createdAt" < $2' : ''}
            order by p."createdAt" DESC
            limit $1
    `,
        parameters
    );
};

const upVote = async (value: number, postId: number, userId: number) => {
    return await dataSource.query(
        `
          START TRANSACTION;
          
          INSERT INTO updoot ("value", "postId", "userId")
          values (${value}, ${postId}, ${userId});
          
          update post 
          set points = points + ${value}
          where id = ${postId};
          
          COMMIT;
        `
    );
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
    upVote,
    getOneById,
    create,
    update,
    remove,
};
