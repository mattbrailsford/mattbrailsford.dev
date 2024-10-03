import { OGImageRoute } from '../../../lib/astro-og-canvas';
import { formatDate, getBlogPosts, getBlogSeries, getBlogTags } from "../../utils.ts";

interface Routable {
    slug: string
    title: string
    description: string
}

const posts = await getBlogPosts();
const postRoutables : Routable[] = posts.map(post => ({
    slug: post.slug,
    title: post.title,
    description: `${formatDate(post.published)} | ${post.readingTime}`
}));

const tags = await getBlogTags();
const tagRoutables : Routable[] = tags.map(tag => {
    const taggedPosts = posts.filter(post => post.tags.includes(tag)).length;
    return {
        slug: `tag-${tag}`,
        title: `Posts tagged '#${tag}'`,
        description: `${taggedPosts} ${taggedPosts === 1 ? 'post' : 'posts'}`
    }
});

const series = await getBlogSeries();
const seriesRoutables : Routable[] = series.map(series => {
    const seriesPosts = posts.filter(post => post.series?.id === series.id).length;
    return {
        slug: `series-${series.id}`,
        title: series.name,
        description: `${seriesPosts} ${seriesPosts === 1 ? 'post' : 'posts'}`
    }
});

const routables = [...postRoutables, ...tagRoutables, ...seriesRoutables];

export const { getStaticPaths, GET } = OGImageRoute({
    param: 'route',
    pages: Object.fromEntries(routables.map(routable => [ routable.slug, routable ])),
    getImageOptions: (_, page) => ({
        cacheDir: './node_modules/.astro-og-canvas-v3',
        title: page.title,
        description: page.description,
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
                size: page.title.length > 65 ? 65 : 80,
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