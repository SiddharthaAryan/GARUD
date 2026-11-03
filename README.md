# GARUD — Nursing Workforce Pilot

## Working version 2

- Dashboard and walkthrough: https://garud-live-pilot.aryansiddhartha03.chatgpt.site
- Administrator QR generator: https://garud-live-pilot.aryansiddhartha03.chatgpt.site/qr
- Live officer scan desk: https://garud-live-pilot.aryansiddhartha03.chatgpt.site/scan
- Full source and documentation: [pilot-v2/](pilot-v2/README.md)

Version 2 opens directly into a viewable synthetic demonstration with 600 sample officers, five wards, a narrated pauseable walkthrough and changing officer time charts. The live pilot is separate and uses server-side password accounts and a D1 database. The owner receives a private one-time setup link to choose the admin, nurse1 and nurse2 passwords. That raw setup key is never committed.

Administrators can create/name wards, edit floor labels, issue and reissue IN/OUT stickers with server timestamps, print QR posters and rename the two pilot officers. Real scans update the shared live dashboard about every 2.5 seconds. Live data requires password sign-in; the synthetic walkthrough never changes it.

Type checks, production build, isolated API integration/security tests and published walkthrough controls were verified. Live production passwords are intentionally not pre-set: the owner chooses them through the setup page.

The initial Firebase source remains under public/ and its rules/configuration remain at repository root as historical implementation. The earlier Google-account approval flow is superseded for this standalone password pilot. No existing Google account roles were changed.

This is a proposed AIIMS Jammu pilot, not an official hospital system. Use test records pending institutional approval. QR events show last recorded location, not continuous tracking or proven physical presence. Outside-ward time is not proof of travel or absence.
