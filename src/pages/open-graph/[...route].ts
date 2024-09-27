import { OGImageRoute } from '../../../lib/astro-og-canvas';
import { getCollection } from 'astro:content';
import {formatDate} from "../../utils.ts";

const posts = await getCollection('blogPosts');

export const { getStaticPaths, GET } = OGImageRoute({
    param: 'route',
    pages: Object.fromEntries(posts.map(({ id, data }) => [id, data])),
    getImageOptions: (_, page) => ({
        title: page.title,
        description: `${formatDate(page.date)} | ${page.readingTime}`,
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
                size: 80,
                weight: 'ExtraBold',
                lineHeight: 1.1,
            },
            description: {
                color: [200,200,200],
                families: ['sans-serif'],
                weight: 'Medium',
                lineHeight: 1.1,
            }
        }
    }),
    
});