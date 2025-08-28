import { addScheduledLabel, removeScheduledLabel, verifySignature } from "./lib/github-utils.mjs";
import { isValidPost, parsePostPublishDate, isPostPublished } from "./lib/blog-utils.mjs";
import { triggerDeploy } from "./lib/netlify-utils.mjs";

export default async (req) => {
  try {

    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const bodyText = await req.text();
    if (!verifySignature(req, bodyText)) return new Response("Invalid signature", { status: 401 });
    const payload = JSON.parse(bodyText);

    const event = req.headers.get("x-github-event");
    if (event !== "discussion") return new Response("Ignored", { status: 202 });

    const d = payload.discussion;
    const id = d.node_id;
    const title = d.title;
    const now = new Date();

    const valid = isValidPost(d);
    if (!valid.valid) {
      // If the post is invalid, but it's published, trigger a deploy to cause it to unpublish
      const isPublished = await isPostPublished(id);
      if (isPublished) await triggerDeploy();
      return new Response(valid.reason, { status: 200 });
    }

    const { publishDate } = parsePostPublishDate(d.body, now);
    if (publishDate > now) {
      // The post should be scheduled, but if it appears to be published, then trigger a build to unpublish it
      const isPublished = await isPostPublished(id);
      if (isPublished) await triggerDeploy();
      await addScheduledLabel(id);
      console.log(`Scheduled post '${title}' [${id}] for ${publishDate.toISOString()}`);
      return new Response("Scheduled", { status: 201 });
    } else {
      console.log(`Publishing post '${title}' [${id}]`);
      await removeScheduledLabel(id);
      await triggerDeploy();
      return new Response("Published", { status: 200 });
    }

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal Error", { status: 500 });
  }

};