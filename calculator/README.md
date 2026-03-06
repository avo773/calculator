# Calculator

A basic four-function calculator built with semantic HTML, responsive CSS, and modular JavaScript.

This project was created to practice front-end structure, state handling, pure calculation logic, accessibility, and error handling.

## Features
- Addition
- Subtraction
- Multiplication
- Division
- Clear button
- Friendly error handling
- Accessible result updates with `aria-live="polite"`
- Accessible error messages with `role="alert"`
- Responsive button grid layout
- Keyboard support for digits, operators, Enter, Backspace, and C

## Files
- `index.html`
- `styles.css`
- `app.js`
- `README.md`
- `TESTS.md`

## How to Run
1. Open the project folder.
2. Open `index.html` in a browser.

## Accessibility Notes
- Result uses `aria-live="polite"`
- Error area uses `role="alert"`
- Buttons include visible focus styles
- Includes a skip link for keyboard users
- Includes reduced-motion support

## Known Limitations
- Supports one operation at a time
- Does not support long chained expressions