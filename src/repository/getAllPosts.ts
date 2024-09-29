import client from '../graphql/client'
import { mapPost } from '../utils'
import SEARCH_POSTS_QUERY from '../graphql/searchPostsQuery'
import type { Post, PostList } from '../types'

const getPosts = async (limit = 50, after?: string, lastModified?: string): Promise<PostList> => {

    // Build a query to search for blog post discussions
    // repo:... searches our specific repository
    // category:"Blog Post" limits the search to discussions with the category "Blog Post"
    // -label:state/draft excludes discussions with the label "state/draft"
    // sort:updated-asc sorts the results by the updated date in ascending order (must be ascending to allow tracking of last modified date)
    // updated:>${lastModified} limits the search to discussions updated after the supplied lastModified date
    const query = `repo:${import.meta.env.GITHUB_REPO_OWNER}/${import.meta.env.GITHUB_REPO_NAME} category:"Blog Post" -label:state/draft sort:updated-asc ${lastModified ? `updated:>${lastModified}` : ''}`
    
    const { data } = await client.query(
        SEARCH_POSTS_QUERY,
        {
            query,
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

const getPostsRecursive = async (limit: number, after?: string, lastModified?:string): Promise<Post[]> => {
    const { posts, pageInfo } = await getPosts(limit, after, lastModified);
    if (pageInfo.hasNextPage) {
        return posts.concat(await getPostsRecursive(limit, pageInfo.endCursor, lastModified))
    }
    return posts;
}

export const getAllPosts = async (lastModified?:string): Promise<Post[]> => {
    return await getPostsRecursive(100, undefined, lastModified);
}