# Scan-and-go update

Dedicated nurse scanner: https://garud-live-pilot.aryansiddhartha03.chatgpt.site/scanner

Officers can sign in by their unique display name or username and password. A phone remembers its session across tabs for up to eight hours. Passwords are not saved in browser storage. Start the camera and allow permission once; subsequent ward QR reads record IN/OUT without confirmation. Opening an issued sticker link also submits once after sign-in. Repeated camera frames are suppressed; backend duplicate, location and sticker-version checks remain enforced. Camera video is processed on the device, not uploaded.

The ward overview now opens each ward in an expanded dialog with officer names, larger dots and entry timestamps. A dot opens the individual chart/timeline; closing the officer returns to the expanded ward.

Five test groups passed: existing API/access behavior, name login, throttling, valid/malformed QR routing, and all ten generated stickers decoded with the same camera QR engine. TypeScript and production build passed. Browser checks verified ward/officer dialogs and preserved ward context.

Hardware camera operation requires a supported phone browser and permission. That physical-phone field test remains to be done; QR decoding has been tested from generated sticker images.
