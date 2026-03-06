// Cache frequently used DOM elements once.
// This keeps UI updates simple and avoids repeating the same DOM queries.
const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");
const buttonsEl = document.querySelector(".buttons");

// Store calculator state in one object so related values stay grouped together.
// This makes the current expression easier to track and reset.
const state = {
  firstOperand: "",
  operator: "",
  secondOperand: "",
  result: "",
};

/**
 * Pure calculation function.
 * It receives two numbers and one operator, then returns the computed value.
 * It does not read or write DOM values, which keeps the logic testable and predictable.
 */
function calculate(a, op, b) {
  // Stop invalid numeric values before they create broken output.
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error("Enter valid numbers.");
  }

  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;

  if (op === "/") {
    // Divide-by-zero is handled as a user-facing error instead of returning Infinity.
    if (b === 0) {
      throw new Error("Cannot divide by zero.");
    }
    return a / b;
  }

  // If no supported operator exists, the expression is incomplete or invalid.
  throw new Error("Choose an operator.");
}

/**
 * Build a readable expression string from the current state.
 * This keeps formatting logic out of the DOM update code.
 */
function getExpressionText() {
  return `${state.firstOperand || ""} ${state.operator || ""} ${state.secondOperand || ""}`.trim() || "0";
}

/**
 * Update the visible UI from the current calculator state.
 * Centralizing display updates prevents scattered DOM changes across multiple functions.
 */
function render() {
  expressionEl.textContent = getExpressionText();
  resultEl.textContent = state.result || "0";
}

/**
 * Show a clear error message in the dedicated error region.
 * This keeps feedback visible without mixing it into the result line.
 */
function setError(message) {
  errorEl.textContent = message;
}

/**
 * Remove the current error message after the user takes a new valid action.
 * This prevents old errors from lingering after the issue has been corrected.
 */
function clearError() {
  errorEl.textContent = "";
}

/**
 * Reset all calculator state back to its initial values.
 * This supports the Clear button and also provides a clean startup state.
 */
function clearAll() {
  state.firstOperand = "";
  state.operator = "";
  state.secondOperand = "";
  state.result = "";
  clearError();
  render();
}

/**
 * Add a digit to whichever operand is currently active.
 * Before an operator is chosen, digits build the first operand.
 * After an operator is chosen, digits build the second operand.
 */
function appendNumber(value) {
  clearError();

  if (!state.operator) {
    state.firstOperand += value;
  } else {
    state.secondOperand += value;
  }

  render();
}

/**
 * Add a decimal point to the active operand.
 * Duplicate decimals are blocked so the operand remains a valid number string.
 */
function appendDecimal() {
  clearError();

  if (!state.operator) {
    if (state.firstOperand.includes(".")) return;
    state.firstOperand = state.firstOperand ? `${state.firstOperand}.` : "0.";
  } else {
    if (state.secondOperand.includes(".")) return;
    state.secondOperand = state.secondOperand ? `${state.secondOperand}.` : "0.";
  }

  render();
}

/**
 * Store the selected operator.
 * An operator is only allowed after the first operand exists,
 * which prevents incomplete expressions from looking valid.
 */
function chooseOperator(value) {
  clearError();

  if (!state.firstOperand) {
    setError("Enter a number first.");
    return;
  }

  state.operator = value;
  render();
}

/**
 * Evaluate the current expression if all required parts exist.
 * This converts the operand strings into numbers, runs the pure calculate function,
 * then stores the answer as the next first operand so the user can continue working.
 */
function evaluate() {
  clearError();

  if (!state.firstOperand || !state.operator || !state.secondOperand) {
    setError("Complete the expression first.");
    return;
  }

  const a = Number(state.firstOperand);
  const b = Number(state.secondOperand);

  try {
    const answer = calculate(a, state.operator, b);

    state.result = String(answer);
    state.firstOperand = state.result;
    state.operator = "";
    state.secondOperand = "";

    render();
  } catch (error) {
    setError(error.message);
  }
}

/**
 * Use event delegation so one click listener can manage all calculator buttons.
 * This keeps the code shorter and easier to maintain than attaching listeners one by one.
 */
buttonsEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { action, value } = button.dataset;

  if (action === "number") appendNumber(value);
  if (action === "decimal") appendDecimal();
  if (action === "operator") chooseOperator(value);
  if (action === "equals") evaluate();
  if (action === "clear") clearAll();
});

// Start with a clean visible state instead of leaving the UI uninitialized.
clearAll();