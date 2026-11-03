# Simplified prototype sign-in

The live prototype now uses one shared password selected by the owner. Its digest is checked server-side; no username or one-time setup is needed for the admin dashboard or QR generator. A nurse enters their name and that same password once on /scanner. The name identifies their movement record; an unseen name creates a record and a repeated unique name reuses it. Existing ward names and logs are preserved. Sessions remain valid for up to eight hours.

This is a shared-access demonstration model, not individually verified staff identity. The password is not printed in this public repository.

API tests cover password-only administration, automatic initialization, first-name enrollment, repeat-name reuse, login rejection/throttling and existing movement/QR checks.
