import { CONFIG } from "./config.mjs";
import { parseDateTime } from "./date-utils.mjs";

let _blogRssCache;
const getBlogRss = async () => _blogRssCache ??= fetch(`https://${CONFIG.domain}${CONFIG.rssPath}`).then(r => r.text());

export const isPostPublished = async (discussionId) => 
  (await getBlogRss()).includes(`<github:discussionId>${discussionId}</github:discussionId>`);

export const isValidPost = (discussion) => 
{
  if (discussion.category?.name !== CONFIG.blogCategory)
    return { valid: false, reason: `Not a ${CONFIG.blogCategory} post` };

  const postLabels = discussion.labels?.map(l => l.name) || [];
  const ignored = CONFIG.ignoreLabels.filter(il => postLabels.includes(il));

  return ignored.length
    ? { valid: false, reason: `Has ignore label(s): ${ignored.join(", ")}` }
    : { valid: true };
};

export const parsePostPublishDate = (body, fallback) => 
{
  const match = body?.match(/^---\s*\r?\n([\s\S]*?)\r?\n---.*?published:\s*(.+)/m);
  if (!match) return { publishDate: fallback, hasExplicitDate: false };

  const publishedStr = match[2].trim().replace(/^['"]|['"]$/g, "");
  const parsed = parseDateTime(publishedStr);
  return parsed
    ? { publishDate: parsed, hasExplicitDate: true }
    : { publishDate: fallback, hasExplicitDate: false };
};