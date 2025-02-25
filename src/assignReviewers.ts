import { getOctokit } from "@actions/github";

export async function assignReviewers({
  owner,
  repo,
  number,
  token,
  userLogin,
  debug,
  info,
}: {
  owner: string;
  repo: string;
  number: number;
  token: string;
  userLogin: string;
  info: (message: string) => void;
  debug: (message: string) => void;
}): Promise<Array<string>> {
  const octokit = getOctokit(token);

  let commits;

  try {
    commits = await octokit.rest.pulls.listCommits({
      owner: owner,
      repo: repo,
      pull_number: number,
    });
    debug("Commits: " + JSON.stringify(commits));
  } catch (error: any) {
    throw new Error("Failed to list commits: " + error.message); // TODO: add cause
  }

  // deduplicate authors in case of multiple commits by the same author
  const authors = new Set<string>(
    commits.data
      .map((commit) => commit.author?.login)
      .filter((login): login is string => login !== undefined && login !== null)
  );
  authors.delete(userLogin);

  info(`Commit authors: ${[...authors]}`);

  const existingReviewers = await octokit.rest.pulls.listRequestedReviewers({
    owner: owner,
    repo: repo,
    pull_number: number,
  });

  const existingReviewerLogins = new Set(
    existingReviewers.data.users.map((user) => user.login)
  );

  info(`Existing open reviewers: ${[...existingReviewerLogins]}`);

  // filter out authors who has already provided a review
  const relevantAuthors = [...authors].filter((author) =>
    existingReviewerLogins.has(author)
  );

  debug(`Relevant authors: ${relevantAuthors}`);

  if (relevantAuthors.length === 0) {
    info("No reviewers have been assigned to the pull request");
    return [];
  }

  const result = await octokit.rest.pulls.requestReviewers({
    owner: owner,
    repo: repo,
    pull_number: number,
    reviewers: relevantAuthors,
  });

  if (result.status !== 201) {
    throw new Error("Failed to update reviewers: " + JSON.stringify(result));
  }

  return relevantAuthors;
}
