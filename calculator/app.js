/* app.js

   This file handles calculator behavior.

   Main design choices:
   - one pure calculate(a, op, b) function for math only
   - DOM updates are separated into render()
   - input is stored as strings while typing
   - keyboard input and button clicks use the same handler
   - errors are shown in the UI without crashing the app
*/

const exprEl = document.querySelector('#expression');
// const creates a variable that should not be reassigned.
// document.querySelector(...) returns the first matching DOM element.
// '#expression' is an id selector, so this finds the element with id="expression".
// Caching the element once avoids repeating the same DOM query later.

const resultEl = document.querySelector('#result');
// This stores the result display element for later UI updates.

const errorEl = document.querySelector('#errorMessage');
// This stores the dedicated error region so messages can be shown in one consistent place.

const dismissBtn = document.querySelector('#dismissError');
// This stores the dismiss-error button so JavaScript can show, hide, and attach behavior to it.

const padEl = document.querySelector('.pad');
// '.pad' is a class selector.
// This targets the keypad container so one click listener can manage all calculator buttons.

const state = {
  firstOperand: '',
  // firstOperand stores the first number as a string while the user is typing.

  operator: '',
  // operator stores +, -, *, or /.

  secondOperand: '',
  // secondOperand stores the second number after an operator is chosen.

  result: '',
  // result stores the most recent answer as a string for display and reuse.

  justEvaluated: false,
  // justEvaluated tracks whether the last action was pressing equals.
  // This prevents new number entry from awkwardly appending onto an old result.
};

function prettyOperator(op) {
  // This helper converts internal operator symbols into display-friendly symbols.

  if (op === '*') return '×';
  if (op === '/') return '÷';
  return op;
}

function clearError() {
  errorEl.textContent = '';
  // textContent replaces the visible text inside the error element.
  // Setting it to '' clears any existing message.

  dismissBtn.hidden = true;
  // hidden is a built-in element property.
  // true hides the dismiss button when there is no visible error.
}

function setError(message) {
  errorEl.textContent = message;
  // Show the provided message in the error region.

  dismissBtn.hidden = false;
  // Make the dismiss button visible whenever there is an error to dismiss.
}

function render() {
  exprEl.textContent = [state.firstOperand, prettyOperator(state.operator), state.secondOperand]
    .filter(Boolean)
    .join(' ');
  // [ ... ] creates an array from the expression parts.
  // .filter(Boolean) removes empty strings so blank parts do not create messy spacing.
  // .join(' ') combines the remaining parts into one readable expression string.

  const active = state.operator
    ? (state.secondOperand || '0')
    : (state.firstOperand || state.result || '0');
  // const creates a local variable.
  // The ternary operator uses: condition ? valueIfTrue : valueIfFalse
  // If an operator exists, the second operand is the active entry display.
  // Otherwise show firstOperand, or result, or '0' as fallback.
  // || returns the first truthy value from left to right.

  resultEl.textContent = active;
  // Update the visible result line from the current state.
}

function calculate(a, op, b) {
  // This function is pure:
  // - it depends only on its inputs
  // - it returns a value or throws an error
  // - it does not touch the DOM
  // - it does not mutate shared application state

  const A = Number(a);
  const B = Number(b);
  // Number(...) converts input strings into numeric values before calculation.

  if (!Number.isFinite(A) || !Number.isFinite(B)) {
    // ! negates the expression.
    // Number.isFinite(...) returns true only for real finite numbers.
    // This blocks NaN and Infinity from entering calculation output.
    throw new Error('Please enter valid numbers.');
  }

  switch (op) {
    // switch compares one value against multiple possible cases.

    case '+':
      return A + B;

    case '-':
      return A - B;

    case '*':
      return A * B;

    case '/':
      if (B === 0) throw new Error('Cannot divide by zero.');
      // Division by zero is handled explicitly instead of returning Infinity.
      return A / B;

    default:
      throw new Error('Choose an operator (+, −, ×, ÷).');
  }
}

