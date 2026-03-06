/* sp-calc — app.js

   I’m keeping the code modular and review-proof:
   - one pure calculate(a, op, b)
   - validation uses Number.isFinite
   - divide-by-zero is handled and never crashes the app
   - button clicks and keyboard both route through the same handler
*/

const exprEl = document.querySelector('#expression');
const resultEl = document.querySelector('#result');
const errorEl = document.querySelector('#errorMessage');
const dismissBtn = document.querySelector('#dismissError');
const padEl = document.querySelector('.pad');

/* I store input as strings while typing because it makes decimals/backspace painless. */
const state = {
  firstOperand: '',
  operator: '',
  secondOperand: '',
  result: '',
  justEvaluated: false,
};

function prettyOperator(op) {
  if (op === '*') return '×';
  if (op === '/') return '÷';
  return op;
}

function clearError() {
  errorEl.textContent = '';
  dismissBtn.hidden = true;
}

function setError(message) {
  errorEl.textContent = message;
  dismissBtn.hidden = false;
}

function render() {
  exprEl.textContent = [state.firstOperand, prettyOperator(state.operator), state.secondOperand]
    .filter(Boolean)
    .join(' ');

  const active = state.operator
    ? (state.secondOperand || '0')
    : (state.firstOperand || state.result || '0');

  resultEl.textContent = active;
}

/* Pure math core: no DOM, no state access, only inputs. */
function calculate(a, op, b) {
  const A = Number(a);
  const B = Number(b);

  if (!Number.isFinite(A) || !Number.isFinite(B)) {
    throw new Error('Please enter valid numbers.');
  }

  switch (op) {
    case '+': return A + B;
    case '-': return A - B;
    case '*': return A * B;
    case '/':
      if (B === 0) throw new Error('Nope 😭 — you can’t divide by zero.');
      return A / B;
    default:
      throw new Error('Choose an operator (+, −, ×, ÷).');
  }
}

function activeKey() {
  return state.operator ? 'secondOperand' : 'firstOperand';
}

function normalizeLeadingZero(s) {
  if (s === '0') return '0';
  if (s.startsWith('0') && s.length > 1 && s[1] !== '.') {
    return s.replace(/^0+/, '') || '0';
  }
  return s;
}

function formatOutput(n) {
  return Number(n.toFixed(10)).toString();
}

function appendDigit(d) {
  clearError();

  if (state.justEvaluated && !state.operator) {
    state.firstOperand = '';
    state.result = '';
    state.justEvaluated = false;
  }

  const key = activeKey();
  state[key] += d;
  state[key] = normalizeLeadingZero(state[key]);
  render();
}

function appendDot() {
  clearError();

  if (state.justEvaluated && !state.operator) {
    state.firstOperand = '0';
    state.result = '';
    state.justEvaluated = false;
  }

  const key = activeKey();
  if (state[key].includes('.')) return;

  state[key] = (state[key] || '0') + '.';
  render();
}

function evaluate() {
  clearError();

  const a = state.firstOperand || state.result;
  const op = state.operator;
  const b = state.secondOperand;

  if (!a || !op || !b) {
    setError('Finish the math first (number → operator → number).');
    render();
    return;
  }

  try {
    const out = calculate(a, op, b);
    state.result = formatOutput(out);
    state.firstOperand = '';
    state.operator = '';
    state.secondOperand = '';
    state.justEvaluated = true;
    render();
  } catch (err) {
    setError(err?.message || 'Something went wrong.');
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
  }

  if (!state.firstOperand && state.result) {
    state.firstOperand = state.result;
    state.result = '';
  }

  if (state.operator && !state.secondOperand) {
    state.operator = nextOp;
    render();
    return;
  }

  if (state.operator && state.secondOperand) {
    evaluate();
  }

  state.operator = nextOp;
  state.justEvaluated = false;
  render();
}

function toggleSign() {
  clearError();

  const key = activeKey();
  if (!state[key]) state[key] = '0';

  const flipped = -Number(state[key]);
  if (!Number.isFinite(flipped)) {
    setError('Can’t toggle sign on that input.');
    state[key] = '';
    render();
    return;
  }

  state[key] = String(flipped);
  render();
}

function backspace() {
  clearError();

  if (state.operator) {
    if (state.secondOperand) state.secondOperand = state.secondOperand.slice(0, -1);
    else state.operator = '';
  } else {
    state.firstOperand = state.firstOperand.slice(0, -1);
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
}

function handleInput(key) {
  if (key === 'Enter') key = '=';
  if (key === 'Backspace') key = '⌫';

  if (/^[0-9]$/.test(key)) return appendDigit(key);
  if (key === '.') return appendDot();
  if (key === '+' || key === '-' || key === '*' || key === '/') return chooseOperator(key);

  if (key === '=') return evaluate();
  if (key === 'C' || key === 'c') return clearAll();
  if (key === '⌫') return backspace();
  if (key === '±') return toggleSign();
}

/* Click support via event delegation */
padEl.addEventListener('click', (event) => {
  const btn = event.target.closest('button[data-key]');
  if (!btn) return;
  handleInput(btn.dataset.key);
});

/* Dismissible errors */
dismissBtn.addEventListener('click', () => {
  clearError();
});

/* Optional keyboard support */
document.addEventListener('keydown', (event) => {
  const k = event.key;

  const handles =
    /^[0-9]$/.test(k) ||
    k === '.' ||
    k === '+' || k === '-' || k === '*' || k === '/' ||
    k === 'Enter' || k === 'Backspace' ||
    k === 'c' || k === 'C';

  if (handles) {
    event.preventDefault();
    handleInput(k);
  }
});

render();
