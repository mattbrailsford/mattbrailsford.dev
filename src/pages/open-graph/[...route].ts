import { OGImageRoute } from '../../../lib/astro-og-canvas';
import { getCollection } from 'astro:content';
import {formatDate} from "../../utils.ts";

const posts = await getCollection('blogPosts');

export const { getStaticPaths, GET } = OGImageRoute({
    param: 'route',
    pages: Object.fromEntries(posts.map(({ id, data }) => [id, data])),
    getImageOptions: (path, page) => ({
        title: page.title,
        description: page.description ?? `${formatDate(page.date)} | ${page.readingTime}`,
        bgGradient:[[255,255,255]],
        border: {
            width: 15,
            color: [236, 72, 153],
            side: 'block-start'
        },
        fonts: ['./src/fonts/RedHatDisplay-Medium.ttf','./src/fonts/RedHatDisplay-Black.ttf'],
        font: {
            title: {
                color: [0,0,0],
                families: ['Red Hat Display', 'sans-serif'],
                size: 80,
                weight: 'Black',
                lineHeight: 1.1,
            },
            description: {
                color: [200,200,200],
                families: ['Red Hat Display', 'sans-serif'],
                weight: 'Medium',
                lineHeight: 1.1,
            }
        }
    }),
    
});