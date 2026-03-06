# Manual Test Cases (≥ 8)

Run these with mouse and keyboard.

## Basics
1) Add: `2 + 3 =` → `5`
2) Subtract: `10 - 4 =` → `6`
3) Multiply: `7 * 6 =` → `42`
4) Divide: `8 / 2 =` → `4`

## Edge cases
5) Divide by zero: `9 / 0 =` → error shows; app still works
6) Empty evaluate: press `=` on a fresh load → error shows
7) Missing second operand: `5 + =` → error shows
8) Decimal input: `0 . 5 + 1 . 2 =` → `1.7`

## Editing
9) Backspace digits: type `123`, press Backspace twice → `1`
10) Operator swap: type `8 +` then press `-` → operator becomes `-` (no crash)

## Keyboard flows (optional feature)
11) Type `4`, `*`, `5`, press Enter → `20`
12) Press `C` → clears back to `0`
