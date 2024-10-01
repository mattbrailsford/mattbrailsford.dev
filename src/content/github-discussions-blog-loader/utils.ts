﻿import { type Plugin, unified } from 'unified';
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
import { stripHtml } from "string-strip-html";
import type { GitHubMappings, Post } from "./types.ts";

export async function mapPost({ node, mappings }: { node: any, mappings: GitHubMappings }): Promise<Post> {
    
    // Extract frontmatter and content
    const { data: frontmatter, content: markdownContent } = matter(node.body);

    // Render content
    const content = await renderMarkdown(markdownContent);
    
    const seriesNode = node.labels.edges.find((x:any) => x.node.name.startsWith(mappings.seriesLabelPrefix));
    
    // Generate post model
    return {
        id: node.id,
        slug: frontmatter?.slug ?? slugify(node.title, { lower: true }),
        title: node.title,
        description: frontmatter?.description ?? truncateAfter(stripHtml(content).result, 150),
        content,
        created: new Date(node.createdAt),
        updated: new Date(node.updatedAt),
        published: new Date(frontmatter?.published ?? node.createdAt),
        readingTime: readingTime(content, 250).text,
        githubUrl: node.url,
        number: node.number,
        tags: node.labels.edges.filter((x:any) => x.node.name.startsWith(mappings.tagLabelPrefix)).map((x:any) => x.node.name.replace(mappings.tagLabelPrefix, '')),
        series: seriesNode && {
            id: seriesNode.node.name.replace(mappings.seriesLabelPrefix, ''),
            name: seriesNode.node.description
        }
    };
}

async function renderMarkdown(markdownContent: string): Promise<string> {
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

function truncateAfter(str: string, length: number, delimiter: string = '...') {
    if (str.length <= length) return str;
    const lastSpace = str.slice(0, length - delimiter.length + 1).lastIndexOf(' ');
    return str.slice(0, lastSpace > 0 ? lastSpace : length - delimiter.length) + delimiter;
}