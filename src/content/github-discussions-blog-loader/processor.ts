import type { AstroConfig, MarkdownHeading } from "astro";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import type { GitHubPost, Post } from "./types.ts";
import matter from "gray-matter";
import slugify from "slugify";
import { readingTime } from "reading-time-estimator";
import { stripHtml } from "string-strip-html";

export async function postProcessor(config: AstroConfig) {
    const markdownProcessor = await createMarkdownProcessor(config.markdown);
    return {
        process: async (input: GitHubPost) : Promise<{ 
            post: Post,
            metadata:{
                headings: MarkdownHeading[];
                imagePaths: string[];
                frontmatter: Record<string, any>;
            } 
        }> => {
            const { data: frontmatter, content: markdownContent } = matter(input.body);
            const rendered = await markdownProcessor.render(markdownContent, { frontmatter });
            return {
                post: {
                    ...input,
                    slug: frontmatter?.slug ?? slugify(input.title, { lower: true }),
                    description: frontmatter?.description ?? truncateAfter(stripHtml(rendered.code).result, 150),
                    body: rendered.code,
                    published: new Date(frontmatter?.published ?? input.createdAt),
                    readingTime: readingTime(rendered.code, 250).text,
                },
                metadata: rendered.metadata
            };
        }
    }
}

function truncateAfter(str: string, length: number, delimiter: string = '...') {
    if (str.length <= length) return str;
    const lastSpace = str.slice(0, length - delimiter.length + 1).lastIndexOf(' ');
    return str.slice(0, lastSpace > 0 ? lastSpace : length - delimiter.length) + delimiter;
}