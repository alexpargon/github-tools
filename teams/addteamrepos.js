/*
 * Adds a team to all the repos in a Github organization. This is a tedious
 * process in the UI. You'll need a newer version of node to run this (e.g 9+)
 * because it uses async/await.
 *
 * Instructions:
 *
 * 1. Copy this file somewhere on your computer, e.g. ~/addteamrepos.js
 * 2. Fill in the uppercase variables below with the right values
 * 3. Run this file: `$ node ~/addteamrepos.js`
 *
 * options:
 * To use in windows, exchange '{"permission":"${permission}"}' with \"{\\"permission\\":\\"${permission}\\"}\"
 */

const GITHUB_ORG =
  "your-organisation"; /* Name of the github organization the team is under and the repos are in */
const GITHUB_ACCESS_TOKEN =
  "ghp_yourtoken"; /* Create an access token here: https://github.com/settings/tokens */
const TEAM_SLUG =
  "your-team-slug"; /* GitHub team slug, similar to the name, you can get it from the API (the url when checking team) */
const TEAM_PERMISSION = "push"; /* 'pull' or 'push' or 'admin' */
const REPO_OWNER = "name-of-owner"; /* Possibly the same as your organisation */

const { exec } = require("child_process");

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        return reject(err);
      }
      resolve([stdout, stderr]);
    });
  });
}

async function fetchReposPage(org, page) {
  const [response] = await execPromise(
    `curl -i -H "Authorization: token ${GITHUB_ACCESS_TOKEN}" https://api.github.com/orgs/${org}/repos?page=${page}`
  );
  const nextPageRe = /Link\: \<.+page\=([0-9]*)\>\; rel\=\"next\"/g;
  const nextPageMatch = nextPageRe.exec(response);
  const nextPage = nextPageMatch ? nextPageMatch[1] : null;
  const repos = JSON.parse(response.slice(response.indexOf("[")));
  return [repos, nextPage];
}

async function fetchRepos(org) {
  let repos = [];
  let page = 1;
  while (page) {
    let [currentRepos, nextPage] = await fetchReposPage(org, page);
    repos = [...repos, ...currentRepos];
    page = nextPage;
  }
  return repos;
}

async function addTeamToRepo(teamSlug, org, repo, permission, owner) {
  const [out, err] = await execPromise(
    `curl -X PUT -H "Authorization: token ${GITHUB_ACCESS_TOKEN}"  https://api.github.com/orgs/${org}/teams/${teamSlug}/repos/${owner}/${repo} -d '{"permission":"${permission}"}'`
  );
  console.log(out);
  console.log(
    `...  Added team "${teamSlug}" to repo "${org}/${repo}" with permission "${permission}"`
  );
}

(async () => {
  /* Fetch all repos names for org */
  console.log(`Fetching repos from organization "${GITHUB_ORG}"`);
  const repos = await fetchRepos(GITHUB_ORG);
  const repoNames = repos.map((r) => r.name);
  console.log(`... Found ${repoNames.length} repos`);

  /* Add team to each repo */
  console.log(
    `Adding team "${TEAM_SLUG}" to ${repoNames.length} repos with permission "${TEAM_PERMISSION}"`
  );
  for (let repo of repoNames) {
    await addTeamToRepo(
      TEAM_SLUG,
      GITHUB_ORG,
      repo,
      TEAM_PERMISSION,
      REPO_OWNER
    );
  }
})();
