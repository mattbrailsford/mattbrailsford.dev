import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getBlogPosts, getBlogTags, sortPostsByPublishedDateDesc } from '../../../utils';
import { SITE_TITLE } from '../../../consts';

export  const getStaticPaths = (async () => {
    const tags: string[] = await getBlogTags();
    return tags.map(tag => ({
        params: {
            tag
        }
    }))
});

export async function GET(context:APIContext) {
    const { tag } = context.params;
    const rssUrl  = new URL(`/tag/${tag}/feed`, context.site);
    const posts = (await getBlogPosts((post) => post.tags.includes(tag!)))
        .sort(sortPostsByPublishedDateDesc)
    return await rss({
        title: `#${tag} - ${SITE_TITLE}`,
        description: `Articles tagged #${tag} from ${SITE_TITLE}`,
        site: `${context.site!}/tag/${tag}`,
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