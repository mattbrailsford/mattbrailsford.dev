export interface GitHubClientOptions {
    accessToken:string
    repoOwner:string
    repoName:string
    blogPostCategory?:string
    draftLabel?:string
    tagLabelPrefix?:string
    seriesLabelPrefix?:string
}

export interface Post extends Record<string, unknown> {
    id: string
    slug: string
    title: string
    description?: string
    content: string
    created: Date
    updated: Date
    published: Date
    readingTime: string
    githubUrl: string
    number: number
    tags: string[]
    series?: PostSeries
}

export interface PostList {
    posts: Post[]
    pageInfo: PageInfo
}

export interface PageInfo {
    startCursor: string
    hasNextPage: boolean
    endCursor: string
}

export interface PostSeries {
    id: string
    name: string
}