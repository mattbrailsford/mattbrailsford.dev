﻿// import type { Loader, LoaderContext } from 'astro/loaders';
// import { getAllPosts } from "../repository/getAllPosts.ts";
// import {z} from "astro:content";
//
// export function blogPostsLoader(): Loader {
//     return {
//         name: "blog-posts-loader",
//         load: async ({ store, logger, parseData, meta, generateDigest }): Promise<void> => {
//
//             const posts = await getAllPosts();
//            
//             store.clear();
//
//             for (const item of posts) {
//                 const data = await parseData({
//                     id: item.id,
//                     data: item,
//                 });
//                
//                 const digest = generateDigest(data);
//                
//                 store.set({
//                     id: item.id,
//                     data,
//                     digest
//                 });
//             }
//         },
//         schema: async () => z.object({
//             id: z.string(),
//             title: z.string(),
//             description: z.string(),
//             content: z.string(),
//             date: z.string(),
//             readingTime: z.string(),
//             githubUrl: z.string(),
//             number: z.number(),
//             tags: z.array(z.string()),
//             series: z.string().optional(),
//         })
//     };
// }