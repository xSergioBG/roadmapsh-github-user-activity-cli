const https = require("node:https");

function fetchGitHubActivity(username, transport = https) {
  if (!/^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i.test(username || "")) {
    return Promise.reject(new Error("Provide a valid GitHub username."));
  }
  return new Promise((resolve, reject) => {
    const request = transport.get(
      `https://api.github.com/users/${encodeURIComponent(username)}/events`,
      { headers: { "User-Agent": "github-activity-cli", Accept: "application/vnd.github+json" } },
      response => {
        let data = "";
        response.setEncoding("utf8");
        response.on("error", reject);
        response.on("aborted", () => reject(new Error("GitHub response was interrupted.")));
        response.on("data", chunk => { data += chunk; });
        response.on("end", () => {
          if (response.statusCode !== 200) {
            const message = response.statusCode === 404 ? "GitHub user not found."
              : response.statusCode === 403 || response.statusCode === 429 ? "GitHub denied the request or its rate limit was reached."
              : `GitHub returned HTTP ${response.statusCode}.`;
            return reject(new Error(message));
          }
          try {
            const events = JSON.parse(data);
            if (!Array.isArray(events)) throw new Error("Expected an event list.");
            resolve(events);
          } catch { reject(new Error("GitHub returned invalid event data.")); }
        });
      }
    );
    request.on("error", reject);
    request.setTimeout(10000, () => request.destroy(new Error("GitHub request timed out.")));
  });
}

function formatEvent(event) {
  const repo = event.repo?.name || "unknown repository";
  const action = event.payload?.action || "updated";
  switch (event.type) {
    case "PushEvent": return `Pushed to ${repo}`;
    case "IssuesEvent": return `${action} issue in ${repo}`;
    case "WatchEvent": return `Starred ${repo}`;
    case "PullRequestEvent": return `${action} pull request in ${repo}`;
    default: return `Other event: ${event.type} in ${repo}`;
  }
}

async function main() {
  try {
    const username = process.argv[2];
    if (process.argv.length !== 3) throw new Error("Usage: node index.js <GitHub username>");
    const events = await fetchGitHubActivity(username);
    if (!events.length) console.log("No recent activity found for this user.");
    for (const event of events) console.log(formatEvent(event));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
if (require.main === module) main();
module.exports = { fetchGitHubActivity, formatEvent };
