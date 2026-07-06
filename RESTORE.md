# Restore Instructions

On **2026-07-06** `main` was hard-reset from commit `1298131` ("feat: sure")
back to the prior commit `c5ea402` ("feat: initial work") to fully revert.

Everything from before the revert was preserved:

- **`backup-1298131-sure`** (branch) — pins the reverted commit `1298131`.
- **`stash@{0}`** — the untracked files that were in the working tree at revert
  time (target components + theme context), e.g.:
  - `vite-app/src/components/AsyncTrackList/`
  - `vite-app/src/components/CreatePlaylistForm/`
  - `vite-app/src/components/NowPlayingBar/`
  - `vite-app/src/components/TrackMenuModal/`
  - `vite-app/src/contexts/ThemeContext.ts`
  - `vite-app/src/contexts/ThemeProvider.tsx`
  - `vite-app/src/hooks/useThemeContext.ts`

## Current state

```
main                -> c5ea402  feat: initial work   (HEAD)
backup-1298131-sure -> 1298131  feat: sure
stash@{0}           -> untracked files (pre-revert 20260706-142254)
```

## How to restore

### Restore the stashed untracked files (keep current commit)
```sh
git stash pop            # applies and drops the stash
# or, to keep the stash around:
git stash apply
```

### Get the reverted "feat: sure" commit back
```sh
# Option A: move main back onto it (destructive to current main pointer)
git reset --hard backup-1298131-sure

# Option B: just look at it without moving main
git checkout backup-1298131-sure
```

### Full restore (commit + working files) to the pre-revert state
```sh
git reset --hard backup-1298131-sure
git stash pop
```

## Inspecting before you restore
```sh
git stash list                       # see the stash
git stash show -p stash@{0}          # view stashed file contents
git log --oneline backup-1298131-sure -1
```

> Note: even if the backup branch or stash is deleted, the commit is still
> recoverable via `git reflog` for a while.
