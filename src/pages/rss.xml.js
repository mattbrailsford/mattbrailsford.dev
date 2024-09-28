import rss from '@astrojs/rss';
import {SITE_TITLE, SITE_DESCRIPTION} from '../consts';
import {getCollection} from "astro:content";
import {sortPostsPublishedDateDesc} from "../utils";

function escapeHtml(unsafe)
{
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function GET(context) {
    const posts = (await getCollection('blogPosts'))
        .map(post => post.data)
        .sort(sortPostsPublishedDateDesc);
    return rss({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        site: context.site,
        trailingSlash: false,
        items: posts.map((post) => ({
            title: escapeHtml(post.title),
            description: escapeHtml(post.description ?? ""),
            pubDate: post.published,
            link: `/${post.slug}`,
        })),
    })
}