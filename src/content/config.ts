﻿import { defineCollection } from 'astro:content';
import { githubDiscussionsBlogLoader } from "./github-discussions-blog-loader";

const blogPosts = defineCollection({
    loader: githubDiscussionsBlogLoader({
        apiKey: import.meta.env.GITHUB_API_KEY,
        repoOwner: import.meta.env.GITHUB_REPO_OWNER,
        repoName: import.meta.env.GITHUB_REPO_NAME,
        incremental: true,
    }),
});

export const collections = { blogPosts };