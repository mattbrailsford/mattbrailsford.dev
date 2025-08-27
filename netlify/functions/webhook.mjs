import { addScheduledLabel, removeScheduledLabel, verifySignature } from "./lib/github-utils.mjs";
import { isValidBlogPost, parsePostPublishDate, enqueuePost } from "./lib/blog-utils.mjs";
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
    const now = new Date();

    const valid = isValidBlogPost(d);
    if (!valid.valid) return new Response(valid.reason, { status: 200 });

    const { publishDate } = parsePostPublishDate(d.body, now);
    if (publishDate > now) {
      await enqueuePost({ id, publishAt: publishDate.toISOString() });
      await addScheduledLabel(id);
      return new Response("Scheduled", { status: 201 });
    } else {
      await removeScheduledLabel(id);
      await triggerDeploy();
      return new Response("Published", { status: 200 });
    }

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal Error", { status: 500 });
  }

};