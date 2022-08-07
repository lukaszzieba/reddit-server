import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { Post } from '@post';
import { PostService } from '@post/post-service';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '@types';
import * as UserService from '@user/user-service';
import { User } from '@user';

@ObjectType()
class PaginationPosts {
    @Field(() => [Post])
    posts: Post[];

    @Field(() => Boolean)
    hashMore: boolean;
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String!)
    textSnippet(@Root() post: Post) {
        return post.text.slice(0, 50);
    }

    @FieldResolver(() => User!)
    user(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
        return userLoader.load(post.userId);
    }

    @FieldResolver(() => Int, { nullable: true })
    async voteStatus(
        @Root() post: Post,
        @Ctx() { updootLoader, req }: MyContext
    ) {
        const userId = req.session.userId as number;

        if (!userId) {
            return null;
        }

        const updoot = await updootLoader.load({
            postId: post.id,
            userId,
        });

        return updoot ? updoot.value : null;
    }

    @Query(() => PaginationPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string,
        @Ctx() { req }: MyContext
    ) {
        const realLimit = Math.min(50, limit);
        const posts = await PostService.getPosts(
            realLimit + 1,
            cursor,
            req.session.userId
        );

        return {
            posts: posts.slice(0, realLimit),
            hashMore: posts.length > realLimit,
        };
    }

    @Query(() => Post, { nullable: true })
    async post(@Arg('id', () => Int) id: number) {
        return await PostService.getOneById(id);
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('title') title: string,
        @Arg('text') text: string,
        @Ctx() { req }: MyContext
    ) {
        const user = await UserService.findById(req.session.userId as number);
        return await PostService.create(title, text, user as User);
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String, { nullable: true }) title: string,
        @Arg('text', () => String, { nullable: true }) text: string,
        @Ctx() { req }: MyContext
    ) {
        const userId = req.session.userId as number;
        const updateResult = await PostService.update(id, userId, title, text);

        return updateResult.raw[0];
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { req }: MyContext
    ) {
        const userId = req.session.userId;
        await PostService.remove(id, userId as number);

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

        const result = await PostService.upVote(
            realVale,
            postId,
            userId as number
        );

        return true;
    }
}
