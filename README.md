# Playwright Practice

This repository contains a Playwright automation project focused on learning and practicing browser-based test automation using the Playwright framework. The tests interact with the public PlaywrightLab demo site and cover common UI behaviors such as navigation, login flow, theme switching, cookie banner handling, and menu interactions.

## Tech Stack

- Playwright
- TypeScript
- Node.js

## Project Structure

```bash
.
├── tests/
│   ├── example.spec.ts
│   └── playwrightlab_navBar_Header1.spec.ts
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── playwright-report/
├── test-results/
└── README.md
```

## Features Covered

- Page navigation and URL validation
- Cookie banner dismissal
- Navbar and menu dropdown interactions
- Login and logout flows
- Theme toggle testing
- Basic assertions and UI validation with Playwright

## Prerequisites

Make sure you have the following installed:

- Node.js (v18 or later recommended)
- npm

## Installation

```bash
npm install
```

## Run the Tests

You can run Playwright tests using the npm scripts defined in `package.json`.

### Run all tests

```bash
npx playwright test
```

### Run project-specific scripts

```bash
npm run test:sprint1
npm run test:api
npm run test:web
npm run test:master
npm run test:sanity
npm run test:regression
npm run test:e2e
npm run test:datadriven
```

### Run headed mode for sanity tests

```bash
npm run test:master:headed
```

### Debug a test

```bash
npm run test:sanity:debug
```

## Configuration

The Playwright setup is defined in `playwright.config.ts` and includes:

- test directory: `./tests`
- HTML reporter enabled
- Chromium project configured
- trace collection on first retry
- video recording enabled
- headless mode disabled in local config

## Notes

This project is intended as a practice repository for learning Playwright concepts and writing browser automation scripts in TypeScript. It is set up for local experimentation and UI test learning.

## Useful Commands

```bash
npx playwright test --headed
npx playwright test --reporter=line
npx playwright show-report
```

## References

- https://playwright.dev/
- https://playwright.dev/docs/intro
