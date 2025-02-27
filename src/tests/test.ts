import { assignReviewers } from "../assignReviewers";

async function run() {
  await assignReviewers({
    owner: "understory-io",
    repo: "backoffice",
    number: 2199,
    info: console.log,
    userLogin: "foo",
    token: process.env.GITHUB_TOKEN || "",
  });
}

run();
