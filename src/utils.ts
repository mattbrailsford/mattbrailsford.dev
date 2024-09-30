import { getCollection } from "astro:content";
import type { Post, PostSeries } from './types.ts';

export async function getBlogPosts(filter: (post: Post) => Boolean = () => true): Promise<Post[]> {
    return (await getCollection('blogPosts', (entry) => filter(entry.data))).map(x => x.data);
}

export async function getBlogTags(): Promise<string[]> {
    return distinct((await getBlogPosts()).flatMap(post => post.tags));
}

export async function getBlogSeries(): Promise<PostSeries[]> {
    return distinctBy((await getBlogPosts()).flatMap(x => x.series ?? []), series => series.id);
}

export function sortPostsByPublishedDateDesc(a: Post, b: Post) {
    return b.published.getTime() - a.published.getTime();
}

export function sortPostsByPublishedDateAsc(a: Post, b: Post) {
    return a.published.getTime() - b.published.getTime();
}

export function distinct<T>(value: T[]) {
    return [...new Set(value)];
}

export function distinctBy<T>(value: T[], key: (item: T) => any) {
    return [...new Map(value.map(item => [key(item), item])).values()];
}

export function formatDate(date: Date) {
    return date.toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}