import { defineCollection } from 'astro:content';
import { githubDiscussionsBlogLoader } from "./github-discussions-blog-loader";

const blogPosts = defineCollection({
    loader: githubDiscussionsBlogLoader({
        accessToken: import.meta.env.GITHUB_ACCESS_TOKEN,
        repoOwner: import.meta.env.GITHUB_REPO_OWNER,
        repoName: import.meta.env.GITHUB_REPO_NAME,
        incremental: true,
    }),
});

export const collections = { blogPosts };