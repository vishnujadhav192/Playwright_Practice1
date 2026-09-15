# Playwright Practice

This repository contains a Playwright + TypeScript automation project for learning and practicing browser UI testing against the public PlaywrightLab demo site.

The suite covers common front-end flows such as navigation, forms, validation, login/logout, menu interactions, theme switching, and cookie banner handling.

## Tech Stack

- Playwright
- TypeScript
- Node.js
- HTML reporter

## Project Structure

```bash
.
├── tests/
│   ├── 01_FormElements_AutoSuggestion.spec.ts
│   ├── 01_FormElements_File_Upload.spec.ts
│   ├── 01_FormElements_Registration Form.spec.ts
│   ├── 01_FormElements_Sliders_Range.spec.ts
│   ├── example.spec.ts
│   └── playwrightlab_navBar_Header1.spec.ts
├── FilesForUploads/
├── playwright-report/
├── test-results/
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── README.md
└── .gitignore
```

## Included Practice Scenarios

- Page title and navigation checks
- Cookie banner dismissal
- Navbar and dropdown menu validation
- Login flow and logout flow
- Theme toggle (day/night)
- Registration form validation
- Email and full name validation checks
- File upload, slider and auto-suggestion examples

## Prerequisites

Make sure the following are installed:

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Run Tests

### Run all tests

```bash
npx playwright test
```

### Run in headed mode

```bash
npx playwright test --headed
```

### Run a specific file

```bash
npx playwright test tests/playwrightlab_navBar_Header1.spec.ts
```

### Open the HTML report

```bash
npx playwright show-report
```

## NPM Scripts

This project includes the following scripts:

```bash
npm run test:sprint1
npm run test:api
npm run test:web
npm run test:master
npm run test:sanity
npm run test:regression
npm run test:e2e
npm run test:datadriven
npm run test:master:headed
npm run test:sanity:debug
```

## Configuration Highlights

The test configuration in `playwright.config.ts` includes:

- test directory: `./tests`
- HTML reporter enabled
- Chromium project configured
- trace captured on first retry
- local execution with `headless: false`
- slow motion enabled via `launchOptions.slowMo`

## Notes

This project is intended for learning Playwright automation, writing robust selectors, asserting UI states, and practicing end-to-end browser testing in a real web app.

## Useful References

- https://playwright.dev/
- https://playwright.dev/docs/intro
- https://playwright.dev/docs/test-api
