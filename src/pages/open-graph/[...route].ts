import { OGImageRoute } from '../../../lib/astro-og-canvas';
import { getCollection } from 'astro:content';
import {formatDate} from "../../utils.ts";

const posts = await getCollection('blogPosts');

export const { getStaticPaths, GET } = OGImageRoute({
    param: 'route',
    pages: Object.fromEntries(posts.map(({ data }) => [ data.slug, data ])),
    getImageOptions: (_, page) => ({
        cacheDir: './node_modules/.astro-og-canvas-v2',
        title: page.title,
        description: `${formatDate(page.published)} | ${page.readingTime}`,
        bgGradient:[[255,255,255]],
        logo: {
            path: './public/logo-128.png',
            size: [ 120, 120 ]
        },
        fonts: ['./src/fonts/RobotoSlab-ExtraBold.ttf'],
        font: {
            title: {
                color: [0,0,0],
                families: ['Roboto Slab', 'serif'],
                size: 65,
                weight: 'ExtraBold',
                lineHeight: 1.1,
            },
            description: {
                color: [200,200,200],
                families: ['sans-serif'],
                size: 30,
                weight: 'Medium',
                lineHeight: 1.1,
            }
        }
    }),
    
});