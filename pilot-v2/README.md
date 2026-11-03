# GARUD live pilot — version 2

A single-password five-ward pilot, with an immediately viewable 600-officer synthetic walkthrough. This is a proposed AIIMS Jammu prototype, not an official hospital system.

## Routes
- `/`: opens the synthetic dashboard directly. Start, pause, advance or reset the narrated movement walkthrough. Click dots or officers to interrupt and inspect time charts.
- `/qr`: password-protected administrator page. Create/name wards, edit floor labels, issue/reissue timestamped IN/OUT stickers, print posters, and rename the two test officers.
- `/scanner`: dedicated camera reader. Sign in by name or username, allow camera access once, then point at IN/OUT stickers. Each newly seen QR is submitted without confirmation; repeated video frames are suppressed. Video stays on the device.
- `/scan?ward=1&action=IN&v=1`: authenticated nurse destination encoded by a ward sticker. Sign in once, the event records automatically after sign-in.
- `/setup`: legacy link; now opens the shared-password sign-in. No setup is required.

## Live implementation
This standalone password pilot uses a server-side API and Cloudflare D1 database, separate from the earlier Firebase prototype. It does not alter existing Google accounts, Firebase roles or hospital records. The earlier Firebase implementation remains in the repository's original public/ directory.

The shared pilot password is checked server-side. Per-record password fields remain hashed; the public source does not include the shared password in plaintext. The phone remembers its session across tabs for up to eight hours; only a session hash is stored server-side. Login failures are throttled. Nurses see and write only their own movement records. Administrators see both pilot officers, manage ward labels and issue stickers. IN/OUT transactions use conditional version checks and an atomic database batch to prevent overlapping states during concurrent scans.

Data refreshes every 2.5 seconds while the dashboard is open. Offline scans fail visibly and are not silently backdated. The latest 2,000 events are loaded for the pilot; charts represent that loaded window. Static QR codes do not verify physical presence. Outside-ward time is not an absence or productivity score.

## Simple pilot sign-in
The administrator enters only the one shared pilot password—no username or setup form. On the scanner, a nurse enters their name and the same password once. An unseen name creates an officer record; the same name reuses the existing record. Use unique names for different people. The phone remembers the session for up to eight hours.

The first successful sign-in initializes any missing default wards. Existing wards, labels and logs are preserved. The shared password is validated server-side using its digest. It is a convenience gate for a demonstration, not separate proof of each person's identity. The earlier individual-password flow is no longer used.

## Development
Use the supplied Sites project lifecycle helpers to install, generate migrations, build and publish. D1 is bound as `DB`; migrations live in drizzle/. Source under app/ and lib/; the Sites Vite integration remains in place.

This prototype does not implement institutional identity, password recovery, shift attendance, correction workflow or a complete security/compliance programme. Those require an approved hospital deployment plan.

## Scanner and expanded overview update
Ward tiles open an expanded ward dialog with larger officer dots, names and entry timestamps. Any officer dot opens their personal time chart and timeline. Escape closes the officer first, then the ward. The separate scanner keeps the camera open between scans and validates same-origin ward QR URLs. Direct sticker URLs submit once after authentication, without a confirmation screen. Backend transition and sticker-version validation remain in force.
