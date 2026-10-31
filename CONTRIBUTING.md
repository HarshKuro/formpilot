# Contributing to FormPilot

First off, thank you for considering contributing to **FormPilot**! 🎉  
FormPilot is built to help university students eliminate the repetitive friction of filling placement and internship application Google Forms with 1-click, privacy-first autofill.

---

## Core Guarantees & Philosophy

When contributing to FormPilot, please keep our core tenets in mind:

1. **Zero Cloud Telemetry & 100% Local Storage:** All profile data must remain on the student's machine inside `chrome.storage.local`. Under no circumstances should any network requests, analytics, or external trackers be introduced.
2. **Explicit User Control:** FormPilot **never auto-submits forms** and **never auto-checks declaration or agreement checkboxes**. Autofill must only occur when the student explicitly clicks **Accept** or triggers autofill from the popup.
3. **Conservative Stage Isolation:** Academic performance fields (10th %, 12th/Diploma %, Graduation %, and PG %) are strictly isolated and must never be cross-substituted.
4. **Shadow DOM Scoping:** Any UI injected into Google Forms must reside within an isolated Shadow DOM container to prevent styles from leaking or clashing.

---

## Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v22+
- [pnpm](https://pnpm.io/) v10+

### Installation

```bash
# Clone the repository
git clone https://github.com/HarshKuro/formpilot.git
cd formpilot/"FormPilot Extension"

# Install dependencies
pnpm install
```

### Common Commands

```bash
# Start Vite development server
pnpm dev

# Run TypeScript typechecks
pnpm typecheck

# Run full Vitest unit & integration test suite
pnpm test

# Build production extensions for Chromium and Firefox
pnpm build

# Package standalone ZIP archives
pnpm package:zip
```

---

## Loading the Extension Locally

1. Run `pnpm build` to compile the bundles.
2. In Google Chrome / Brave / Arc / Edge:
   - Navigate to `chrome://extensions` (or `brave://extensions`, `arc://extensions`).
   - Toggle **Developer mode** ON.
   - Click **Load unpacked** and select the `dist-chrome` directory.
3. In Mozilla Firefox:
   - Navigate to `about:debugging#/runtime/this-firefox`.
   - Click **Load Temporary Add-on...** and select `dist-firefox/manifest.json`.

---

## Branching & Release Workflow

FormPilot uses a structured 3-tier branch model:

```text
feature-branch ──> [ preview ] ──> [ main ] ──> [ release ]
```

1. **`preview` (Staging):**
   - Active integration branch for new features and bug fixes.
   - Every push/PR to `preview` triggers our automated CI pipeline (`preview-ci.yml`) to run typecheck, unit tests, and build verification.
2. **`main` (Production):**
   - Holds stable, release-ready code merged from `preview`.
   - Pushing to `main` automatically triggers `release.yml`.
3. **`release` (Distribution Artifacts):**
   - Automated distribution branch managed by GitHub Actions.
   - Automatically tags releases, generates release ZIP archives, and publishes a new GitHub Release with binary assets.

---

## Commit Guidelines

We adhere strictly to [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature or capability (e.g. `feat(forms): support radio option detection`)
- `fix:` A bug fix (e.g. `fix(build): bundle content script as standalone IIFE`)
- `docs:` Documentation updates (e.g. `docs(readme): add demo gif`)
- `test:` Adding or refactoring tests (e.g. `test(popup): add toolbar popup interaction tests`)
- `refactor:` Code improvements without changing external behavior
- `chore:` Dependency bumps, CI updates, or maintenance

---

## Submitting Pull Requests

1. Fork the repository and create your branch from `preview` (e.g. `git checkout -b feat/my-improvement preview`).
2. Ensure all tests and typechecks pass (`pnpm typecheck && pnpm test`).
3. Commit with concise, descriptive Conventional Commit messages.
4. Open a Pull Request targeting the `preview` branch.
5. Provide a summary of changes, motivation, and verification steps in the PR description.

---

## Reporting Issues & Feature Suggestions

- **Bug Reports:** Open an issue with reproduction steps, the Google Form structure (if public), and your browser version.
- **Feature Requests:** Open an issue describing the proposed functionality and how it benefits students while preserving privacy.

Thank you for helping make FormPilot better for students everywhere! 🚀
