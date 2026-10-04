# SoulCity Bhakti Radio 🪔

SoulCity Bhakti Radio is a devotional radio web application built for GTA RP communities.

Live Link : https://soulcity-bhakti-radio.ai.studio/

The idea is simple: open the radio, press play, and let Aarti, Bhajan and Mantra continue in the background while performing Aarti or spending time in the mandir.

Built as an AI assisted application using Google AI Studio Build Mode and refined around a React, TypeScript, Express and Firebase stack.

## Features

- Daily Bhakti based on the current weekday and deity
- Aarti, Bhajan, Mantra, Chalisa and Stotram sections
- Direct audio URL playback
- YouTube playback using the official YouTube IFrame Player API
- YouTube thumbnail and metadata support
- Play, pause, seek, next, previous, volume and mute controls
- Search and filtering by title, deity, category and source
- Deity based browsing
- Playlist support
- Dedicated Navratri experience
- Dynamic Navratri day and theme colour
- Community song suggestion workflow
- Admin moderation for submitted songs
- Admin only YouTube playlist import
- Gemini assisted classification of imported devotional content
- Firebase Authentication
- Firestore backed shared music library
- Responsive desktop and mobile design
- Temple inspired landing page with curtain entrance

## How It Works

### Public

Visitors can:

- Listen to devotional content
- Search and browse the library
- Use playlists
- Play YouTube or direct audio tracks
- Submit songs for consideration

Suggested songs do not go directly into the official library.

```text
User
  ↓
Suggest a Song
  ↓
Pending
  ↓
Admin Review
  ↓
Approve / Reject
  ↓
Official Library
