import {
    Arg,
    Ctx,
    Field,
    Int,
    Mutation,
    ObjectType,
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
import { UpdootService } from '@updoot/updoot-service';

@ObjectType()
class PaginationPosts {
    @Field(() => [Post])
    posts: Post[];

    @Field(() => Boolean)
    hashMore: boolean;
}

@Resolver()
export class PostResolver {
    @Query(() => PaginationPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string
    ) {
        const realLimit = Math.min(50, limit);
        const posts = await PostService.getPosts(realLimit + 1, cursor);

        return {
            posts: posts.slice(0, realLimit),
            hashMore: posts.length > realLimit,
        };
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

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const isUp = value !== -1;
        const realVale = isUp ? 1 : -1;
        const { userId } = req.session;

        await PostService.upVote(realVale, postId, userId as number);

        return true
    }
}
