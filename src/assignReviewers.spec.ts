import { selectReviewers } from "./assignReviewers";
import assert from "node:assert";

describe("selectReviewers", () => {
  const testCases = [
    {
      description:
        "should return authors excluding the PR creator and existing reviewers",
      authors: ["alice", "bob", "charlie"],
      existingReviewers: ["bob"],
      prCreator: "alice",
      expected: ["charlie"],
    },
    {
      description:
        "should return an empty array if all authors are either the PR creator or existing reviewers",
      authors: ["alice", "bob"],
      existingReviewers: ["bob"],
      prCreator: "alice",
      expected: [],
    },
    {
      description:
        "should return all authors if none are the PR creator or existing reviewers",
      authors: ["alice", "bob", "charlie"],
      existingReviewers: ["dave"],
      prCreator: "eve",
      expected: ["alice", "bob", "charlie"],
    },
    {
      description: "should handle empty authors array",
      authors: [],
      existingReviewers: ["bob"],
      prCreator: "alice",
      expected: [],
    },
    {
      description: "should handle empty existing reviewers array",
      authors: ["alice", "bob", "charlie"],
      existingReviewers: [],
      prCreator: "alice",
      expected: ["bob", "charlie"],
    },
    {
      description: "should deduplicate auhtors",
      authors: ["alice", "bob", "bob"],
      existingReviewers: [],
      prCreator: "alice",
      expected: ["bob"],
    },
  ];

  testCases.forEach(
    ({ description, authors, existingReviewers, prCreator, expected }) => {
      it(description, () => {
        const result = selectReviewers({
          authors,
          existingReviewers,
          prCreator,
        });
        assert.deepEqual(result, expected);
      });
    }
  );
});
