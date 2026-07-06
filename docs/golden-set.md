# Golden Set

_Status: DRAFT — spec for the component fixtures used to evaluate mock generation._

## Purpose

A curated, versioned set of React components where **each one deliberately stresses a
specific capability the mock-generator must handle**, with a known "correct" rendered
outcome. It is the tool's regression harness: every prompt change, model swap, or
context-collection improvement is scored against the same fixtures, so "did the mock get
better?" becomes a number instead of a vibe.

Organizing principle: **group by capability axis, not by hard/easy.** Each component earns
its place by exercising a dimension the others don't.

## Coverage matrix

| Component | Axis it stresses | Status |
|---|---|---|
| `AlbumCard` | Typed domain props (`Album`, `Track`) + callback props | exists |
| `Tooltip` | Internal state that hides UI (force-visible) + `children` | exists |
| `Dropdown` | Generic `<T,>` + `trigger: ReactNode` + keyboard/click-outside | exists |
| `Player` | Single context/provider dependency (`PlayerProvider`) | exists |
| `AsyncTrackList` (new) | Data fetch with loading / success / error states | add |
| `TrackMenuModal` (new) | Portal / modal (`createPortal`, renders outside subtree) | add |
| `NowPlayingBar` (new) | Multiple / nested contexts (theme + player) | add |
| `CreatePlaylistForm` (new) | Controlled form + validation + disabled-until-valid | add |

Total: 8 fixtures — small enough to run on every change, broad enough to catch
regressions across every axis the tool claims to support.

## Axes and why they are hard

- **Typed props + callbacks** — can the tool fabricate realistic nested data and no-op callbacks?
- **Hidden state / force-visible** — flagship "reach a hard-to-reach state" case (tooltip always open).
- **Generics + ReactNode props** — generic type params and JSX-valued props resist naive mocking.
- **Single context/provider** — renders nothing useful unless wrapped in its provider; tests provider detection.
- **Async loading/success/error** — biggest currently-missing axis; tests forcing each of three states.
- **Portals / modals** — content renders outside the component subtree and breaks naive isolation renders.
- **Multiple / nested contexts** — tests provider-graph resolution, not just a single provider.
- **Controlled forms + validation** — controlled inputs, error states, disabled submit.

## Scoring model (proposed)

Each fixture gets a sibling metadata file, e.g. `AlbumCard.golden.ts`, declaring:

- `targetStates`: the states the tool should be able to force (e.g. `loading`, `error`, `tooltip-open`).
- `assertions`: per state, a lightweight text/selector that must appear when the state is forced.

The extension's generate -> validate loop checks the rendered preview against these
expectations, turning the golden set into an automated eval rather than just example code.

## Open questions

- Where do fixtures live: in `vite-app/src/components` alongside real code, or a dedicated `fixtures/` dir?
- Do golden metadata files ship in the app bundle, or stay dev-only?
- How to score "close but not exact" renders (partial credit vs pass/fail)?