function activeKey() {
  return state.operator ? 'secondOperand' : 'firstOperand';
  // This helper decides which operand is currently being edited.
  // If an operator already exists, typing should update secondOperand.
  // Otherwise typing should update firstOperand.
}

function normalizeLeadingZero(s) {
  if (s === '0') return '0';
  // Keep a plain single zero unchanged.

  if (s.startsWith('0') && s.length > 1 && s[1] !== '.') {
    // .startsWith('0') checks whether the string begins with zero.
    // s.length > 1 means the string has more than one character.
    // s[1] !== '.' protects valid decimals like 0.5 from being mangled.
    return s.replace(/^0+/, '') || '0';
    // .replace(/^0+/, '') removes one or more leading zeros.
    // Regex breakdown:
    // ^   = start of string
    // 0+  = one or more zeros
    // || '0' prevents returning an empty string after cleanup.
  }

  return s;
}

function formatOutput(n) {
  return Number(n.toFixed(10)).toString();
  // toFixed(10) rounds the number to 10 decimal places and returns a string.
  // Number(...) removes unnecessary trailing zeros from that fixed string.
  // toString() converts the cleaned numeric value back into a display-friendly string.
  // This helps reduce floating-point noise such as 0.30000000000000004.
}

function appendDigit(d) {
  clearError();
  // Fresh valid input clears old error messages.

  if (state.justEvaluated && !state.operator) {
    state.firstOperand = '';
    state.result = '';
    state.justEvaluated = false;
    // If the user just pressed equals and then starts typing a new number,
    // begin a fresh expression instead of appending onto the old result.
  }

  const key = activeKey();
  // key will be either 'firstOperand' or 'secondOperand'.

  state[key] += d;
  // Bracket notation allows dynamic property access.
  // += appends the typed digit to the current operand string.

  state[key] = normalizeLeadingZero(state[key]);
  // Cleans inputs like 0005 while still preserving valid decimal forms.

  render();
}

function appendDot() {
  clearError();

  if (state.justEvaluated && !state.operator) {
    state.firstOperand = '0';
    state.result = '';
    state.justEvaluated = false;
    // If a decimal starts a new value after evaluation, begin at 0.
  }

  const key = activeKey();

  if (state[key].includes('.')) return;
  // .includes('.') prevents duplicate decimals in one operand.

  state[key] = (state[key] || '0') + '.';
  // If the operand is empty, use '0.' instead of just '.'.
  // This keeps the displayed input valid and readable.

  render();
}

function evaluate() {
  clearError();

  const a = state.firstOperand || state.result;
  const op = state.operator;
  const b = state.secondOperand;
  // Local variables make the expression parts easier to inspect and debug.

  if (!a || !op || !b) {
    setError('Finish the math first (number → operator → number).');
    render();
    return;
    // Stop evaluation early if the expression is incomplete.
  }

  try {
    const out = calculate(a, op, b);
    state.result = formatOutput(out);
    state.firstOperand = '';
    state.operator = '';
    state.secondOperand = '';
    state.justEvaluated = true;
    // After a successful evaluation:
    // - keep the answer in result
    // - clear the old operands/operator
    // - mark that equals was just used
    render();
  } catch (err) {
    setError(err?.message || 'Something went wrong.');
    // err?.message uses optional chaining.
    // If err exists and has a message, use it.
    // Otherwise use a generic fallback message.
    state.justEvaluated = false;
    render();
  }
}

function chooseOperator(nextOp) {
  clearError();

  if (!state.firstOperand && !state.result) {
    setError('Type a number first.');
    render();
    return;
    // Prevent starting the expression with an operator and no value.
  }

  if (!state.firstOperand && state.result) {
    state.firstOperand = state.result;
    state.result = '';
    // If the user has a previous result but no active first operand,
    // move the result into firstOperand so they can continue from it.
  }

  if (state.operator && !state.secondOperand) {
    state.operator = nextOp;
    render();
    return;
    // This allows operator replacement before the second operand is entered.
    // Example: 8 + then pressing - changes the operator cleanly.
  }

  if (state.operator && state.secondOperand) {
    evaluate();
    // If a complete expression already exists and another operator is chosen,
    // evaluate first so chained use stays predictable.
  }

  state.operator = nextOp;
  state.justEvaluated = false;
  render();
}

