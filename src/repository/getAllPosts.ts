import client from '../graphql/client'
import { mapPost } from '../utils'
import GET_POSTS_QUERY from '../graphql/getPostsQuery'
import type { Post, PostList } from '../types'

const getPosts = async (limit = 50, after?: string): Promise<PostList> => {

    const { data, error } = await client.query(
        GET_POSTS_QUERY,
        {
            owner: import.meta.env.GITHUB_REPO_OWNER,
            repo: import.meta.env.GITHUB_REPO_NAME,
            limit,
            after: after || null,
        },
    ).toPromise()

    if (!data) {
        return {
            posts: [],
            pageInfo: {
                startCursor: '',
                endCursor: '',
                hasNextPage: false,
            }
        }
    }

    const posts =  await Promise.all(
        data.repository.discussions.edges.map(mapPost),
    )

    return {
        posts,
        pageInfo: data.repository.discussions.pageInfo,
    }

}

const getPostsRecursive = async (limit: number, after?: string): Promise<Post[]> => {
    const { posts, pageInfo } = await getPosts(limit, after);
    if (pageInfo.hasNextPage) {
        return posts.concat(await getPostsRecursive(limit, pageInfo.endCursor))
    }
    return posts;
}

export const getAllPosts = async (): Promise<Post[]> => {
    const allPosts = await getPostsRecursive(100);
    return allPosts
        .filter(post => !post.isDraft)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
}