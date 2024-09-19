import { defineCollection, z } from 'astro:content';
import { getAllPosts } from '../repository/getAllPosts';

const blogPosts = defineCollection({
    loader: getAllPosts,
    schema: z.object({
        id: z.string(),
        slug: z.string(),
        title: z.string(),
        description: z.string().optional(),
        content: z.string(),
        date: z.date(),
        readingTime: z.string(),
        githubUrl: z.string(),
        number: z.number(),
        tags: z.array(z.string()),
        series: z.string().optional(),
    })
});

export const collections = { blogPosts };