function toggleSign() {
  clearError();

  const key = activeKey();

  if (!state[key]) state[key] = '0';
  // If there is no current operand, start from 0 before toggling sign.

  const flipped = -Number(state[key]);
  // Unary minus negates the numeric value.

  if (!Number.isFinite(flipped)) {
    setError('Cannot toggle sign on that input.');
    state[key] = '';
    render();
    return;
  }

  state[key] = String(flipped);
  // Convert the negated value back into a string so editing can continue naturally.

  render();
}

function backspace() {
  clearError();

  if (state.operator) {
    if (state.secondOperand) {
      state.secondOperand = state.secondOperand.slice(0, -1);
      // .slice(0, -1) returns the string without its last character.
    } else {
      state.operator = '';
      // If no second operand exists yet, backspace removes the operator itself.
    }
  } else {
    state.firstOperand = state.firstOperand.slice(0, -1);
    // If no operator exists, backspace edits the first operand.
  }

  state.justEvaluated = false;
  render();
}

function clearAll() {
  state.firstOperand = '';
  state.operator = '';
  state.secondOperand = '';
  state.result = '';
  state.justEvaluated = false;
  clearError();
  render();
  // Reset the entire calculator back to its default state.
}

function handleInput(key) {
  // Shared routing function for all supported keypad and keyboard inputs.

  if (key === 'Enter') key = '=';
  // Normalize keyboard Enter into the same internal meaning as equals.

  if (key === 'Backspace') key = '⌫';
  // Normalize keyboard Backspace into the same internal meaning as the backspace button.

  if (/^[0-9]$/.test(key)) return appendDigit(key);
  // Regex breakdown:
  // ^      = start of string
  // [0-9]  = exactly one digit
  // $      = end of string
  // .test(key) returns true if the key is one digit.

  if (key === '.') return appendDot();
  if (key === '+' || key === '-' || key === '*' || key === '/') return chooseOperator(key);

  if (key === '=') return evaluate();
  if (key === 'C' || key === 'c') return clearAll();
  if (key === '⌫') return backspace();
  if (key === '±') return toggleSign();
}

padEl.addEventListener('click', (event) => {
  // addEventListener attaches a click listener to the keypad container.

  const btn = event.target.closest('button[data-key]');
  // event.target is the actual clicked element.
  // .closest('button[data-key]') climbs upward to the nearest matching button.
  // This is event delegation: one container listener handles all keypad buttons.

  if (!btn) return;
  // If the click did not come from a matching button, stop early.

  handleInput(btn.dataset.key);
  // dataset.key reads the HTML data-key attribute from the clicked button.
  // That value is passed into the shared input handler.
});

dismissBtn.addEventListener('click', () => {
  clearError();
  // Clicking dismiss removes only the visible error message.
});

document.addEventListener('keydown', (event) => {
  // Listen for keyboard input at the document level.

  const k = event.key;
  // event.key contains the pressed key as text.

  const handles =
    /^[0-9]$/.test(k) ||
    k === '.' ||
    k === '+' || k === '-' || k === '*' || k === '/' ||
    k === 'Enter' || k === 'Backspace' ||
    k === 'c' || k === 'C';
  // This boolean expression decides whether the key is supported by the calculator.

  if (handles) {
    event.preventDefault();
    // preventDefault() stops the browser’s built-in behavior when needed.
    // Example: Backspace should not navigate browser history.

    handleInput(k);
    // Route keyboard input through the same logic path used by button clicks.
  }
});

render();
// Initialize the display once on page load so the UI starts from a known state.