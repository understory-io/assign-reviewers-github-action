import { assignReviewers } from "../assignReviewers";

async function run() {
  const authors = await assignReviewers({
    owner: "understory-io",
    repo: "backoffice",
    number: 2192,
    debug: (m: string) => console.log("DEBUG: " + m),
    info: console.log,
    userLogin: "foo",
    token: process.env.GITHUB_TOKEN || "",
  });

  console.log(authors);
}

run();
