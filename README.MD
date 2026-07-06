# Component Preview Project

## Overview

Your task is to make a tool that allows you to live preview react components inside your IDE. To do this you will use AI to mock properties of these components as needed to render them in isolation.

## Benefits

This feature lets users iterate on UI polish and behavior faster than testing with a full website on a standard hot-reloading dev server. This provides a more focused testing experience, but also has other benefits.

For example, if a tooltip component is annoying to iterate on because it needs to be hovered, the mock can make it always visible. Or if a toast popup is annoying to trigger manually, it can always show to be iterated on. There could be many more benefits depending on your approach to building this tool.

## Project Structure

This project contains a vscode extension (vscode-extension) and an example react app (vite-app).

### Extension

To run the extension, run `npm run compile` in vscode-extension and press f5. This will launch a new ide window where you should open the project you will use your tool on (in this case, vite-app).

### Vite App

You can run the vite app with `npm run dev` in vite-app to preview how it looks. Its a very rough vibe coded spotify clone, which your new tool would help you polish. There is also starter code for the extension, which contains a simple system that performs this task.

## Your Development

Plan ahead and decide what experience you want to provide to the user before getting started. You should talk over your plan with your interviewer before coding.

Reasoning about the changes you make will be more important than the changes themselves, so be ready to talk through your decisions.

Some components that might be good to test on, in order of approximate increasing difficulty:
1. `vite-app/src/components/Album/AlbumCard.tsx`
2. `vite-app/src/components/Tooltip/Tooltip.tsx`
3. `vite-app/src/components/Dropdown/Dropdown.tsx`
4. `vite-app/src/components/Player/Player.tsx`

Some potential ideas to get you started:
- allow giving feedback and iteratively improve mocks
- how to cache or optimistically generate mocks
- how to improve context collection
- how to show mocks in a cool way (maybe inline)
- how to more generally piggyback on the user's build system (e.g., if `dev-server-cli` wasn't provided, how would you do this)

## `dev-server-cli.js` Notes

To simplify for the project, you can assume that you can run a dev server for a target project by running  `node dev-server-cli.js --entry path/to/mock.tsx --port <port>` in the root. It renders the default export of the provided .tsx file, which should be a react component, on the provided port. 

Feel free to change this script as needed.

For the simple implementation, the vite app includes a script to spin up dev servers with hot reload dynamically. This is only for the sake of the interview and in the real world your tool would have to figure out how to connect to the target project's build system.
