[![Node.js version][nodejs-badge]][nodejs]
[![NPM version][npm-badge]][npm]

[![MIT License][license-badge]][LICENSE]
[![PRs Welcome][prs-badge]][prs]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]

# twitch-song-id

A 99% complete, but entirely useless project to ID songs on live twitch streams.

The reason that its entirely useless is because I couldn't find an API to query to see if the fingerprint matches any known song. I tried using [acoustid](https://acoustid.org/webservice), but it turns outthat you can't use partial fingerprints.

If anyone checks out this project and can recommend me a web service that I can use, let me know and I'll finish this tool and even add a frontend website.

## Quick start

You're going to need a modern version of Node (6.x) and a few things in your path:
  * ffmpeg
  * fpcalc
  * Streamlink (should really be replaced with the python version)

[dependencies-badge]: https://david-dm.org/pendo324/twitch-song-id/dev-status.svg
[dependencies]: https://david-dm.org/pendo324/twitch-song-id?type=dev
[nodejs-badge]: https://img.shields.io/badge/node->=%206.9.0-blue.svg
[nodejs]: https://nodejs.org/dist/latest-v6.x/docs/api/
[npm-badge]: https://img.shields.io/badge/npm->=%203.10.8-blue.svg
[npm]: https://docs.npmjs.com/
[typescript]: https://www.typescriptlang.org/
[typescript-22]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: https://github.com/pendo324/twitch-song-id/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[prs]: http://makeapullrequest.com
[github-watch-badge]: https://img.shields.io/github/watchers/pendo324/twitch-song-id.svg?style=social
[github-watch]: https://github.com/pendo324/twitch-song-id/watchers
[github-star-badge]: https://img.shields.io/github/stars/pendo324/twitch-song-id.svg?style=social
[github-star]: https://github.com/pendo324/twitch-song-id/stargazers
[twitter-badge]: https://img.shields.io/twitter/url/https/pendo324/twitch-song-id.svg?style=social
[jest]: https://facebook.github.io/jest/
[tslint]: https://palantir.github.io/tslint/
