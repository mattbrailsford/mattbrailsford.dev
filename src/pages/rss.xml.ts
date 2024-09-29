import rss from '@astrojs/rss';
import {SITE_TITLE, SITE_DESCRIPTION} from '../consts';
import {getBlogPosts, sortPostsPublishedDateDesc} from "../utils";
import type { APIContext } from 'astro';

export async function GET(context:APIContext) {
    const rssUrl  = new URL('/rss', context.site);
    const posts = (await getBlogPosts())
        .sort(sortPostsPublishedDateDesc);
    return await rss({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        site: context.site!,
        trailingSlash: false,
        items: posts.map((post) => ({
            title: post.title,
            description: post.description ?? "",
            pubDate: post.published,
            link: `/${post.slug}`,
        })),
        xmlns: {
            atom: 'http://www.w3.org/2005/Atom',
        },
        customData: `<atom:link href="${rssUrl}" rel="self" type="application/rss+xml" />`
    })
}