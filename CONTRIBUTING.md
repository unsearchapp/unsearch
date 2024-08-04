# Welcome to Unsearch contributing guide

First off, thanks for taking the time to contribute!

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our community respectable.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

## New contributor guide

To get an overview of the project, read the [README](README.md) file. Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/getting-started-with-git/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

## Getting started

To navigate our codebase with confidence, see [the introduction to working in the docs repository](/contributing/README.md) :confetti_ball:. For more information on how we write our markdown files, see "[Using Markdown and Liquid in GitHub Docs](https://docs.github.com/en/contributing/writing-for-github-docs/using-markdown-and-liquid-in-github-docs)."

Check to see what [types of contributions](/contributing/types-of-contributions.md) we accept before making changes. Some of them don't even require writing a single line of code :sparkles:.

### Issues

#### Create a new issue

If you spot an issue or feature request for Unsearch, [search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments). If a related issue doesn't exist, you can open a new issue using a relevant [issue form](https://github.com/unsearchapp/unsearch/issues/new/choose).

#### Solve an issue

Scan through our [existing issues](https://github.com/unsearchapp/unsearch/issues) to find one that interests you. You can narrow down the search using `labels` as filters. See "[Label reference](https://github.com/unsearchapp/unsearch/labels)" for more information. As a general rule, we don’t assign issues to anyone. If you find an issue to work on, you are welcome to open a PR with a fix.

### Make Changes

#### Make changes locally

Make sure you have installed [Docker Compose](https://docs.docker.com/compose/install/) and [pnpm](https://pnpm.io/installation) before continuing.

1. Clone the repository: `git clone https://github.com/unsearchapp/unsearch`

2. Navigate to the project folder: `cd unsearch`

3. Create an `.env` file on the root folder:

```
WS_PORT=1234                         # Port of Websocket server
HTTP_PORT=5000                       # Por of http server
NODE_ENV=development                 #
PGUSER=myuser                        # PostgreSQL settings
PGHOST=postgres                      #     |         |
PGDATABASE=mydb                      #     ⌄         ⌄
PGPASSWORD=mypassword                #
PGPORT=5432                          #
JWT_SECRET=supersecret               # Used in the backend
CLIENT_PORT=3000                     # The port of the React client
LOG_LEVEL='info'                     # The log level of the backend, can be: trace, debug, info, warn, error and fatal
APP_URL="http://backend:5000"        # The backend url
WORD2VEC_URL="http://word2vec:5001"  # The url of the word embedding service
```

To enable semantic search it is necessary to download `GoogleNews-vectors-negative300.bin.gz` and store the file inside `word2vec/`. If the file is not present, the semantic search will default to an exact search. Link to [download from Kaggle](https://www.kaggle.com/datasets/leadbest/googlenewsvectorsnegative300/data).

4. Run with Docker Compose: `docker-compose up --build`
5. Install dependencies of extension: `cd extension && pnpm i`
6. Create an `.env` file on the folder `/extensions`:

```
VITE_WEBAPP_URL=http://localhost:3000   # Url of the React client
VITE_BACKEND_URL=http://localhost:5000  # Url of the http server
VITE_WS_URL=ws://localhost:1234         # Url of the websocket server
```

7. To start dev mode: `pnpm dev:firefox`

8. To build the extension: `pnpm build`

After building, you can load the `/dist` folder as an unpackged extension on Google Chrome, Firefox and Microsoft Edge.

If you encounter any issues, make sure you are using the following versions of Node and pnpm:

- Node version: 22.4.0
- pnpm version: 9.4.0

### Pull Request

When you're finished with the changes, create a pull request, also known as a PR.

- Fill the "Ready for review" template so that we can review your PR. This template helps reviewers understand your changes as well as the purpose of your pull request.
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
- Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so the branch can be updated for a merge.
  Once you submit your PR, a Docs team member will review your proposal. We may ask questions or request additional information.
- You may be asked to make changes before a PR can be merged, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.
- As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).
- If you run into any merge issues, checkout this [git tutorial](https://github.com/skills/resolve-merge-conflicts) to help you resolve merge conflicts and other issues.

### Your PR is merged!

Congratulations :tada::tada: Thank you for being a contributing to Unsearch! :sparkles:.

Once your PR is merged, your contributions will be publicly visible on the main branch.

## Attribution

This guide is based on the GitHub docs [contributing guide](https://github.com/github/docs/blob/main/.github/CONTRIBUTING.md/).
