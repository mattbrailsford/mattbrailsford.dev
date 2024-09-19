export interface Post extends Record<string, unknown> {
    id: string
    slug: string
    title: string
    description: string
    content: string
    date: Date
    readingTime: string
    githubUrl: string
    number: number
    tags: string[]
    series?: string
    isDraft: boolean
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