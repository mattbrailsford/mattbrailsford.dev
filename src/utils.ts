﻿import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import matter from 'gray-matter';
import { readingTime } from 'reading-time-estimator';
import slugify from 'slugify';
import type { Post } from './types';

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
    return (await unified()
        .use(remarkParse)
        .use(remarkRehype, {
            allowDangerousHtml: true,
        })
        .use(rehypeRaw)
        .use(rehypeStringify)
        .use(rehypeHighlight)
        .process(markdownContent)).toString();
}

export function formatDate(date: Date) {
    return date.toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}