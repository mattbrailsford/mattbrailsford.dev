import type { Loader } from 'astro/loaders';
import { getAllPosts } from "../repository/getAllPosts.ts";
import { z } from "astro:content";

export function blogPostsLoader(): Loader {
    return {
        name: "blog-posts-loader",
        load: async ({ store, parseData, generateDigest, meta, logger }): Promise<void> => {

            let lastModified = undefined; //meta.get('last-modified');
            if (lastModified == 'Invalid Date') {
                lastModified = undefined;
            }

            logger.info(`Last Modified: ${lastModified}`);
            
            const posts = await getAllPosts(lastModified);

            logger.info(`Processing Posts: ${posts.length}`);
            
            let maxDate: Date = new Date(lastModified ?? 0);
            
            for (const item of posts) {

                // Question: How to handle deleted posts?
                
                const data = await parseData({
                    id: item.id,
                    data: item,
                });
                
                const digest = generateDigest(data);
                
                store.set({
                    id: item.id,
                    data,
                    rendered: {
                        html: item.content,
                    },
                    digest
                });
                
                if (item.updated > maxDate) {
                    maxDate = item.updated;
                }
            }
            
            meta.set('last-modified', maxDate.toISOString().split('T')[0]);

            logger.info(`New Last Modified: ${meta.get('last-modified')}`);
        },
        schema: () => z.object({
            id: z.string(),
            slug: z.string(),
            title: z.string(),
            description: z.string().optional(),
            content: z.string(),
            created: z.date(),
            updated: z.date(),
            published: z.date(),
            readingTime: z.string(),
            githubUrl: z.string(),
            number: z.number(),
            tags: z.array(z.string()),
            series: z.object({
                id: z.string(),
                name: z.string(),
            }).optional(),
        })
    };
}