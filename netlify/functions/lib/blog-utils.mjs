import { CONFIG } from "./config.mjs";
import { parseDateTime } from "./date-utils.mjs";

let _blogRssPromise = null;

async function getBlogRss() 
{
  if (!_blogRssPromise) {
    _blogRssPromise = fetch(`https://${CONFIG.domain}${CONFIG.rssPath}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch RSS: ${response.status}`);
        }
        return response.text();
      });
  }
  return _blogRssPromise;
}

export async function isPostPublished(discussionId)
{
  try {
    const rssText = await getBlogRss();
    const discussionIdPattern = new RegExp(`<github:discussionId>${discussionId}</github:discussionId>`, 'i');
    return discussionIdPattern.test(rssText);
  } catch (error) {
    console.error('Error checking if post is published:', error);
    return false;
  }
}

export function isValidPost(discussion) 
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