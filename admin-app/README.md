# Former staff hostname

The staff dashboard now lives in the main Next.js app at `/admin`. It uses same-origin HttpOnly cookies and server-enforced roles plus TOTP verification. This folder only redirects the previous Netlify staff hostname to the current dashboard. Do not restore the former browser-to-Firestore app or put database credentials here.
