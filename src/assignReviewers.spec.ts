import { selectReviewers } from "./assignReviewers";
import assert from "node:assert";

describe("selectReviewers", () => {
  const testCases = [
    {
      description:
        "should return authors excluding the PR creator and existing reviewers",
      authors: ["alice", "bob", "charlie"],
      completedReviewers: ["bob"],
      prCreator: "alice",
      expected: ["charlie"],
    },
    {
      description:
        "should return an empty array if all authors are either the PR creator or existing reviewers",
      authors: ["alice", "bob"],
      completedReviewers: ["bob"],
      prCreator: "alice",
      expected: [],
    },
    {
      description:
        "should return all authors if none are the PR creator or existing reviewers",
      authors: ["alice", "bob", "charlie"],
      completedReviewers: [],
      prCreator: "eve",
      expected: ["alice", "bob", "charlie"],
    },
    {
      description: "should handle empty existing reviewers array",
      authors: ["alice", "charlie", "bob"],
      completedReviewers: [],
      prCreator: "alice",
      expected: ["bob", "charlie"],
    },
    {
      description: "should deduplicate authors",
      authors: ["alice", "bob", "bob"],
      completedReviewers: [],
      prCreator: "alice",
      expected: ["bob"],
    },
    {
      description: "should deduplicate completed reviews",
      authors: ["alice", "bob"],
      completedReviewers: ["alice", "alice"],
      prCreator: "eve",
      expected: ["bob"],
    },
  ];

  testCases.forEach(
    ({ description, authors, prCreator, expected, completedReviewers }) => {
      it(description, () => {
        const result = selectReviewers({
          authors,
          completedReviewers,
          prCreator,
          info: console.log,
        });

        console.log(`New reviewers:       [${result.join(", ")}]`);
        assert.deepEqual(result, expected);
      });
    }
  );
});
