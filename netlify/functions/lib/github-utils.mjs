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

async function getLabelNodeId(labelName) {
  const data = await ghGraphQL(
    `query($owner:String!, $repo:String!, $q:String!) {
       repository(owner:$owner, name:$repo) {
         labels(query:$q, first: 1) {
           nodes { id name }
         }
       }
     }`,
    { owner: GH.owner, repo: GH.repo, q: labelName }
  );
  return data?.repository?.labels?.nodes?.[0].id;
}

async function discussionHasLabel(discussionId, labelIdOrName) 
{
  const data = await ghGraphQL(
    `query($id:ID!, $first:Int!, $after:String) {
        node(id:$id) {
          ... on Discussion {
            labels(first:$first, after:$after) {
              nodes { id name }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
      }`,
    { id: discussionId, first: 100, after: cursor }
  );
  const conn = data?.node?.labels;
  if (!conn) return false;
  return conn.nodes.some(l => l.name === labelIdOrName || l.id === labelIdOrName);
}

export async function addScheduledLabel(discussionId) 
{
  const hasLabel = await discussionHasLabel(discussionId, CONFIG.scheduledLabel);
  if (hasLabel) return;

  const labelNodeId = await getLabelNodeId(CONFIG.scheduledLabel);
  if (!labelNodeId) return;

  await ghGraphQL(
    `mutation($id:ID!, $labelIds:[ID!]!) {
      addLabelsToLabelable(input:{labelableId:$id, labelIds:$labelIds}) { clientMutationId }
    }`,
    { id: discussionId, labelIds: [labelNodeId] }
  );
}

export async function removeScheduledLabel(discussionId) 
{
  const hasLabel = await discussionHasLabel(discussionId, CONFIG.scheduledLabel);
  if (!hasLabel) return;

  const labelNodeId = await getLabelNodeId(CONFIG.scheduledLabel);
  if (!labelNodeId) return;
  
  await ghGraphQL(
    `mutation($id:ID!, $labelIds:[ID!]!) {
      removeLabelsFromLabelable(input:{labelableId:$id, labelIds:$labelIds}) { clientMutationId }
    }`,
    { id: discussionId, labelIds: [labelNodeId] }
  );
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

