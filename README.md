# GARUD — AIIMS Jammu nursing workforce pilot

An institution-inspired white, navy and red interface for ward QR movements. This is a proposed pilot, not an official AIIMS service.

## Screens
- Admin: ward map, clickable officer dots, directory filters, movement log, CSV export, individual time-distribution charts.
- Nurse: approved Google sign-in and own entry/exit scanning screen.
- Ward QR posters: printable entry/exit links for every configured ward.
- `?demo=1`: 600 synthetic officers in browser-local demonstration mode, isolated from cloud data.

## Cloud architecture
Firebase Authentication (Google) identifies the officer; the QR URL supplies ward and action. A Firestore transaction writes an immutable event and paired current state. Rules require the authenticated officer, active enrollment, enabled ward, server time, correct preceding event and valid entry/exit transition. Rules deny anonymous access, self-assigned admin roles, event changes and direct roster edits. Approved admins can read the roster; nurses can read only their own staff records and events.

This implementation uses Firestore rules and atomic client transactions rather than a billable Cloud Function. Ten emulator security tests cover core access and movement constraints. App Check, rate controls, monitoring, hospital identity integration and independent security review remain production hardening work.

## Deployment
Project: `garud-10e8d`; Firestore region: Mumbai (`asia-south1`). Firebase web identifiers in `public/firebase-config.js` are public app configuration, not administrative credentials.

Use `npm ci` then `npm run test:rules`. With an authorized Firebase CLI, `npm run deploy` publishes hosting, rules and index definitions. Alternatively, run `python3 scripts/deploy-cloud.py` in the owner's authorized Cloud Shell. Its access token stays in process memory and is never written or printed. No service-account file belongs in this public repository.

## Enrollment
The app submits a private enrollment request after Google sign-in. A trusted project operator approves it using Firebase Console or an audited server-side enrollment tool:
1. `roles/{authUid}`: `{ "role": "admin" }` for an approved administrator, or `{"role":"nurse"}` for an officer.
2. For nurses, `officers/{authUid}`: `{ "uid": "authUid", "employeeId": "NO0001", "name": "Approved name", "active": true }`.
3. Real ward definitions replace the six illustrative wards after verification. Ward IDs are positive integers; fields: name, floor (0/1 for this prototype), enabled.

Do not fabricate a Dr. Pawan account or enroll real nurses without their approved identity mapping. The dashboard greeting is a presentation label; it does not grant access or imply that he has signed in.

## Measurement limits
QR events are last recorded locations, not continuous tracking or proof of physical presence. Static codes can be photographed. Outside-ward time is not proven travel or absence. No-scan is unknown, not off-duty. The cloud view currently loads the latest 1,000 events and computes charts from that loaded window, not a complete attendance shift. Forgotten exits require an explicit correction process; the cloud pilot rejects entering another ward before an exit. Offline scans are rejected with a clear message; no silent backdating or fabricated live state.

## Operational next steps
Two-ward pilot, actual ward/roster validation, staff briefing, correction workflow, shift scheduling, coverage thresholds, retention/export policy, access audit, backup plan and network-loss drills. No patient information is required.
