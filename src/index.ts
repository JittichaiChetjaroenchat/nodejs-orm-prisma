import { Prisma, PrismaClient, Post, Role, User, UserPreference } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

// const prismaClientOptions = { log: ["query"] };
const prismaClientOptions = {};
const prisma = new PrismaClient(prismaClientOptions);

async function main() {
    try {
        const userEmail = 'jittichai.chetjaroenchat@gmail.com'

        /** ==================== Reset data ==================== */
        let persistUser = await getUserAsync({ email: userEmail }, null, null, null);
        if (persistUser) {
            // Delete user's preference
            await deleteUserPreferenceAsync({ user_id: persistUser.id });
            // Delete post
            await deletePostsAsync({ author_by_id: persistUser.id });
            // Delete user
            await deleteUserAsync({ id: persistUser.id });
        }

        /** ==================== User ==================== */
        // Create user
        const user = {
            email: 'jittichai.chetjaroenchat@gmail.com',
            role: Role.PREMIUM,
            hash_password: '1234567890',
            name: 'Jittichai Chetjaroenchat',
            age: 35,
        } as User;
        const userId = await createUserAsync(user);

        // Update user
        await updateUserAsync({ id: userId }, { age: 14 });

        /** ==================== User's Preference ==================== */
        // Create user's preference
        const userPreference = {
            settings: {
                lang: 'th',
                currency: {
                    id: 1,
                    label: 'THB'
                },
            } as Prisma.JsonObject,
            user_id: userId
        } as UserPreference;
        const userPreferenceId = await createUserPreferenceAsync(userPreference);

        // Update user's preference
        const updateUserPreference = {
            settings: {
                lang: 'en',
                currency: {
                    id: 2,
                    label: 'USD'
                },
            } as Prisma.JsonObject
        } as UserPreference;
        await updateUserPreferenceAsync({ id: userPreferenceId }, updateUserPreference);

        /** ==================== Post ==================== */
        const post1 = { title: 'React for beginner', rating: 4.5, author_by_id: userId } as Post
        const post2 = { title: 'Vue for beginner', rating: 3.75, author_by_id: userId } as Post
        const post3 = { title: 'Angular for beginner', rating: 3.5, author_by_id: userId } as Post
        const post4 = { title: 'React for professional', rating: 4.5, author_by_id: userId } as Post
        const post5 = { title: 'Vue for professional', rating: 4, author_by_id: userId } as Post
        const post6 = { title: 'Angular for professional', rating: 4.25, author_by_id: userId } as Post
        const posts = [post1, post2, post3, post4, post5, post6];
        await createPostsAsync(posts);

        /** ==================== Query all tables ==================== */
        // Query user
        const queryUserWhere = { id: userId };
        const queryUserOrderBy = null;
        const queryUserPaging = null;
        const queryUserInclude = {
            user_preference: true,
            written_posts: true,
        };
        persistUser = await getUserAsync(queryUserWhere, queryUserOrderBy, queryUserPaging, queryUserInclude);
        console.log('Persist user: ', persistUser);

        // Query user's preference
        const queryUserPreferenceWhere = { settings: {
            path: ['lang'],
            equals: 'en'
            // path: ['currency', 'label'],
            // equals: 'USD'
        }};
        const queryUserPreferenceOrderBy = null;
        const queryUserPreferencePaging = null;
        const queryUserPreferenceInclude = null;
        const persistUserPreference = await getUserPreferenceAsync(queryUserPreferenceWhere, queryUserPreferenceOrderBy, queryUserPreferencePaging, queryUserPreferenceInclude);
        console.log('Persist user\'s preference: ', persistUserPreference);

        // Query post
        const queryPostsWhere = { author_by_id: userId };
        const queryPostsOrder = null;
        const queryPostsPaging = null;
        const queryPostsInclude = null;
        // const queryPostsInclude = {};
        // const queryPostsWhere = {
        //     // title: { contains: 'professional' },
        //     // rating: { gte: 4 }
        //     AND: [{ title: { contains: 'professional' } }, { rating: { gte: 4.25 } }]
        // };
        // const queryPostsOrder = { rating: "desc" };
        // const queryPostsPaging = { skip: 1, take: 1 };
        // const queryPostsInclude = { authorBy: true };
        const persistPosts = await getPostsAsync(queryPostsWhere, queryPostsOrder, queryPostsPaging, queryPostsInclude);
        console.log('Persist posts: ', persistPosts);
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Database exception with error code ${error.code}.`);
        }

        throw error;
    }
}

/** ==================== User ==================== */
async function getUserAsync(where: any, orderBy: any, paging: any, include: any): Promise<User | null> {
    try {
        return await prisma.user.findFirst({ 
            where: where ? { ...where } : undefined,
            orderBy: orderBy ? { ...orderBy } : undefined,
            ...paging,
            include : include ? { ...include } : undefined,
        });
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Query user failed with error code ${error.code}.`);
        }

        throw error;
    }
}

