import {
    Entity,
    BaseEntity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { User } from '@user/user';
import { Post } from '@post/post';

// m to n
// many to many
// user <-> posts
// user -> join table <- posts
// user -> updoot <- posts

@Entity()
export class Updoot extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int' })
    value!: number;

    @Column({ type: 'int' })
    userId!: number;

    @ManyToOne(() => User, (user) => user.updoots)
    user!: User;

    @Column({ type: 'int' })
    postId!: number;

    @ManyToOne(() => Post, (post) => post.updoots)
    post!: Post;
}
