import {
    Entity,
    BaseEntity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Column,
    PrimaryColumn,
    Unique,
} from 'typeorm';
import { User } from '@user/user';
import { Post } from '@post/post';

// m to n
// many to many
// user <-> posts
// user -> join table <- posts
// user -> updoot <- posts

@Entity()
@Unique('customerVote', ['postId', 'userId'])
export class Updoot extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int' })
    value!: number;

    @PrimaryColumn()
    userId!: number;

    @ManyToOne(() => User, (user) => user.updoots)
    user!: User;

    @PrimaryColumn()
    postId!: number;

    @ManyToOne(() => Post, (post) => post.updoots)
    post!: Post;
}
