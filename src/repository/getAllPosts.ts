import type { Post } from "../types.ts";
import { getPosts } from "./getPosts.ts";

const getPostsRecursive = async (limit: number, after?: string): Promise<Post[]> => {
    const { posts, pageInfo } = await getPosts(limit, after);
    if (pageInfo.hasNextPage) {
        return posts.concat(await getPostsRecursive(limit, pageInfo.endCursor))
    }
    return posts;
}

export const getAllPosts = async (): Promise<Post[]> => {
    return (await getPostsRecursive(100)).sort((a, b) => b.date.getTime() - a.date.getTime());
}