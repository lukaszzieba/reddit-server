import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { User } from '@user';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.posts)
    user: User;

    @Field(() => String)
    @Column()
    title!: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @Column()
    text!: string;

    @Field(() => String)
    @Column({ default: 0 })
    points!: string;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt!: Date;
}
