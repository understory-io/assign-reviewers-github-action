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
  debug: (message: string) => void;
  info: (message: string) => void;
}): Promise<void> {
  const octokit = getOctokit(token);

  let commits;

  try {
    commits = await octokit.rest.pulls.listCommits({
      owner: owner,
      repo: repo,
      pull_number: number,
    });
  } catch (error: any) {
    throw new Error("Failed to list commits: " + error.message); // TODO: add cause
  }

  const completedReviewers = await octokit.rest.pulls.listReviews({
    owner: owner,
    repo: repo,
    pull_number: number,
  });

  debug("Commits: " + JSON.stringify(commits));
  debug("Completed authors: " + JSON.stringify(completedReviewers));

  const commitAuthorLogins = commits.data
    .filter((commit) => commit.author?.type !== "Bot")
    .map((commit) => commit.author?.login)
    // drop unknown authors, ie. commits with an author that is not matching a GitHub account
    .filter(dropFalsy);
  const completedReviewersLogins = completedReviewers.data
    .map((review) => review.user?.login)
    // drop unknown authors, ie. commits with an author that is not matching a GitHub account
    .filter(dropFalsy);

  const reviewers = selectReviewers({
    authors: commitAuthorLogins,
    completedReviewers: completedReviewersLogins,
    prCreator: userLogin,
    info,
  });

  if (reviewers.length === 0) {
    info("No reviewers have been assigned to the pull request");
    return;
  }

  info(`Assigning the following reviewers: ${reviewers.join(", ")}`);

  const result = await octokit.rest.pulls.requestReviewers({
    owner: owner,
    repo: repo,
    pull_number: number,
    reviewers: reviewers,
  });

  if (result.status !== 201) {
    throw new Error("Failed to update reviewers: " + JSON.stringify(result));
  }
}

export function selectReviewers({
  authors,
  completedReviewers,
  prCreator,
  info,
}: {
  authors: string[];
  completedReviewers: string[];
  prCreator: string;
  info: (message: string) => void;
}): string[] {
  // deduplicate authors in case of multiple commits by the same author
  const authorsMap = new Set<string>(authors);

  authorsMap.delete(prCreator);

  // deduplicate completed reviewers in case of multiple reviews by the same author
  const completedReviewersMap = new Set<string>(completedReviewers);

  info(`Authors:             ${prettyPrint(authorsMap)}`);
  info(`Completed reviewers: ${prettyPrint(completedReviewersMap)}`);

  // remove already completed reviewers to avoid re-reviews
  completedReviewersMap.forEach((reviewer) => {
    authorsMap.delete(reviewer);
  });

  return [...authorsMap].sort();
}

function prettyPrint(a: Set<string>): string {
  return `[${[...a].sort().join(", ")}]`;
}

function dropFalsy(v: string | null | undefined): v is string {
  return v !== undefined && v !== null;
}
