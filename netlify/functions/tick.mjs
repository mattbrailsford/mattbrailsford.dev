import { removeScheduledLabel } from "./lib/github-utils.mjs";
import { triggerDeploy } from "./lib/netlify-utils.mjs"
import { getQueuedPosts, dequeuePost } from "./lib/blog-utils.mjs"

export const config = {
  schedule: "*/1 * * * *"  // Every minute to check scheduled posts
};

export default async () => {

  const now = new Date();

  let publishCount = 0;

  const posts = await getQueuedPosts();

  for (const post of posts) 
  {    
    if (new Date(post.publishAt) <= now)
    {
      await removeScheduledLabel(post.id);
      await dequeuePost(post.id);
      console.log(`Publishing post '${post.title}' [${post.id}]`);
      publishCount++;
    }
  }

  if (publishCount > 0) await triggerDeploy();

  return new Response(`Published ${publishCount} posts`, { status: 200 });

};
