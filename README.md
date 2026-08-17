# Consent-Based GPS Prank Page + Firebase Dashboard

This project intentionally requires the person opening the page to grant browser location permission.

## 1. Create Firebase project

Create a Firebase project and register a Web App.

Enable:

- Authentication → Sign-in method → Anonymous
- Authentication → Sign-in method → Email/Password
- Realtime Database

Firebase documentation:
https://firebase.google.com/docs/web/setup
https://firebase.google.com/docs/database/web/start

## 2. Add your Firebase config

Copy the Firebase Web App config into both:

- `app.js`
- `dashboard.js`

Replace every `YOUR_...` value.

## 3. Create dashboard account

In Firebase Authentication, create an Email/Password user. Use that account only for the dashboard.

## 4. Apply database rules

Open Realtime Database → Rules and paste the contents of `firebase-rules.json`.

The public page authenticates anonymously and can only write its own location record. The dashboard requires an authenticated email account to read locations.

## 5. Run locally

Because browser geolocation normally requires a secure context, use HTTPS when deployed.

For GitHub Pages:

1. Create a GitHub repository.
2. Upload the files.
3. Enable GitHub Pages.
4. Open the generated HTTPS URL.

The share page can be sent as:

`https://YOUR-GITHUB-PAGES-URL/?id=friend1`

The `id` is stored as a session label.

## 6. Dashboard

Open:

`https://YOUR-GITHUB-PAGES-URL/dashboard.html`

Sign in using your Firebase email/password account.

The dashboard automatically displays the latest voluntarily shared location on a Leaflet/OpenStreetMap map.

## Important

Do not remove the permission explanation or attempt to bypass browser location permission. A browser will not expose precise GPS coordinates to a normal webpage when the user refuses location access.
