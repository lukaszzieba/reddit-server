import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { Updoot } from '@updoot';

export const createUpdootLoader = () =>
    new DataLoader<{ postId: number; userId: number }, Updoot | null>(
        async (keys) => {
            // const updoots = await Updoot.findByIds(keys as any);
            const updoots = await Updoot.findBy(keys as any);

            console.log(updoots);
            const data = updoots.reduce<Record<string, Updoot>>(
                (prev, curr, i) => {
                    return {
                        ...prev,
                        ...{ [`${curr.userId}-${curr.postId}`]: curr },
                    };
                },
                {}
            );

            console.log(updoots);

            return keys.map(
                ({ postId, userId }) => data[`${userId}-${postId}`]
            );
        }
    );
