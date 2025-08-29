import { addScheduledLabel, removeScheduledLabel, verifySignature } from "./lib/github-utils.mjs";
import { isValidPost, parsePostPublishDate, isPostPublished } from "./lib/blog-utils.mjs";
import { triggerDeploy } from "./lib/netlify-utils.mjs";

export default async (req) => 
{
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const bodyText = await req.text();
  if (!verifySignature(req, bodyText)) return new Response("Invalid signature", { status: 401 });

  const event = req.headers.get("x-github-event");
  if (event !== "discussion") return new Response("Ignored", { status: 202 });

  const payload = JSON.parse(bodyText);
  const d = payload.discussion;
  const { node_id:id, title } = d;

  const now = new Date();
  const valid = isValidPost(d);
  const isPublished = await isPostPublished(id);

  if (!valid.valid) 
  {
    if (isPublished) await triggerDeploy(); // Trigger unpublish
    return new Response(valid.reason, { status: 200 });
  }

  const { publishDate } = parsePostPublishDate(d.body, now);
  const shouldSchedule = publishDate > now;

  if (shouldSchedule) 
  {
    if (isPublished) await triggerDeploy(); // Trigger unpublish
    await addScheduledLabel(d.node_id);
    console.log(`Scheduled post '${title}' [${id}] for ${publishDate.toISOString()}`);
    return new Response("Scheduled", { status: 201 });
  }

  await removeScheduledLabel(d.node_id);
  await triggerDeploy();
  console.log(`Publishing post '${title}' [${id}]`);
  return new Response("Published", { status: 200 });
};