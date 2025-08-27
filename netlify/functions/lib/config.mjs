export const CONFIG = {
  blogCategory: process.env.BLOG_CATEGORY || "Blog Post",
  ignoreLabels: (process.env.IGNORE_LABELS || "")
    .split(",").map(s => s.trim()).filter(Boolean),
  scheduledLabel: process.env.SCHEDULED_LABEL || "state/scheduled",
  timezoneLocation: process.env.TIMEZONE_LOCATION || "UTC",
};

export const GH = {
  owner: process.env.GITHUB_REPO_OWNER,
  repo: process.env.GITHUB_REPO_NAME,
  token: process.env.GITHUB_ACCESS_TOKEN,
  webhookSecret: process.env.GITHUB_WEBHOOK_SECRET
};

export const BUILD = {
  netlifyHook: process.env.NETLIFY_BUILD_HOOK || "",
};