async function createUserAsync(user: User): Promise<string> {
    try {
        const { id } = await prisma.user.create({ data: user });

        return id;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Create user failed with error code ${error.code}.`);
        }

        throw error;
    }
}

async function updateUserAsync(condition: any, updater: any): Promise<boolean> {
    try {
        await prisma.user.update({
            where: { ...condition },
            data: { ...updater }
        });

        return true;
    }
    catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Update user failed with error code ${error.code}.`);
        }
    }

    return false;
}

async function deleteUserAsync(condition: any): Promise<boolean> {
    try {
        await prisma.user.delete({ where: condition });

        return true;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Delete user failed with error code ${error.code}.`);
        }

        return false;
    }
}

/** ==================== User's Preference ==================== */
async function getUserPreferenceAsync(where: any, orderBy: any, paging: any, include: any): Promise<UserPreference | null> {
    try {
        return await prisma.userPreference.findFirst({ 
            where: where ? { ...where } : undefined,
            orderBy: orderBy ? { ...orderBy } : undefined,
            ...paging,
            include : include ? { ...include } : undefined,
        });
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Query user\'s preference failed with error code ${error.code}.`);
        }

        throw error;
    }
}

async function createUserPreferenceAsync(userPreference: any): Promise<string> {
    try {
        const { id } = await prisma.userPreference.create({ data: userPreference});

        return id;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Create user\'s preference failed with error code ${error.code}.`);
        }

        throw error;
    }
}

async function updateUserPreferenceAsync(condition: any, updater: any): Promise<boolean> {
    try {
        await prisma.userPreference.update({
            where: { ...condition },
            data: { ...updater }
        });

        return true;
    }
    catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Update user\'s preference failed with error code ${error.code}.`);
        }
    }

    return false;
}

async function deleteUserPreferenceAsync(condition: any): Promise<boolean> {
    try {
        await prisma.userPreference.delete({ where: condition });

        return true;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Delete user\'s preference failed with error code ${error.code}.`);
        }

        return false;
    }
}

/** ==================== Post ==================== */
async function getPostsAsync(where: any, orderBy: any, paging: any, include: any): Promise<Post[]> {
    try {
        return await prisma.post.findMany({ 
            where: where ? { ...where } : undefined,
            orderBy: orderBy ? { ...orderBy } : undefined,
            ...paging,
            include : include ? { ...include } : undefined,
        });
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Query posts failed with error code ${error.code}.`);
        }

        throw error;
    }
}

async function createPostAsync(post: Post): Promise<string> {
    try {
        const { id } = await prisma.post.create({ data: post});

        return id;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Create post failed with error code ${error.code}.`);
        }

        throw error;
    }
}

async function createPostsAsync(posts: Post[]): Promise<boolean> {
    try {
        await prisma.post.createMany({ data: posts, skipDuplicates: true });

        return true;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Create posts failed with error code ${error.code}.`);
        }

        throw error;
    }
}

async function deletePostsAsync(condition: any): Promise<boolean> {
    try {
        await prisma.post.deleteMany({ where: condition });

        return true;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Delete posts failed with error code ${error.code}.`);
        }

        return false;
    }
}

main()
    .catch((e) => {
        console.error(e.message);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
