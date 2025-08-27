import { defineCollection } from 'astro:content';
import { DEFAULT_MAPPINGS, githubDiscussionsBlogLoader } from 'github-discussions-blog-loader';

const blogPosts = defineCollection({
    loader: githubDiscussionsBlogLoader({
        auth: import.meta.env.GITHUB_ACCESS_TOKEN,
        repo: {
            name: import.meta.env.GITHUB_REPO_NAME,
            owner: import.meta.env.GITHUB_REPO_OWNER,
        },
        incremental: false,
        mappings: {
            ...DEFAULT_MAPPINGS,
            ignoreLabels: ["state/draft", "state/scheduled"],
        }
    }),
});

export const collections = { blogPosts };
