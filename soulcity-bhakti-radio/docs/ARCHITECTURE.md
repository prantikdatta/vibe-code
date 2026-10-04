# Architecture

## Overview

SoulCity Bhakti Radio uses a React frontend, Express backend and Firebase data layer.

```text
                    SoulCity Bhakti Radio
                             |
             +---------------+---------------+
             |                               |
          Public                         Admin
             |                               |
     +-------+-------+               +-------+-------+
     |       |       |               |       |       |
   Search  Player  Suggest         Library  Import  Navratri
             |       |               |       |
             +-------+---------------+-------+
                     |
                  Firestore

Express Backend
       |
       +---- Admin Verification
       |
       +---- YouTube Data API
       |
       +---- Gemini API
