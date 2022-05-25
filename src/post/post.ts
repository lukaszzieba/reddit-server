import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { User } from '@user';
import { Updoot } from '@updoot';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => User!)
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

    @Field(() => Int)
    @Column({ default: 0 })
    points!: number;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Updoot, (updoot) => updoot.post)
    updoots!: Updoot[];
}
