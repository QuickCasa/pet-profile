# Pet Profile

[![CI](https://github.com/QuickCasa/pet-profile/actions/workflows/ci.yml/badge.svg)](https://github.com/QuickCasa/pet-profile/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A free, open source pet profile and pet addendum generator. Renters make a pet
profile PDF to send with a rental application, and landlords turn it into a
pet addendum for the lease. There's no account and no fee, and nothing anyone
enters leaves their browser.

**[Make a pet profile](https://quickcasa.github.io/pet-profile/)**

## What it does

- **Pet profile PDF.** Photo, breed, colour, sex, age, weight, microchip and
  licence numbers, vaccines, vet, temperament and the owner's own notes for
  each pet, plus an emergency contact, references and renter's insurance.
  Every field is optional, and blank ones stay off the PDF.
- **Share link.** The renter can copy a link that opens the page with their
  profile filled in, so the landlord doesn't retype it. The profile travels in
  the part of the URL after the `#`, which browsers never send to a server.
  Photos are left out to keep links short.
- **Pet addendum PDF.** The landlord adds the lease details, any charges and
  the terms. The page starts with seven plain terms that can be edited,
  removed or added to. The PDF lists the pets, the charges and the terms,
  with a signature and date line for the landlord and each tenant.
- **Service and support animals.** A pet marked as one gets a line in the
  addendum saying no deposit, fee or pet rent applies to it. When every pet is
  marked, the charges are switched off.

## Before anyone signs

The addendum is a starting point, not legal advice. Rules on pets, pet
deposits and pet fees differ by province, state and city, and some places
don't allow pet deposits or fees at all. Check the final version against your
local rules before anyone signs it.

## Privacy

- The page has no server side, no analytics and no account. It's static files
  on GitHub Pages.
- The form is saved in the browser's local storage so it's there on the next
  visit. **Start over** clears it.
- Photos are scaled down to 800 pixels on the device before they're saved or
  added to a PDF.
- PDFs are built in the browser by [jsPDF](https://github.com/parallax/jsPDF),
  which loads the first time someone downloads one.

## Known limits

- The PDFs use the fonts built into every PDF reader, which cover Western
  European alphabets only. Other characters, including emoji, print as `?`.
- Pages are US Letter size, the standard in Canada and the US.
- A share link with many pets and long notes can be too long for
  some messaging apps. Sending the PDF always works.

## Development

You need Node.js 22 or later.

```bash
npm install
npm run dev       # serves the page with live reload
npm run check     # format, typecheck, tests, lint and build
```

The page is plain TypeScript with no framework, in `app/`. The PDF layouts are
in `app/pdf/`. Tests run in Node and build real PDFs with jsPDF, then check the
text in them.

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Licence

[MIT](LICENSE). Built and maintained by [QuickCasa](https://quickcasa.ai) in
Kitchener, Ontario.
