import client from '../graphql/client'
import { mapPost } from '../utils'
import GET_POSTS_QUERY from '../graphql/getPostsQuery'
import type { PostList } from '../types'

export const getPosts = async (limit = 50, after?: string): Promise<PostList> => {
    
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