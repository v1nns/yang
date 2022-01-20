# Yet Another Notifier ~~for~~ Gerrit (YANG)

An open-source browser extension to receive update notifications about
Change-Ids from Gerrit.

![](screenshot/first-release.gif?raw=true)

*This is a work in progress*.

## Installation

Currently, this browser extension is **not** published in any store yet. So, if
you want to use, must install it manually. It is possible to download the
extension from Releases page, or even build locally for the targeted browser.

After installing it, the first thing you should do is to set up the Gerrit
configuration in Options page (there is a "Test" button to check if endpoint and
credentials are working fine*).

And if you are afraid to use it, whatever the reason, check permissions in
[manifest.json](app/manifest.json) and also the code.

**Don't forget to save the Gerrit configuration :grin:*

## Development

This extension was developed using [WebExtension
Toolbox](https://github.com/webextension-toolbox/webextension-toolbox/) (it
makes easier to develop a cross-browser extension).

[TALK ABOUT TOOLS]: React, Jest, ESLint

### Quick Start

```bash
# First, clone it, and then install the dependency packages
npm install

# For local development
npm run dev <browser>

# Or if you want to create a bundle for production
npm run build <browser>
```

**Possible options for browser: chrome, firefox, opera, edge*

## Work In Progress

- [ ] Generate the first release
- [ ] Use a standard font globally
- [ ] Publishing
    - [ ] Chrome Web Store
    - [ ] Firefox Browser Addons