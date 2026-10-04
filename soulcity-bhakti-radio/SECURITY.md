# Security Notes

## Never commit secrets

Never commit:

- `.env`
- `.env.local`
- Gemini API keys
- YouTube Data API keys
- Firebase Admin service-account JSON files
- OAuth client secrets
- private keys or certificates
- access/refresh tokens

The repository must contain placeholders only.

## Firebase browser configuration

`firebase-applet-config.json` contains the Firebase web application configuration.

Firebase documents that Firebase service API keys are public identifiers for the Firebase project/app and are not the mechanism used to authorize Firestore data access. Security Rules, Authentication and App Check are the relevant controls.

However, privileged non-Firebase API keys must remain secret and server-side.

## Admin authorization

The administrator route must be protected server-side.

Do not rely on:

- hidden buttons
- hidden routes
- localStorage flags
- URL parameters
- client-side `isAdmin` variables

The server must verify the authenticated user before allowing privileged operations.

## Firestore

Recommended public access model:

- public users may read approved tracks
- public users may create pending song suggestions
- public users may not modify official tracks
- public users may not list all song submissions
- only authorized admins may approve/reject submissions
- only authorized admins may manage Navratri configuration and official playlists

Do not use unrestricted rules such as:

```text
allow read, write: if true;
```

## YouTube

Use the official YouTube Data API and IFrame Player API where required.

Do not:

- scrape YouTube pages
- download videos
- extract audio
- proxy or re-host YouTube audio
- convert YouTube content into MP3

## Pre-publish checklist

Before making the repository public:

- [ ] Search the repository for API keys and tokens
- [ ] Confirm `.env` is ignored
- [ ] Remove any hard-coded admin credentials/identity values from source
- [ ] Remove any hard-coded secret fallback values from server code
- [ ] Verify `/admin` authorization
- [ ] Verify Firestore rules
- [ ] Verify the public app cannot invoke admin playlist import
- [ ] Verify the public app cannot modify official tracks
- [ ] Verify the official library is backed by Firestore
- [ ] Verify YouTube/Gemini secrets are server-side only
