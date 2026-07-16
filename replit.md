# Teka-Teki Silang (Indonesian Crossword Puzzle)

A browser-based crossword puzzle app in Indonesian, themed around personal trivia. Pure static HTML/CSS/JS — no build step, no dependencies.

## Stack

- **Frontend**: Vanilla HTML + CSS + JavaScript (no frameworks)
- **Server**: `python3 -m http.server 5000`

## How to run

The "Start application" workflow runs the app:

```
python3 -m http.server 5000
```

Open the preview at port 5000.

## Project structure

| File | Purpose |
|------|---------|
| `index.html` | App shell and layout |
| `style.css` | Newspaper-style visual theme |
| `script.js` | Crossword generator, grid renderer, game logic |

## Customizing the puzzle

Edit the `WORDS` array at the top of `script.js`. Each entry has an `answer` (uppercase, no spaces) and a `clue`:

```js
const WORDS = [
  { answer: "BIRU", clue: "Warna favoritku" },
  // ...
];
```

The crossword layout is generated automatically from the word list.

## User preferences

- Keep the existing file structure (single-page static app).
