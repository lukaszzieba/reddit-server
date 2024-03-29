import { Post } from '@post';
import { User } from '@user';
import { dataSource } from '../dataSource';
import { UpdootService } from '@updoot/updoot-service';

const getPosts = async (
    limit: number,
    cursor: string,
    userId: number | undefined
) => {
    let parameters: any = [limit];

    if (cursor) {
        parameters = [...parameters, new Date(parseInt(cursor))];
    }

    return await dataSource.query(
        `
            select p.*           
            from post p
            ${cursor ? `where p."createdAt" < $2` : ''}
            order by p."createdAt" DESC
            limit $1
    `,
        parameters
    );
};

const upVote = async (value: number, postId: number, userId: number) => {
    const vote = await UpdootService.findOne(postId, userId);

    if (vote) {
        if (vote.value !== value) {
            await UpdootService.update(postId, userId, value);

            await dataSource.query(
                `
                  START TRANSACTION;       
                  
                  update post 
                  set points = points + ${value}
                  where id = ${postId};
                  
                  COMMIT;
                `
            );
        }
    } else {
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
    }
};

const getOneById = (id: number) => {
    return Post.findOne({ where: { id }, relations: ['user'] });
};

const create = (title: string, text: string, user: User) => {
    return Post.create({ title, text, user }).save();
};

const update = (
    id: number,
    userId: number,
    title?: string,
    text?: string,
    points?: number
) => {
    // return Post.update({ id, user: { id: userId } }, { title, text, points });

    return dataSource
        .createQueryBuilder()
        .update(Post)
        .set({
            title,
            text,
            points,
        })
        .where('id = :id and user.id = :userId', { id, userId })
        .returning('*')
        .execute();
};

const remove = (id: number, userId: number) => {
    return Post.delete({ id, user: { id: userId } });
};

export const PostService = {
    getPosts,
    upVote,
    getOneById,
    create,
    update,
    remove,
};
