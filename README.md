# FormPilot

> **Your forms. Your profile. One click.**  
> A privacy-first student profile autofill browser extension built for university placements and internship applications on Google Forms.

**Developer:** Harsh Partap Jain  
- **GitHub:** [HarshKuro](https://github.com/HarshKuro)  
- **Instagram:** [@brainrotharsh](https://instagram.com/brainrotharsh)  

---

## Overview

Applying for college campus placements and internships requires filling the same personal, academic, and contact details hundreds of times on Google Forms.

**FormPilot** lets students create a comprehensive academic and personal profile once. When you open a supported Google Form, FormPilot securely detects matching fields and offers a small, non-intrusive autofill prompt. You review and click **Accept**, and only high-confidence profile fields are filled. Manual questions and consent checkboxes remain untouched for you to answer manually.

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

## Installation & Setup

### Prerequisites

- Node.js (v18+)
- pnpm (or npm)

### 1. Build the Extension

```bash
# Install dependencies
pnpm install

# Run full test suite (62 unit & integration tests)
pnpm test

# Build packages for Chrome, Edge, and Firefox
pnpm build
```

This generates:
- `dist-chrome/` (Manifest V3 for Google Chrome & Microsoft Edge)
- `dist-firefox/` (Manifest V3 for Mozilla Firefox)

---

## Loading Unpacked in Browsers

### Google Chrome & Microsoft Edge

1. Open Chrome and navigate to `chrome://extensions` (or `edge://extensions` in Edge).
2. Toggle on **Developer mode** in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `FormPilot Extension/dist-chrome` directory.
5. FormPilot is now active! The options page will open automatically on initial install for profile setup.

### Mozilla Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**
3. Select `FormPilot Extension/dist-firefox/manifest.json`.
4. FormPilot is now installed in Firefox.

---

## Verified Real-World Form Compatibility

FormPilot has been tested and verified against actual placement Google Forms, including:
- `https://docs.google.com/forms/d/e/1FAIpQLSdnJWq-yXoCrlPTB47t4-Aw_zeGKFXeub3z4hhx23EjOmhd2w/viewform`

Verified Results:
- **19/19** supported student questions matched and autofilled accurately.
- **4/4** manual and declaration fields (Resume link, Position Applying For, Location Preference, Important Message / Consent) strictly preserved for manual completion.

---

## Development & Testing Commands

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# TypeScript typechecking
pnpm typecheck

# Build for Chrome/Edge only
pnpm build:chrome

# Build for Firefox only
pnpm build:firefox
```

---

## License

MIT License. Developed with care by Harsh Partap Jain.
