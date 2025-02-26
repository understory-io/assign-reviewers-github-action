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

  const existingReviewers = await octokit.rest.pulls.listRequestedReviewers({
    owner: owner,
    repo: repo,
    pull_number: number,
  });

  const reviewers = selectReviewers({
    authors: commits.data
      .map((commit) => commit.author?.login)
      .filter(
        // drop unknown authors, ie. commits with an author that is not matching a GitHub account
        (login): login is string => login !== undefined && login !== null
      ),
    existingReviewers: existingReviewers.data.users.map((user) => user.login),
    prCreator: userLogin,
  });

  if (reviewers.length === 0) {
    info("No reviewers have been assigned to the pull request");
    return [];
  }

  const result = await octokit.rest.pulls.requestReviewers({
    owner: owner,
    repo: repo,
    pull_number: number,
    reviewers: reviewers,
  });

  if (result.status !== 201) {
    throw new Error("Failed to update reviewers: " + JSON.stringify(result));
  }

  return reviewers;
}

export function selectReviewers({
  authors,
  existingReviewers,
  prCreator,
}: {
  authors: string[];
  existingReviewers: string[];
  prCreator: string;
}): string[] {
  // deduplicate authors in case of multiple commits by the same author
  const authorsMap = new Set<string>(authors);

  authorsMap.delete(prCreator);

  const existingReviewerMap = new Set(existingReviewers);

  // filter out authors who has already provided a review
  const relevantAuthors = [...authorsMap].filter(
    (author) => !existingReviewerMap.has(author)
  );

  return relevantAuthors;
}
