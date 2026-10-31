# FormPilot

> **Your forms. Your profile. One click.**  
> A privacy-first student profile autofill browser extension built for university placements and internship applications on Google Forms.

**Developer:** Harsh Partap Jain  
- **GitHub:** [HarshKuro](https://github.com/HarshKuro)  
- **Instagram:** [@brainrotharsh](https://instagram.com/brainrotharsh)  

---

## Overview

Applying for college campus placements and internships requires filling the same personal, academic, and contact details hundreds of times on Google Forms.

**FormPilot** lets students create a comprehensive academic and personal profile once.

### Two Ways to Autofill:
1. **Automatic In-Page Floating Prompt:**
   - Open any Google Form. FormPilot automatically detects matching questions and displays a discreet floating prompt in the bottom-right corner.
   - Shows exact breakdown: e.g. "18 fields ready, 4 manual questions".
   - Review and click **Autofill Fields** to populate answers instantly.
   - If you haven't configured a profile yet, FormPilot displays an onboarding reminder to set up your profile with one click.
2. **One-Click Extension Toolbar Popup:**
   - Click the FormPilot icon in your browser toolbar at any time.
   - Click **"⚡ Autofill Current Form"** to fill all matching fields immediately.
   - Or click **"Open In-Page Prompt"** to bring up the interactive modal on the page.

---

## Supported Browsers

FormPilot targets two primary distribution bundles:

1. **Chromium Engine Package (`dist-chrome` / `formpilot-chrome-v*.zip`):**
   - **Google Chrome**
   - **Brave Browser**
   - **Arc Browser**
   - **Microsoft Edge**
   - **Opera & Opera GX**
   - **Vivaldi**
   *(All modern Chromium-based browsers share the Manifest V3 WebExtensions runtime and are 100% supported).*

2. **Gecko Package (`dist-firefox` / `formpilot-firefox-v*.zip`):**
   - **Mozilla Firefox**

---

## Privacy & Safety First

- **100% Local Storage:** All student data stays on your device inside `chrome.storage.local`. Zero cloud servers, zero analytics, zero external network requests.
- **Explicit Student Control:** No forms are ever submitted automatically. No data is filled without your explicit **Accept** action.
- **Manual-Only Safeguards:** Resume links, job role preferences, location preferences, and agreement/consent checkboxes are **strictly excluded** from autofill.
- **Academic Stage Isolation:** 10th %, 12th/Diploma %, Graduation %, and PG % are treated as distinct stages and will never be confused or substituted for one another.
- **Shadow DOM Isolation:** The in-page prompt is rendered inside an isolated Shadow DOM container so Google Forms styling never breaks the extension UI and vice-versa.

---

## Profile Data Model (18 Canonical Fields)

1. **Personal Details:**
   - UID / Registration Number
   - Full Name
   - Date of Birth
   - Age in Years (derived automatically from DOB)
   - Gender (`Male` / `Female`)
   - College / University Name

2. **Degree & Batch:**
   - Current Course (`B.E.`, `B.E.+M.E. (Integrated)`, `B.E. Later Entry`)
   - Current Stream (`BDA`, `AIML`, `CC`, `IoT`, `GG`, `CSBS`, `IS`, `Blockchain`, `Devops`, `AIDataSci`)
   - Passing Out Batch (`2025`, `2026`, `2027`, `2028`, `2029`)

3. **Academic Performance:**
   - Xth Percentage (%)
   - Best in XIIth and Diploma Percentage (%)
   - Graduation Percentage (%)
   - Post-Graduation Percentage (%)
   - Current Course Backlogs
   - Current CGPA
   - Gap / Break in Education (Months)

4. **Contact Information:**
   - Permanent Address
   - Mobile Number
   - Email ID

---

## Installation Guide for Chromium Browsers (Brave, Arc, Chrome, Edge)

Because Brave, Arc, Edge, Opera, and Vivaldi are powered by Google Chromium, the Chrome package works seamlessly across all of them.

### Step 1: Download or Build the Package
- **From Release:** Download `formpilot-chrome-v1.0.0.zip` from the `release` branch or GitHub Releases and extract it.
- **From Source:**
  ```bash
  pnpm install
  pnpm build
  # Or generate the zips directly
  pnpm package:zip
  ```

### Step 2: Load into Your Browser

#### 🦁 Brave Browser
1. Open Brave and go to `brave://extensions`.
2. Toggle ON **Developer mode** in the top right.
3. Click **Load unpacked** in the top left.
4. Select the extracted `dist-chrome` folder.
*(Note: FormPilot runs completely offline on your device, so Brave Shields will not block or interfere with its local operation).*

#### 🌀 Arc Browser
1. Open Arc and hit `Cmd + T` (Mac) or `Ctrl + T` (Windows).
2. Type `arc://extensions` (or `chrome://extensions`) and hit Enter.
3. Toggle ON **Developer mode** in the top right.
4. Click **Load unpacked** and select the `dist-chrome` folder.
5. You can pin FormPilot to your Arc toolbar from the extensions menu.

#### 🌐 Google Chrome
1. Navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and choose `dist-chrome`.

#### 🌊 Microsoft Edge
1. Navigate to `edge://extensions`.
2. Turn on **Developer mode** in the left sidebar.
3. Click **Load unpacked** and choose `dist-chrome`.

#### 🔴 Opera & Vivaldi
1. Navigate to `opera://extensions` or `vivaldi://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and choose `dist-chrome`.

---

## Installation Guide for Mozilla Firefox

1. Download or build `dist-firefox` (or extract `formpilot-firefox-v1.0.0.zip`).
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**
4. Select the `manifest.json` file inside the `dist-firefox` folder.

---

## Branching & Release Pipeline (`preview` -> `main` -> `release`)

FormPilot uses a structured 3-tier release automation flow managed with GitHub Actions:

```text
[ Feature / PR ] ──> [ preview ] ──> [ main ] ──> [ release ]
                          │              │              │
                     Preview CI      Merge Gate    Auto-Build & Release
                     (Tests/Build)  (Integration)  (Zips & GitHub Release)
```

1. **`preview` (Staging & Verification):**
   - Active development branch.
   - Pushing to `preview` triggers `preview-ci.yml`, which runs TypeScript typecheck, the full 67-test Vitest suite, and builds both extensions.
2. **`main` (Production Source):**
   - Holds stable, tested code merged from `preview`.
   - Pushing/merging to `main` triggers `release.yml`.
3. **`release` (Distribution Artifacts):**
   - Fully automated branch.
   - GitHub Actions automatically checks out `main`, compiles Chrome and Firefox builds, zips them into `releases/formpilot-chrome-v*.zip` and `releases/formpilot-firefox-v*.zip`, commits them to `release`, and attaches them to a new GitHub Release with automatic version tags.

---

## Development & Test Commands

```bash
# Run unit & integration tests
pnpm test

# TypeScript typechecking
pnpm typecheck

# Build both Chromium & Firefox distributions
pnpm build

# Package standalone ZIP archives
pnpm package:zip
```

---

## License

MIT License. Developed with care by Harsh Partap Jain.
