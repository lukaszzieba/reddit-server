import { RequestContext } from '@mikro-orm/core';
import { User } from '@user/user';

export const findByUsernameOrEmail = async (
    query: { email: string } | { username: string }
) => {
    const em = RequestContext.getEntityManager();
    if (em) {
        return await em.findOne(User, { ...query });
    }

    throw new Error('Entity manager is missing');
};

export const findById = async (id: number) => {
    const em = RequestContext.getEntityManager();
    if (em) {
        return await em.findOne(User, { id });
    }

    throw new Error('Entity manager is missing');
};

export const createUser = async (
    username: string,
    password: string,
    email: string
) => {
    const em = RequestContext.getEntityManager();

    if (em) {
        const user = em?.create(User, { username, password, email });
        await em.persistAndFlush(user);

        return user;
    }

    throw new Error('Entity manager is missing');
};

export const setNewPassword = async (userId: number, password: string) => {
    const em = RequestContext.getEntityManager();

    if (em) {
        return await em.nativeUpdate(User, { id: userId }, { password });
    }

    throw new Error('Entity manager is missing');
};
