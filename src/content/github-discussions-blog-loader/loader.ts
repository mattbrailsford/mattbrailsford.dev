import type { Loader } from 'astro/loaders';
import { z } from "astro:content";
import { GitHubClient } from "./client.ts";
import type { GitHubDiscussionsLoaderOptions } from "./types.ts";

export function githubDiscussionsBlogLoader({
    accessToken, 
    repoOwner, 
    repoName, 
    incremental = false,
    mappings = {
        blogPostCategory: "Blog Post",
        draftLabel: "state/draft",
        tagLabelPrefix: "tag/",
        seriesLabelPrefix: "series/"
    }
} : GitHubDiscussionsLoaderOptions): Loader {
    return {
        name: "github-discussions-blog-loader",
        load: async ({ store, parseData, generateDigest, meta, logger }): Promise<void> => {

            let lastModified = meta.get('last-modified');
            if (incremental) {
                logger.info(`Last Modified: ${lastModified}`);
            }
            
            const client = new GitHubClient({
                accessToken, 
                repoOwner, 
                repoName,
                mappings
            });
            const posts = await client.getAllPosts(incremental ? lastModified : undefined);
            logger.info(`Processing ${posts.length} blog posts`);
            
            let maxUpdatedDate: Date = new Date(lastModified ?? 0);
            
            if (!incremental) {
                store.clear();
            }
            
            for (const item of posts) {
                
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
                
                if (item.updated > maxUpdatedDate) 
                {
                    maxUpdatedDate = item.updated;
                }
            }

            if (incremental)  {
                meta.set('last-modified', maxUpdatedDate.toISOString());
                logger.info(`New Last Modified: ${meta.get('last-modified')}`);
            }
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