# Contributing

Thanks for wanting to help. Bug reports about a PDF that comes out wrong are
the most useful contribution, and so are terms or profile fields that real
leases and applications need.

## Rules for changes

- **Nothing leaves the browser.** No analytics, no uploads, no third-party
  requests beyond loading the page's own files. A change that adds a network
  request won't be merged.
- **Every field stays optional.** A renter decides what to share, and a blank
  field stays off the PDF.
- **No scoring.** The profile describes a pet. It doesn't rate one.
- **Terms are a starting point.** New default terms should be plain, common to
  most leases and free of local legal claims. Anything that depends on where
  the property is belongs in the landlord's own edits, not the defaults.
- **Saved data is untrusted.** Anything read from local storage or a share
  link goes through `app/normalize-state.ts` before the page uses it. Keep new
  fields in there too.

## Getting set up

You need Node.js 22 or later.

```bash
npm install
npm run dev
npm run check
```

`npm run check` runs everything CI runs: the formatting check, the typecheck,
the tests, ESLint and the production build. Code follows
[@quickcasa/eslint-config](https://github.com/QuickCasa/eslint-config), and
Prettier formats everything. Run `npm run format` before committing.

For a change to a PDF, add a test in `test/pdf.test.ts` that checks the new
text is there, and look at the PDF itself in a real reader before opening the
pull request.

## Deploying

Every push to `main` that passes CI deploys the page to GitHub Pages. There's
no package to release.
