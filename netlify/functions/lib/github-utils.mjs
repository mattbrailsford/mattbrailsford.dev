import crypto from "node:crypto";
import { CONFIG, GH } from "./config.mjs";

function ghHeaders() 
{
  return {
    "Authorization": `Bearer ${GH.token}`,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json"
  };
}

async function ghGraphQL(query, variables) 
{
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { "Authorization": `Bearer ${GH.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

export async function addScheduledLabel(discussionId) 
{
  try
  {
    const labelsRes = await fetch(
      `https://api.github.com/repos/${GH.owner}/${GH.repo}/labels?per_page=100`,
      { headers: ghHeaders() }
    );
    const labels = await labelsRes.json();
    let scheduled = labels.find(l => l.name === CONFIG.scheduledLabel);
    if (!scheduled) return;
    await ghGraphQL(
      `mutation($id:ID!, $labelIds:[ID!]!) {
        addLabelsToLabelable(input:{labelableId:$id, labelIds:$labelIds}) { clientMutationId }
      }`,
      { id: discussionId, labelIds: [scheduled.node_id] }
    );
  }
  catch {};
}

export async function removeScheduledLabel(discussionId) 
{
  try
  {
    const labelsRes = await fetch(
      `https://api.github.com/repos/${GH.owner}/${GH.repo}/labels?per_page=100`,
      { headers: ghHeaders() }
    );
    const labels = await labelsRes.json();
    const scheduled = labels.find(l => l.name === CONFIG.scheduledLabel);
    if (!scheduled) return;
    await ghGraphQL(
      `mutation($id:ID!, $labelIds:[ID!]!) {
        removeLabelsFromLabelable(input:{labelableId:$id, labelIds:$labelIds}) { clientMutationId }
      }`,
      { id: discussionId, labelIds: [scheduled.node_id] }
    );
  }
  catch {};
}

export function verifySignature(req, bodyText) 
{
  const secret = process.env.GH_WEBHOOK_SECRET || "";
  if (!secret) return true;
  const sig = req.headers.get("x-hub-signature-256") || "";
  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(bodyText).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig));
}

