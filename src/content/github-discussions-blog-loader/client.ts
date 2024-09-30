import { GITHUB_API_URL, SEARCH_POSTS_QUERY } from "./consts.ts";
import type { GitHubClientOptions, Post, PostList } from "./types.ts";
import { mapPost } from "./utils.ts";

export class GitHubClient {
    
    private readonly _options: GitHubClientOptions;
    
    constructor(options : GitHubClientOptions) 
    {
        this._options = options;
    }

    private async getPosts(limit = 50, after?: string, lastModified?: string): Promise<PostList> {

        // Build a query to search for blog post discussions
        // repo:... searches our specific repository
        // category:"Blog Post" limits the search to discussions with the category "Blog Post"
        // -label:state/draft excludes discussions with the label "state/draft"
        // sort:updated-asc sorts the results by the updated date in ascending order (must be ascending to allow tracking of last modified date)
        // updated:>${lastModified} limits the search to discussions updated after the supplied lastModified date
        const query = `repo:${this._options.repoOwner}/${this._options.repoName} category:"${this._options.blogPostCategory!}" -label:"${this._options.draftLabel!}" sort:updated-asc ${lastModified ? `updated:>${lastModified}` : ''}`
        
        const response = await fetch(GITHUB_API_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this._options.apiKey}`,
                    'User-Agent': 'Astro'
                },
                body: JSON.stringify({
                    query: SEARCH_POSTS_QUERY,
                    variables: {
                        query,
                        limit,
                        after: after || null,
                    },
                }),
            });
        
        const { data } = await response.json();

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

    private async getPostsRecursive(limit: number, after?: string, lastModified?:string): Promise<Post[]> {
        const { posts, pageInfo } = await this.getPosts(limit, after, lastModified);
        if (pageInfo.hasNextPage) {
            return posts.concat(await this.getPostsRecursive(limit, pageInfo.endCursor, lastModified))
        }
        return posts;
    }

    async getAllPosts (lastModified?:string): Promise<Post[]> {
        return await this.getPostsRecursive(100, undefined, lastModified);
    }
}



