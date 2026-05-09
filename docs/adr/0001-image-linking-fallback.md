# Image linking — onerror fallback to Google Image Search

Inventory items (materials) display icons hosted on a third-party GitHub assets repo (`ww-assets`). Rather than self-hosting images or bundling them, we defer to the remote URL and handle failures client-side: if the `<img>` fires `onerror` (or the icon URL is null), we render a deterministic initials avatar with a color derived from the item's internal key (DJB2 hash → HSL hue). The avatar is wrapped in a link that opens a Google Image Search for `"{item label} Wuthering Waves"` in a new tab.

This approach avoids any image hosting infrastructure, keeps the app SPA-only (no SSR concern), and costs nothing to operate. The trade-off is reliance on an external repo's availability and the quality of Google Image Search results — acceptable for a personal planner tool with no SLA.

Considered option: bundle icons as base64 in the JSON data files (rejected — bloats the data files, requires manual updates when new items are added).

Consequences: characters and weapons use the same `ww-assets` source and may adopt the same pattern later; the composable (`useImageFallback`) is designed to be reusable when that happens.
