import DataLoader from 'dataloader';
import { getUsersByIds } from '@user/user-service';
import { User } from '@user';

export const createUserLoader = () =>
    new DataLoader<number, User>(async (userIds) => {
        const users = await getUsersByIds(userIds as number[]);
        const data = users.reduce<Record<string, User>>((prev, curr, i) => {
            return { ...prev, ...{ [curr.id]: curr } };
        }, {});

        return userIds.map((id) => data[id]);
    });
