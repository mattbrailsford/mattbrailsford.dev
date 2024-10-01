import { SEARCH_POSTS_QUERY } from "./graphql.ts";
import type { GitHubClientOptions, GitHubPostList, GitHubPost } from "./types.ts";
import { mapPosts } from "./mappers.ts";

const GITHUB_API_URL : string = 'https://api.github.com/graphql'

export class GitHubClient {
    
    private readonly _options: GitHubClientOptions;
    
    constructor(options : GitHubClientOptions) 
    {
        this._options = options;
    }

    private async getPosts(limit = 50, after?: string, lastModified?: string): Promise<GitHubPostList> {

        // Build a query to search for blog post discussions
        // repo:... searches our specific repository
        // category:... limits the search to discussions with the blog post category
        // -label:... excludes discussions with the draft label
        // sort:updated-asc sorts the results by the updated date in ascending order (must be ascending to allow tracking of last modified date)
        // updated:>${lastModified} limits the search to discussions updated after the supplied lastModified date
        const query = `repo:${this._options.repo.owner}/${this._options.repo.name} sort:updated-asc ${this._options.mappings!.blogPostCategory ? `category:"${this._options.mappings!.blogPostCategory}"` : ''} ${this._options.mappings!.draftLabel ? `-label:"${this._options.mappings!.draftLabel}"` : ''} ${lastModified ? `updated:>${lastModified}` : ''}`
        
        const response = await fetch(GITHUB_API_URL,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this._options.auth}`,
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

        return {
            posts: mapPosts({ data: data ?? [], mappings: this._options.mappings! }),
            pageInfo: data?.search.pageInfo ?? {
                startCursor: '',
                endCursor: '',
                hasNextPage: false,
            }
        }

    }

    private async getPostsRecursive(limit: number, after?: string, lastModified?:string): Promise<GitHubPost[]> {
        const { posts, pageInfo } = await this.getPosts(limit, after, lastModified);
        if (pageInfo.hasNextPage) {
            return posts.concat(await this.getPostsRecursive(limit, pageInfo.endCursor, lastModified))
        }
        return posts;
    }

    async getAllPosts (lastModified?:string): Promise<GitHubPost[]> {
        return await this.getPostsRecursive(100, undefined, lastModified);
    }
}



