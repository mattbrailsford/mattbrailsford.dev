export interface GitHubDiscussionsLoaderOptions extends GitHubClientOptions {
    incremental?: boolean
}

export interface GitHubClientOptions {
    auth: string
    repo: GitHubRepository
    mappings?: GitHubMappings
}

export interface GitHubRepository {
    name: string
    owner: string
}

export interface GitHubMappings {
    blogPostCategory: string
    draftLabel: string
    tagLabelPrefix: string
    seriesLabelPrefix: string
}

export interface GitHubPost extends Record<string, unknown> {
    id: string
    title: string
    body: string
    created: Date
    updated: Date
    githubUrl: string
    number: number
    tags: string[]
    series?: GitHubPostSeries
}

export interface GitHubPostList {
    posts: GitHubPost[]
    pageInfo: GitHubPageInfo
}

export interface GitHubPageInfo {
    startCursor: string
    hasNextPage: boolean
    endCursor: string
}

export interface GitHubPostSeries {
    id: string
    name: string
}

export interface Post extends GitHubPost {
    slug: string
    description?: string
    readingTime: string
    published: Date
}

export interface PostSeries extends GitHubPostSeries { }