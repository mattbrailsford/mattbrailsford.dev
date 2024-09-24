﻿import client from '../graphql/client'
import { mapPost } from '../utils'
import SEARCH_POSTS_QUERY from '../graphql/searchPostsQuery'
import type { Post, PostList } from '../types'

const getPosts = async (limit = 50, after?: string): Promise<PostList> => {

    const { data } = await client.query(
        SEARCH_POSTS_QUERY,
        {
            query: `repo:${import.meta.env.GITHUB_REPO_OWNER}/${import.meta.env.GITHUB_REPO_NAME} category:"Blog Post" -label:state/draft`,
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
        data.search.edges.map(mapPost),
    )

    return {
        posts,
        pageInfo: data.search.pageInfo,
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
    return allPosts.sort((a, b) => b.date.getTime() - a.date.getTime());
}