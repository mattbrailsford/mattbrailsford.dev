import { unified } from 'unified';
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
    const { data: frontmatter, content: markdownContent } = matter(node.body);

    // Render content
    const content = (await unified()
        .use(remarkParse)
        .use(remarkRehype, {
            allowDangerousHtml: true,
        })
        .use(rehypeRaw)
        .use(rehypeStringify, )
        .use(rehypeHighlight, {
            ignoreMissing: true,
            languages: { },
        })
        .process(markdownContent)).toString();

    // Extract date
    const date = new Date(frontmatter.published ?? node.createdAt);
    
    // Generate post model
    return {
        id: node.id,
        slug: frontmatter.slug ?? slugify(node.title, { lower: true }),
        title: node.title,
        description: frontmatter && frontmatter.description,
        content,
        date,
        readingTime: readingTime(content, 250).text,
        githubUrl: node.url,
        number: node.number,
        tags: node.labels.edges.filter((x:any) => x.node.name.startsWith('tag/')).map((x:any) => x.node.name.replace('tag/', '')),
        series: node.labels.edges.find((x:any) => x.node.name.startsWith('series/'))?.node.name.replace('series/', ''),
    };
}

export function formatDate(date: Date) {
    return date.toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}