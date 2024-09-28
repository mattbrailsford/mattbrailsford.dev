import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import {getCollection} from "astro:content";

export async function GET(context) {
    const posts = await getCollection('blogPosts');
    return rss({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        site: context.site,
        trailingSlash: false,
        items: posts.map((post) => ({
            title: post.data.title,
            description: post.data.description,
            pubDate: post.data.published,
            link: `/${post.data.slug}`,
        })),
    })
}