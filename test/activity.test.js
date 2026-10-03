const { test } = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { fetchGitHubActivity, formatEvent } = require("../index");
function transport(status, body, error) {
  return { get(url, options, callback) {
    assert.match(url, /^https:\/\/api\.github\.com\/users\/octocat\/events$/);
    assert.equal(options.headers["User-Agent"], "github-activity-cli");
    const request = new EventEmitter();
    request.setTimeout = () => request;
    process.nextTick(() => {
      if (error) return request.emit("error", error);
      const response = new EventEmitter();
      response.statusCode = status; response.setEncoding = () => {};
      callback(response);
      response.emit("data", body);
      response.emit("end");
    });
    return request;
  } };
}
test("valid events are parsed", async () => {
  assert.deepEqual(await fetchGitHubActivity("octocat", transport(200, '[{"type":"PushEvent"}]')), [{ type: "PushEvent" }]);
});
test("HTTP 404 and rate limits are reported", async () => {
  await assert.rejects(fetchGitHubActivity("octocat", transport(404, "{}")), /not found/);
  await assert.rejects(fetchGitHubActivity("octocat", transport(403, "{}")), /rate limit/);
  await assert.rejects(fetchGitHubActivity("octocat", transport(429, "{}")), /rate limit/);
});
test("invalid JSON and non-list responses are rejected", async () => {
  for (const body of ["not JSON", "{}"]) {
    await assert.rejects(fetchGitHubActivity("octocat", transport(200, body)), /invalid event data/);
  }
});
test("network errors are reported", async () => {
  await assert.rejects(fetchGitHubActivity("octocat", transport(200, "", new Error("offline"))), /offline/);
});
test("invalid usernames do not make a request", async () => {
  for (const username of ["", "../admin", "a/b", "-name", "name-"]) {
    await assert.rejects(fetchGitHubActivity(username, { get() { throw new Error("Must not request"); } }), /valid GitHub/);
  }
});
test("issue and pull request action reflects closed events", () => {
  assert.equal(formatEvent({ type: "IssuesEvent", repo: { name: "a/b" }, payload: { action: "closed" } }), "closed issue in a/b");
  assert.equal(formatEvent({ type: "PullRequestEvent", repo: { name: "a/b" }, payload: { action: "closed" } }), "closed pull request in a/b");
});
test("empty activity is valid and missing repo names have a fallback", async () => {
  assert.deepEqual(await fetchGitHubActivity("octocat", transport(200, "[]")), []);
  assert.match(formatEvent({ type: "NewEvent" }), /unknown repository/);
});
