import { defineCollection, z } from 'astro:content';
import { blogPostsLoader } from "./blogPostsLoader.ts";

const blogPosts = defineCollection({
    loader: blogPostsLoader()
});

export const collections = { blogPosts };