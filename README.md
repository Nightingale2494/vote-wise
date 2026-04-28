# VoteWise — Interactive Election Assistant

A colorful multi-page, front-end voting assistant for Indian elections.

## What's new

- **Multi-page experience**:
  - `index.html` (home + quick profile preview)
  - `journey.html` (guided planner + timeline + advanced polling finder)
  - `assistant.html` (chat-first Q&A)
- Improved UI with richer gradients, color panels, and clear tab navigation.
- More complex polling discovery logic:
  - multiple Maps strategies (polling booth, BLO office, registration office)
  - multi-query Google Search fallbacks
  - direct ECI + NVSP official links
  - optional PIN code + search mode input

## Tech

- HTML
- CSS
- Vanilla JavaScript

## Run locally

```bash
python3 -m http.server 8000
```

Then open:
- <http://localhost:8000/index.html>
- <http://localhost:8000/journey.html>
- <http://localhost:8000/assistant.html>

## Notes

- No API keys are embedded.
- No sensitive user data is persisted.
