# Current pilot status — 3 November 2026

Version 2 is deployed at https://garud-live-pilot.aryansiddhartha03.chatgpt.site. GitHub Pages entrypoints redirect to this viewable version.

- Synthetic walkthrough: 600 sample officers, five wards, eight narrated steps, pause/next/reset, map counts, personal time charts, directory and movement log.
- Live pilot: server API and D1 storage; separate from the earlier Firebase project. First-time password setup creates admin, nurse1, nurse2 and five wards. User chooses passwords; no passwords or raw setup key are in source.
- QR generator: separate /qr route, admin-only ward creation/naming, sticker generation timestamp/version, printable IN/OUT posters; reissue invalidates old codes.
- API tests passed for setup, login, role separation, two nurses, valid IN/OUT, duplicate and wrong-ward rejection, stale stickers, record isolation, timestamped ward creation, logout and login throttling.
- Production build and TypeScript checks passed. Published walkthrough start/pause/next behavior verified in browser.
- Production live scan recording remains awaiting the owner's first-time password setup. No live staff accounts/passwords have been initialized yet; the production database contains schema only.

Earlier Firebase setup remains separate: Google sign-in/domain and Firestore rules/index were configured, but no roles were assigned. Its account-approval gate is not used by version 2.
