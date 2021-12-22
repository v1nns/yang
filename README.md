# yang (Yet Another Notifier ~~for~~ Gerrit)

Receive update notifications from Gerrit change-ids. This is a work in progress.

Currently, it is not published in any store, but I do have the intention to publish it.

## Install

	$ npm install

## Development

WebExtension Toolbox was used to make it easier to develop a cross-browser extension.

    npm run dev chrome
    npm run dev firefox
    npm run dev opera
    npm run dev edge

## Build

    npm run build chrome
    npm run build firefox
    npm run build opera
    npm run build edge
