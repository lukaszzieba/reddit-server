import { User } from '@user/user';
import { In } from 'typeorm';

export const findByUsernameOrEmail = async (
    query: { email: string } | { username: string }
) => {
    return await User.findOneBy({ ...query });
};

export const findById = async (id: number) => {
    return await User.findOneBy({ id });
};

export const createUser = async (
    username: string,
    password: string,
    email: string
) => {
    return await User.create({ username, password, email }).save();
};

export const setNewPassword = async (userId: number, password: string) => {
    return await User.update({ id: userId }, { password });
};

export const getUsersByIds = async (ids: number[]) => {
    return await User.findBy({ id: In(ids) });
};
