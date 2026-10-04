# SoulCity Bhakti Radio 🪔

A devotional radio experience designed for GTA RP communities.

SoulCity Bhakti Radio brings together Aarti, Bhajan, Mantra, Chalisa and Stotram content in a temple-inspired radio interface. The app supports daily devotional programming, Navratri themes, YouTube playback through the official YouTube IFrame Player API, direct audio URLs, community song suggestions and a private administration area.

> This is a community/fan project. Media remains hosted by its respective providers; the application does not download, scrape or extract audio from YouTube.

## Live Demo

**Production:** `https://YOUR-LIVE-DOMAIN-HERE`

## Features

- 🪔 Immersive temple-inspired landing experience with curtain entrance
- 📻 Daily Bhakti section with weekday-based devotional focus
- 🎵 Aarti, Bhajan, Mantra, Chalisa and Stotram categories
- ▶️ Direct MP3/audio URL playback
- ▶️ YouTube playback using the official YouTube IFrame Player API
- 🔎 Search and devotional filtering by title, deity, source and category
- 📋 Playlists and devotional repository
- 🌺 Dedicated Navratri experience with day-based Devi, theme colour and content
- 💡 Community "Suggest a Song" workflow for admin review
- 🔐 Protected administrator area for content curation
- 🤖 Admin-only YouTube playlist import and AI-assisted metadata classification
- ☁️ Firebase Firestore for the shared official music library
- 🔑 Server-side handling for privileged YouTube/Gemini API credentials

## Product Model

The application separates community participation from official curation:

```text
Public visitor
    ↓
Listen / Search / Playlists
    ↓
Suggest a Song
    ↓
Pending submission
    ↓
Admin review
    ↓
Approve / Edit / Reject
    ↓
Official library
```

Administrative playlist import follows a separate protected flow:

```text
Admin login
    ↓
YouTube playlist URL
    ↓
Server-side YouTube Data API
    ↓
Gemini classification
    ↓
Admin review
    ↓
Firestore
    ↓
Official library
```

## Architecture

```text
React + TypeScript + Vite
            │
            ├── Temple UI / Player
            │
            ├── Firebase Authentication
            │
            └── Firestore
                    │
                    ├── tracks
                    ├── songSubmissions
                    ├── navratriSettings
                    └── admins

Express server
      │
      ├── Admin verification
      ├── YouTube Data API
      └── Gemini API
```

### Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Express
- Firebase Authentication
- Firebase Firestore
- Google Gemini API
- YouTube Data API
- YouTube IFrame Player API
- Lucide React
- Motion

## Project Structure

```text
soulcity-bhakti-radio/
├── public/
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   ├── data/
│   ├── lib/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── types.ts
├── firestore.rules
├── firebase.json
├── .firebaserc
├── firebase-applet-config.json
├── server.ts
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── .env.example
├── .gitignore
├── SECURITY.md
└── README.md
```

## Local Development

### Prerequisites

- Node.js 20+ recommended
- A Firebase project configured for the application
- Gemini API access for the admin AI workflow
- YouTube Data API access for the admin playlist importer

### Install

```bash
npm install
```

### Environment Variables

Create a local `.env` file from `.env.example`.

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Populate the required server-side values locally.

Never commit `.env`.

### Run

```bash
npm run dev
```

The development server starts on port `3000`.

### Production Build

```bash
npm run build
```

## Firebase

The browser Firebase configuration is stored in:

```text
firebase-applet-config.json
```

Firebase web API keys are identifiers for the Firebase project and are not a substitute for access control. Firestore access is protected by Firebase Authentication and Security Rules.

Do not confuse the public Firebase web API key with privileged secrets such as:

- Gemini API keys
- YouTube Data API keys
- Firebase Admin service-account private keys

Those privileged credentials must remain server-side.

## Firestore Collections

### `tracks`

Official approved devotional tracks.

Typical metadata includes:

- title
- hindiTitle
- sourceType
- youtubeUrl
- youtubeVideoId
- audioUrl
- thumbnailUrl
- artist
- deityId
- type
- recommendedDays
- festivalTags
- navratriDay
- deviForm
- approved
- createdAt
- updatedAt

### `songSubmissions`

Community song suggestions awaiting moderation.

Typical metadata includes:

- title
- sourceType
- url
- youtubeVideoId
- audioUrl
- deityId
- category
- artist
- note
- submittedBy
- submittedByUid
- submittedAt
- status
- adminNotes

### `navratriSettings`

Festival configuration and day/theme data.

### `admins`

Administrator authorization records, where used by the deployment.

## Administration

The administrator area is intentionally not exposed through public navigation.

The intended access model is:

```text
https://YOUR-LIVE-DOMAIN-HERE/admin
```

Access must be enforced through Firebase Authentication plus server-side authorization. Hiding the route or button in the UI is not considered sufficient security.

Admin capabilities include:

- Review community song suggestions
- Add official tracks
- Import YouTube playlists
- Review AI-classified metadata
- Manage the official library
- Manage playlists
- Configure Navratri
- Manage daily devotional configuration

## YouTube Compliance

YouTube content is played through the official embedded/IFrame player.

This project does not:

- download YouTube videos
- scrape YouTube pages
- extract YouTube audio
- convert YouTube videos into MP3 files
- proxy YouTube audio

Only supported YouTube URLs, video IDs and metadata needed by the application are stored.

Project operators are responsible for using YouTube content in accordance with YouTube's applicable terms, API policies and the rights of content owners.

## AI Classification

The admin playlist importer can use Gemini to classify imported metadata into categories such as:

- Aarti
- Bhajan
- Mantra
- Chalisa
- Stotram
- Other

It can also suggest deity, day, artist and Navratri metadata.

AI suggestions are treated as reviewable metadata, not as automatically authoritative religious classification.

## Security Model

### Public

- Listen to approved tracks
- Search
- Browse playlists
- Create personal/local preferences
- Submit song suggestions

### Admin

- Review submissions
- Publish official tracks
- Import YouTube playlists
- Run AI classification
- Manage Navratri
- Manage official playlists and library

Privileged API credentials are server-side only.

See [SECURITY.md](SECURITY.md) before publishing the repository publicly.

## Deployment

The application can be deployed as a full-stack Node/Express application with the frontend built by Vite.

A typical deployment flow is:

```text
npm install
npm run build
deploy server.ts + dist/
configure server-side environment variables
configure Firebase
configure YouTube API
configure Gemini API
```

For a production deployment, verify:

1. `/admin` is protected.
2. Firestore rules are deployed.
3. YouTube and Gemini credentials are server-side only.
4. `.env` is not in the repository.
5. Public users cannot write to the official `tracks` collection.
6. Public users cannot read the complete `songSubmissions` collection.
7. YouTube playback uses the official iframe player.

## Media and Content

The repository contains local UI artwork and sample devotional data. External audio/video sources remain external links.

Before using the application publicly, verify that each externally hosted audio source is appropriate for your intended use and that you have any permissions required for the content.

## Roadmap

- Better shared Navratri configuration persistence
- Automated playlist deduplication
- Richer AI confidence and moderation workflow
- Community analytics
- Additional festival modes
- Improved mobile radio controls
- Optional custom domain deployment

## Feedback

SoulCity Bhakti Radio is intended to be useful for GTA RP communities. Feedback about the listening experience, navigation, devotional organisation, playback and missing content is welcome.

## License

No license is included by default.

If you want other developers to reuse or modify the source code, add an appropriate open-source license such as the MIT License after deciding the terms you want to allow.

---

Built as a community-focused devotional radio experience for GTA RP.
