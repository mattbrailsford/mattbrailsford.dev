import rss from '@astrojs/rss';
import {SITE_TITLE, SITE_DESCRIPTION} from '../consts';
import {getCollection} from "astro:content";
import {escapeHtml, sortPostsPublishedDateDesc} from "../utils";
import type { APIContext } from 'astro';

export async function GET(context:APIContext) {
    const posts = (await getCollection('blogPosts'))
        .map(post => post.data)
        .sort(sortPostsPublishedDateDesc);
    const response = await rss({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        site: context.site!,
        trailingSlash: false,
        items: posts.map((post) => ({
            title: escapeHtml(post.title),
            description: escapeHtml(post.description ?? ""),
            pubDate: post.published,
            link: `/${post.slug}`,
        })),
    })
    response.headers.set('Content-Type', 'application/rss+xml');
    return response;
}