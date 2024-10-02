import type { GitHubMappings, GitHubPost, GitHubPostSeries } from "./types.ts";

export function gitHubMapper(mappings: GitHubMappings) {
    
    const mapPosts = (data: any): GitHubPost[] => {
        return data.search.edges.map((edge: any) => mapPost({ node: edge.node, mappings }));
    }

    const mapPost = (node: any): GitHubPost => {
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

    const mapTags = (labels: any): string[] => {
        return labels.edges.filter((x:any) => x.node.name.startsWith(mappings.tagLabelPrefix)).map((x:any) => x.node.name.replace(mappings.tagLabelPrefix, ''));
    }

    const mapSeries = (labels: any): GitHubPostSeries => {
        const seriesNode = labels.edges.find((x:any) => x.node.name.startsWith(mappings.seriesLabelPrefix));
        return seriesNode && {
            id: seriesNode.node.name.replace(mappings.seriesLabelPrefix, ''),
            name: seriesNode.node.description
        }
    }
    
    return { mapPosts, mapPost, mapTags, mapSeries };
}

