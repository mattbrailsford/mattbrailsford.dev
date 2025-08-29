import crypto from "node:crypto";
import { CONFIG, GH } from "./config.mjs";

const ghGraphQL = async (query, variables) =>
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

let _labelIds = {};
const getLabelId = async (label) => _labelIds[label.toLowerCase()] ??= (await ghGraphQL(
  `query($owner:String!, $repo:String!, $q:String!) {
    repository(owner:$owner, name:$repo) {
      labels(query:$q, first:1) { 
        nodes { id } 
      } 
    }
  }`,
  { owner: GH.owner, repo: GH.repo, q: label }
))?.repository?.labels?.nodes?.[0]?.id;

const discussionHasLabel = async (discussionId, labelIdOrName) =>
{
  const data = await ghGraphQL(
    `query($id:ID!) {
        node(id:$id) {
          ... on Discussion {
            labels(first:100) {
              nodes { id name }
            }
          }
        }
      }`,
    { id: discussionId }
  );
  const conn = data?.node?.labels;
  if (!conn) return false;
  return conn.nodes.some(l => l.id === labelIdOrName || l.name.toLowerCase() === labelIdOrName.toLowerCase());
}

export const addScheduledLabel = async (discussionId) => 
{
  if (await discussionHasLabel(discussionId, CONFIG.scheduledLabel)) return;

  const labelId = await getLabelId(CONFIG.scheduledLabel);
  if (!labelId) return;

  await ghGraphQL(
    `mutation($id:ID!, $labelIds:[ID!]!) {
      addLabelsToLabelable(input:{labelableId:$id, labelIds:$labelIds}) { 
        clientMutationId
      }
    }`,
    { id: discussionId, labelIds: [labelId] }
  );
};

export const removeScheduledLabel = async (discussionId) => 
{
  if (!(await discussionHasLabel(discussionId, CONFIG.scheduledLabel))) return;

  const labelId = await getLabelId(CONFIG.scheduledLabel);
  if (!labelId) return;

  await ghGraphQL(
    `mutation($id:ID!, $labelIds:[ID!]!) {
      removeLabelsFromLabelable(input:{labelableId:$id, labelIds:$labelIds}) { 
        clientMutationId 
      }
    }`,
    { id: discussionId, labelIds: [labelId] }
  );
};

export const getScheduledDiscussions = async () => (await ghGraphQL(
  `query($query:String!) {
    search(type:DISCUSSION, query:$query, first:100) {
      nodes { 
        ...on Discussion { id title body } 
      }
    }
  }`,
  { query: `repo:${GH.owner}/${GH.repo} label:"${CONFIG.scheduledLabel}"` }
))?.search?.nodes || [];

export const verifySignature = (req, bodyText) => {
  const secret = process.env.GH_WEBHOOK_SECRET;
  if (!secret) return true;
  const sig = req.headers.get("x-hub-signature-256");
  const digest = "sha256=" + crypto.createHmac("sha256", secret).update(bodyText).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig));
};

