import { Updoot } from '@updoot/updoot';

const create = async (value: number, postId: number, userId: number) => {
    return await Updoot.create({ value, postId, userId }).save();
};

const findOne = async (postId: number, userId: number) => {
    return await Updoot.findOneBy({ postId, userId });
};

const update = async (postId: number, userId: number, value: number) => {
    return await Updoot.update({ postId, userId }, { postId, userId, value });
};

export const UpdootService = {
    create,
    findOne,
    update,
};
