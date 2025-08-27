import { CONFIG } from "./config.mjs";
import { parseDateTime } from "./date-utils.mjs";
import { getStore } from "@netlify/blobs";

export function isValidBlogPost(discussion) 
{
  if (discussion.category?.name !== CONFIG.blogCategory) {
    return { valid: false, reason: `Not a ${CONFIG.blogCategory} post` };
  }
  const postLabels = (discussion.labels || []).map(l => l.name);
  const hasIgnore = CONFIG.ignoreLabels.some(il => postLabels.includes(il));
  if (hasIgnore) {
    const matched = CONFIG.ignoreLabels.filter(il => postLabels.includes(il));
    return { valid: false, reason: `Has ignore label(s): ${matched.join(", ")}` };
  }
  return { valid: true };
}

export function parsePostPublishDate(body, now) 
{
  const fm = body?.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(\r?\n|$)/);
  if (!fm) return { publishDate: now, hasExplicitDate: false };
  const m = fm[1].match(/published:\s*(.+)/);
  if (!m) return { publishDate: now, hasExplicitDate: false };
  const publishedStr = m[1].trim().replace(/^['"]|['"]$/g, "");
  const parsed = parseDateTime(publishedStr);
  return parsed 
    ? { publishDate: parsed, hasExplicitDate: true }
    : { publishDate: now, hasExplicitDate: false };
}

export async function enqueuePost({ id, publishAt }) 
{
  const store = getStore("blog-scheduler");
  const key = `post/${id}`;
  await store.setJSON(key, { id, publishAt });
}

export async function dequeuePost(id) 
{
  const store = getStore("blog-scheduler");
  const key = `post/${id}`;
  await store.delete(key);
}

export async function getQueuedPosts() 
{
  const store = getStore("blog-scheduler");
  const { blobs } = await store.list({ prefix: "post/" });
  const posts = [];
  for (const { key } of blobs) 
  {
    const post = await store.getJSON(key);
    if (post) posts.push(post);
  }
  return posts;
}