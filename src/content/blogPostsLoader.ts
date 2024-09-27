import type { Loader } from 'astro/loaders';
import { getAllPosts } from "../repository/getAllPosts.ts";
import { z } from "astro:content";

export function blogPostsLoader(): Loader {
    return {
        name: "blog-posts-loader",
        load: async ({ store, parseData, generateDigest, meta }): Promise<void> => {

            const lastModified = meta.get('last-modified');
            
            const posts = await getAllPosts(lastModified);
            
            let maxDate = lastModified ? Date.parse(lastModified) : new Date(0);
                        
            // store.clear();
            // Question: How to handle deleted posts?
            
            for (const item of posts) {
                
                const data = await parseData({
                    id: item.slug,
                    data: item,
                });
                
                const digest = generateDigest(data);
                
                store.set({
                    id: item.slug,
                    data,
                    rendered: {
                        html: item.content,
                    },
                    digest
                });
                
                if (item.date > maxDate) {
                    maxDate = item.date;
                }
            }
            
            meta.set('last-modified', new Date(maxDate).toLocaleString());
        },
        schema: () => z.object({
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
            series: z.object({
                id: z.string(),
                name: z.string(),
            }).optional(),
        })
    };
}