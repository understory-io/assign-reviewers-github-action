# auto-release-dev-stage-prod-testing

GitHub Action that assigns reviewers to a Pull Request based on the authors of commits in the PR.

## Testing

You can run the action locally by running `manual-test`.
See `src/tests/test.ts` for input configuration.

You need a GitHub Personal Access Token as an environment variable in `GITHUB_TOKEN` to run it.

```
npm run manual-test
```
