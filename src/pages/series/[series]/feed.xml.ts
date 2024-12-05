import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getBlogPosts, getBlogSeries, sortPostsByPublishedDateAsc } from '../../../utils';
import { SITE_TITLE } from '../../../consts';
import type { Series } from 'github-discussions-blog-loader';

export const getStaticPaths = (async () => {
    const series: Series[] = await getBlogSeries();
    return series.map(s => ({
        params: {
            series: s.id
        },
        props: {
            series: s
        }
    }))
});

export async function GET(context:APIContext) {
    const { series } = context.props;
    const rssUrl  = new URL(`/series/${series.id}/feed`, context.site);
    const posts = (await getBlogPosts((post) => post.series?.id === series.id))
        .sort(sortPostsByPublishedDateAsc);
    return await rss({
        title: `${series.name} - ${SITE_TITLE}`,
        description: `Posts from the '${series.name}' series on ${SITE_TITLE}`,
        site: `${context.site!}/series/${series.id}`,
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