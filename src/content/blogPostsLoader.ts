import type { Loader } from 'astro/loaders';
import { getAllPosts } from "../repository/getAllPosts.ts";
import { z } from "astro:content";

export function blogPostsLoader(): Loader {
    return {
        name: "blog-posts-loader",
        load: async ({ store, logger, parseData, meta, generateDigest }): Promise<void> => {
            const posts = await getAllPosts();
            store.clear();
            for (const item of posts) {
                const data = await parseData({
                    id: item.slug,
                    data: item,
                });
                const digest = generateDigest(data);
                store.set({
                    id: item.slug,
                    data,
                    digest
                });
            }
        },
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
    };
}