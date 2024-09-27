﻿import {type Plugin, unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { default as remarkEmbedderDefault , type RemarkEmbedderOptions} from '@remark-embedder/core';
import oembedTransformer from '@remark-embedder/transformer-oembed'
import matter from 'gray-matter';
import { readingTime } from 'reading-time-estimator';
import slugify from 'slugify';
import type { Post } from './types';
import type {CollectionEntry} from "astro:content";

export async function mapPost({ node }: { node: any }): Promise<Post> {
    
    // Extract frontmatter and content
    const { data: frontmatter, content: markdownContent } = matter(node.body);

    // Render content
    const content = await renderMarkdown(markdownContent);
    
    const seriesNode = node.labels.edges.find((x:any) => x.node.name.startsWith('series/'));
    
    // Generate post model
    return {
        id: node.id,
        slug: frontmatter.slug ?? slugify(node.title, { lower: true }),
        title: node.title,
        description: frontmatter && frontmatter.description,
        content,
        date: new Date(frontmatter.published ?? node.createdAt),
        readingTime: readingTime(content, 250).text,
        githubUrl: node.url,
        number: node.number,
        tags: node.labels.edges.filter((x:any) => x.node.name.startsWith('tag/')).map((x:any) => x.node.name.replace('tag/', '')),
        series: seriesNode && {
            id: seriesNode.node.name.replace('series/', ''),
            name: seriesNode.node.description
        }
    };
}

export async function renderMarkdown(markdownContent: string): Promise<string> {
    const remarkEmbedder = (remarkEmbedderDefault as unknown as { default: Plugin<[RemarkEmbedderOptions]> }).default;
    return (await unified()
        .use(remarkParse)
        .use(remarkRehype, {
            allowDangerousHtml: true,
        })
        .use(rehypeRaw)
        .use(rehypeStringify)
        .use(rehypeHighlight)
        .use(remarkGfm)
        .use(remarkEmbedder, { transformers: [oembedTransformer] })
        .process(markdownContent)).toString();
}

export function formatDate(date: Date) {
    return date.toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export function sortPostsDateDesc(a: CollectionEntry<Post>, b: CollectionEntry<Post>) {
    return b.data.date.getTime() - a.data.date.getTime();
}

export function sortPostsDateAsc(a: CollectionEntry<Post>, b: CollectionEntry<Post>) {
    return a.data.date.getTime() - b.data.date.getTime();
}