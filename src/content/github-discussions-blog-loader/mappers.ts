import type { GitHubMappings, GitHubPost, GitHubPostSeries } from "./types.ts";

export function mapPosts({ data, mappings }: { data: any, mappings: GitHubMappings }): GitHubPost[] {
    return data.search.edges.map((edge: any) => mapPost({ node: edge.node, mappings }));
}

export function mapPost({ node, mappings }: { node: any, mappings: GitHubMappings }): GitHubPost {
    return {
        id: node.id,
        title: node.title,
        body: node.body,
        created: new Date(node.createdAt),
        updated: new Date(node.updatedAt),
        githubUrl: node.url,
        number: node.number,
        tags: mapTags({ labels: node.labels, mappings }),
        series: mapSeries({ labels: node.labels, mappings }),
    };
}

export function mapTags({ labels, mappings }: { labels: any, mappings: GitHubMappings }): string[] {
    return labels.edges.filter((x:any) => x.node.name.startsWith(mappings.tagLabelPrefix)).map((x:any) => x.node.name.replace(mappings.tagLabelPrefix, ''));
}

export function mapSeries({ labels, mappings }: { labels: any, mappings: GitHubMappings }): GitHubPostSeries {
    const seriesNode = labels.edges.find((x:any) => x.node.name.startsWith(mappings.seriesLabelPrefix));
    return seriesNode && {
        id: seriesNode.node.name.replace(mappings.seriesLabelPrefix, ''),
        name: seriesNode.node.description
    }
}