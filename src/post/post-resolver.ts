import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { Post } from '@post';
import { PostService } from '@post/post-service';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '@types';
import { findById } from '@user/user-service';
import { User } from '@user';

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts() {
        return await PostService.getAll();
    }

    @Query(() => Post, { nullable: true })
    async post(@Arg('id') id: number) {
        return await PostService.getOneById(id);
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('title') title: string,
        @Arg('text') text: string,
        @Ctx() { req }: MyContext
    ) {
        const user = await findById(req.session.userId as number);
        return await PostService.create(title, text, user as User);
    }

    @Mutation(() => Post, { nullable: true })
    async updatePOst(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true }) title: string,
        @Arg('text', () => String, { nullable: true }) text: string
    ) {
        return await PostService.update(id, title, text);
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg('id') id: number) {
        await PostService.remove(id);

        return true;
    }
}
