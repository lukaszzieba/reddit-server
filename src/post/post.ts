import { Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class Post {
    [OptionalProps]?: 'createdAt' | 'updatedAt';

    @Field(() => Int)
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({ type: 'date', default: 'now' })
    createdAt!: Date;

    @Field(() => String)
    @Property({ type: 'date', onUpdate: () => new Date(), default: 'now' })
    updatedAt!: Date;

    @Field(() => String)
    @Property({ type: 'text' })
    title!: string;
}
