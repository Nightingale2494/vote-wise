# VoteWise — Interactive Election Assistant

A polished, front-end guided voting assistant focused on Indian elections.

## Features

- Mission-style onboarding for first-time voters.
- Personalized next steps based on age and registration status.
- Visual timeline with “You are here” phase highlight.
- Improved polling assistance:
  - Google Maps query phrased as **"polling booth near <city, state, India>"**.
  - Fallback Google search link for official CEO/NVSP resources.
  - Direct links to ECI Voter Services and NVSP when Maps returns no booth results.
- Context-aware election Q&A chat with quick question chips.
- Responsive, modern glassmorphism UI.

## Tech

- HTML
- CSS
- Vanilla JavaScript

## Run locally

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Notes

- This project avoids storing sensitive user data.
- API keys are not embedded in the frontend.
- Internet access is required for external maps/search links.
