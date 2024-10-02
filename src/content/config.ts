import { defineCollection } from 'astro:content';
import { githubDiscussionsBlogLoader } from "./github-discussions-blog-loader";

const blogPosts = defineCollection({
    loader: githubDiscussionsBlogLoader({
        auth: import.meta.env.GITHUB_ACCESS_TOKEN,
        repo: {
            name: import.meta.env.GITHUB_REPO_NAME,
            owner: import.meta.env.GITHUB_REPO_OWNER,
        },
        incremental: false,
    }),
});

export const collections = { blogPosts };