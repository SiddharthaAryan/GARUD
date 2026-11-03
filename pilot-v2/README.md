# GARUD live pilot — version 2

A password-based five-ward / two-officer pilot, with an immediately viewable 600-officer synthetic walkthrough. This is a proposed AIIMS Jammu prototype, not an official hospital system.

## Routes
- `/`: opens the synthetic dashboard directly. Start, pause, advance or reset the narrated movement walkthrough. Click dots or officers to interrupt and inspect time charts.
- `/qr`: password-protected administrator page. Create/name wards, edit floor labels, issue/reissue timestamped IN/OUT stickers, print posters, and rename the two test officers.
- `/scan?ward=1&action=IN&v=1`: authenticated nurse destination encoded by a ward sticker. Sign in once, then confirm each event.
- `/setup?key=...`: one-time owner setup. The owner chooses three passwords: admin, nurse1 and nurse2. The one-time key is supplied privately and never committed to source; only its SHA-256 digest is present.

## Live implementation
This standalone password pilot uses a server-side API and Cloudflare D1 database, separate from the earlier Firebase prototype. It does not alter existing Google accounts, Firebase roles or hospital records. The earlier Firebase implementation remains in the repository's original public/ directory.

Passwords use PBKDF2-SHA256 with per-account salts and 100,000 iterations. Only hashes are stored. Sessions expire after eight hours; only a session hash is stored server-side. Login failures are throttled. Nurses see and write only their own movement records. Administrators see both pilot officers, manage ward labels and issue stickers. IN/OUT transactions use conditional version checks and an atomic database batch to prevent overlapping states during concurrent scans.

Data refreshes every 2.5 seconds while the dashboard is open. Offline scans fail visibly and are not silently backdated. The latest 2,000 events are loaded for the pilot; charts represent that loaded window. Static QR codes do not verify physical presence. Outside-ward time is not an absence or productivity score.

## First-time use
Open the owner's one-time setup link and choose passwords of at least 10 characters. Setup creates five named wards and two clearly labelled test-officer accounts. Sign in as admin, issue the ward stickers, then use nurse1 and nurse2 on two phones. The admin can change the officers' display names. Use test records until institutional deployment is approved.

## Development
Use the supplied Sites project lifecycle helpers to install, generate migrations, build and publish. D1 is bound as `DB`; migrations live in drizzle/. Source under app/ and lib/; the Sites Vite integration remains in place.

This prototype does not implement institutional identity, password recovery, shift attendance, correction workflow or a complete security/compliance programme. Those require an approved hospital deployment plan.
