# massCode

> Work in progress

A free and open source code snippets manager for developers.

<p align="center">
  <img src="./logo.png" width="80">
</p>
<p align="center">
  <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/antonreshetov/massCode/CI">
  <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/antonreshetov/massCode">
  <img alt="GitHub All Releases" src="https://img.shields.io/github/downloads/antonreshetov/massCode/total">
  <img alt="GitHub" src="https://img.shields.io/github/license/antonreshetov/massCode">
</p>
<p align="center">
  <img src="./preview.png">
</p>
<p align="center">
  <strong>Built with Electron, Vue & Monaco editor.</strong>
  <br>
  Inspired by applications like SnippetsLab and Quiver.
</p>
<p align="center">
  <a href="https://masscode.io">https://masscode.io</a>
</p>

## Overview

**massCode** - is a free and open source code snippets manager for developers.

The goal of creating this application was mostly my own growth as a developer. Also, I wanted this project to absorb the best of such applications already on the market (both free and paid). At the same time, I wanted this project to be an open source project.

The main feature is a modern editor - [Monaco editor](https://microsoft.github.io/monaco-editor/), which is used in [VS Code](https://code.visualstudio.com/). Among the advantages of the editor are rich IntelliSense, validation for TypeScript, JavaScript, CSS, LESS, SCSS, JSON, HTML.

The editor does not initially support many languages for syntax highlighting, but you can describe the missing ones in declarative form using [Monarch](https://microsoft.github.io/monaco-editor/monarch.html).

The editor also supports an easy way to create themes.

At the moment I am working on macOS version, because I use macOS :)

There's still a lot of work ahead!

## Development

```bash
# install dependencies
yarn
# serve with hot reload
yarn dev
```

## Building

```bash
## build application for production
yarn build
```

## Support

If you like the project, you can support it by becoming a backer or sponsor:

- <a href="https://www.patreon.com/antonreshetov" target="_blank">Become a backer or sponsor on Patreon</a>.
- <a href="https://paypal.me/antonreshetov" target="_blank">One-time donation via PayPal</a>.

