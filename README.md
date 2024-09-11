<p align="center">
<img src="packages/assets/images/unsearch.png" alt="drawing" width="150" height="150" /></p>
<h1 align="center"><b>Unsearch</b></h1>
<p align="center">A privacy-friendly browsing data manager.</br><a href="https://unsearch.app">unsearch.app »</a></p>

Unsearch is an open-source, cross-browser manager for browsing activity.

> UPDATE: Unsearch is currently under development and in alpha version (Sep 11th 2024).

Sync and manage all your bookmarks and browsing history from multiple browsers in one place, without the limitations of the sync solutions offered by major browsers.

<img src="packages/assets/images/mockup.png" alt="drawing" style="width:100%;" />

## Motivation

In today's digital age, many of us frequently switch between different web browsers, creating a scattered web activity history that is often complicated to keep synchronized in one place. The default sync solutions offered by the major browsers come with their own limitations, often locking users into specific ecosystems and leaving their data vulnerable to being harvested for advertising purposes. They also lack some useful features, such as advanced search filters or rules to save only certain data, that would make it easier to find information and personalize your web experience. I created this open source cross-browser manager to provide a privacy-friendly alternative that gives users full ownership and control over their data.

## Roadmap

View a list of our planned features here: [unsearch.app/roadmap](https://unsearch.app/roadmap)

## Developer Guide

Please refer to the [contributing guide](CONTRIBUTING.md) for how to install Unsearch.

## Monorepo structure

- `/extension`: A cross browser extension (currently tested on Chrome, Firefox and Microsoft Edge)
- `/backend`: A Websocket server that connects with extensions and a http server that interacts with the database.
- `/client`: A React client
- `/landing`: A landing page built with React.
- `/docs`: A vite app that contains the docs.
- `/packages/assets`: Some shared assets
- `/packages/ui`: A set of shared components built with React, used in both the `extension` and `client`
- `/word2vec`: A Flask api that serves a pretrained word embedding for semantic search.
