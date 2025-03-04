import * as core from "@actions/core";
import { context } from "@actions/github";
import { assignReviewers } from "./assignReviewers";

async function run() {
  try {
    const target = context.payload.pull_request;
    if (target === undefined) {
      throw new Error("Can't get payload. Check you trigger event");
    }
    const {
      number,
      user: { login: userLogin },
    } = target;

    const token = core.getInput("token", { required: true });

    await assignReviewers({
      number,
      token,
      info: core.info,
      debug: core.debug,
      owner: context.repo.owner,
      repo: context.repo.repo,
      userLogin,
    });
  } catch (error: any) {
    core.debug("context.payload: " + JSON.stringify(context.payload));
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
