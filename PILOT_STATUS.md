# Pilot status — 3 November 2026

- Frontend: https://siddharthaaryan.github.io/GARUD/public/
- Synthetic demo: https://siddharthaaryan.github.io/GARUD/public/?demo=1
- Firebase project garud-10e8d uses the Spark plan. Firestore is in asia-south1 (Mumbai).
- Tested role-based, atomic movement rules are published. Ten emulator security tests passed.
- Google sign-in enabled; siddharthaaryan.github.io authorized after explicit user approval.
- Google sign-in successfully completed with the selected project-owner account. GARUD displayed the expected awaiting-approval state and submitted an enrollment request.
- Composite index events(officerUid ASC, at DESC), collection scope: creation succeeded.
- One illustrative cloud ward exists: wards/1, enabled=true, name=General medicine · PILOT.
- The deployed synthetic demo was tested for entry/exit, name/ID search, officer charts, map and QR generation.
- No staff roles approved, no real staff roster imported, no Dr. Pawan account created. The cloud roster is empty.
- Automatic approval review rejected saving a pilot role for the selected Google account because role assignment was not explicitly authorized. No role was saved. Explicit approval to grant the named account an administrator role is pending.
- Cloud movement is not yet end-to-end verified; an explicitly approved pilot account is required.
- Firebase Hosting was not deployed because embedded Cloud Shell returned Site Unavailable. GitHub Pages hosts the frontend.

This is a pilot, not production-ready tracking of 600 real nurses. The demo contains 600 synthetic officers. No patient data is required.
