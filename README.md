# VoteWise — Interactive Election Assistant

A lightweight, front-end guided voting assistant focused on Indian elections.

## Features

- Guided onboarding for first-time voters.
- Personalized next steps based on age and registration status.
- Election timeline view with a "You are here" indicator.
- Polling-station assistance via Google Maps search link.
- Simple context-aware election Q&A chat.

## Tech

- HTML
- CSS
- Vanilla JavaScript

## Run locally

Because this is a static app, open `index.html` in a browser.

Optional local server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Notes

- This project avoids storing sensitive user data.
- API keys are not embedded in the frontend.
- Assumes internet connectivity for maps links.
