# Pilot status — 3 November 2026

- Deployed frontend: https://siddharthaaryan.github.io/GARUD/public/
- Synthetic demonstration: https://siddharthaaryan.github.io/GARUD/public/?demo=1
- Firebase project created: garud-10e8d, Spark plan.
- Firestore created in asia-south1 (Mumbai), initially default-deny; tested role and atomic movement rules published through Firebase Console.
- Google sign-in provider enabled. Analytics and Gemini disabled during project creation.
- One illustrative cloud ward provisioned: wards/1, enabled=true, name=General medicine · PILOT. The six demo wards remain synthetic.
- Composite history index requested: events (officerUid ASC, at DESC), collection scope.
- Ten Firestore emulator security tests passed. Deployed browser checks passed for synthetic exit, entry, directory search, profile time chart and ward map. QR generation verified in browser.
- No staff accounts approved, no real officer roster imported, and no actual Dr. Pawan account created.
- Remaining security confirmation: authorize siddharthaaryan.github.io as an OAuth redirect origin in Firebase Authentication. The exact domain is prepared in Console but has NOT been added.
- Live multi-device movement behavior has not yet been end-to-end tested; sign-in origin approval and enrollment are still required.
- Firebase Hosting was not deployed: embedded Cloud Shell returned Site Unavailable. Frontend is hosted by GitHub Pages with Firebase backend configuration.

Do not describe this pilot as production-ready or as tracking 600 real nurses. The demonstration contains 600 synthetic officers; the cloud roster is currently empty.
