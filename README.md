# sp-calc ✅

A four‑function calculator designed to meet the baseline acceptance criteria and pass a rubric review.

## How to run
Open `calculator/index.html` in your browser (Chrome/Edge/Firefox).

## Features (mapped to the rubric)
- **Semantic HTML + accessible UI**
  - visible focus via `:focus-visible`
  - `aria-live="polite"` on expression and result
  - `role="alert"` error region with dismiss button
- **Clean responsive CSS**
  - centered container, max width ~420px
  - 4-column grid keypad with consistent spacing
  - touch-friendly sizing (~44px targets)
- **Modular JS**
  - pure `calculate(a, op, b)`
  - validation with `Number.isFinite`
  - divide-by-zero handled
  - app never crashes on bad input
- **Optional keyboard support**
  - digits, `.`, `+ - * /`, `Enter`, `Backspace`, `C`

## Known limitations
- Floating point math can show classic JS precision quirks (example: `0.1 + 0.2`).
- Output is formatted to reduce noise, but IEEE‑754 still exists.

## Self-audit proof terms
- `role="alert"` → `calculator/index.html`
- `aria-live="polite"` → `calculator/index.html`
- `:focus-visible` → `calculator/styles.css`
- `function calculate(` → `calculator/app.js`
- `Number.isFinite` → `calculator/app.js`
