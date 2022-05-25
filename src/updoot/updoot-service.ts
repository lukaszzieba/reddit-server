import { Updoot } from '@updoot/updoot';

const create = async (value: number, postId: number, userId: number) => {
    return await Updoot.create({ value, postId, userId }).save();
};

export const UpdootService = {
    create,
};
