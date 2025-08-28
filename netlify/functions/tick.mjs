import { removeScheduledLabel, getScheduledDiscussions } from "./lib/github-utils.mjs";
import { triggerDeploy } from "./lib/netlify-utils.mjs";
import { parsePostPublishDate } from "./lib/blog-utils.mjs";

export const config = { schedule: "*/1 * * * *" };

export default async () => 
{
  const now = new Date();
  const posts = await getScheduledDiscussions();

  const publishedPosts = await Promise.all(
    posts.map(async post => {
      const { publishDate } = parsePostPublishDate(post.body, now);
      if (publishDate <= now) {
        await removeScheduledLabel(post.id);
        console.log(`Publishing post '${post.title}' [${post.id}]`);
        return post;
      }
    })
  );

  const publishCount = publishedPosts.filter(Boolean).length;
  if (publishCount > 0) await triggerDeploy();

  return new Response(`Published ${publishCount} posts`, { status: 200 });
};
