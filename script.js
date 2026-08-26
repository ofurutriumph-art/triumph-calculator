
// ======================================
// DOM ELEMENTS
// ======================================

const display = document.getElementById("display");
const historyList = document.getElementById("historyList");
const historyBtn = document.getElementById("historyBtn");
const historyContainer = document.getElementById("history-container");
const themeToggle = document.getElementById("themeToggle");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");


// ======================================
// CALCULATOR SETTINGS
// ======================================

const operators = ["+", "-", "×", "÷"];

const MAX_DISPLAY_LENGTH = 25;
const MAX_HISTORY = 20;
const DECIMAL_PLACES = 10;
const RIPPLE_DURATION = 500;


// ======================================
// KEYBOARD MAPPING
// ======================================

const keyMap = {
    "+": "+",
    "-": "-",
    "*": "×",
    "/": "÷"
};


// ======================================
// APPLICATION STATE
// ======================================

let history = [];

try {

    history = JSON.parse(
        localStorage.getItem("history")
    ) || [];

} catch {

    history = [];

}




// ======================================
// DISPLAY
// ======================================

function updateDisplay(value) {
    display.value = value;
    updateFontSize();
}



// ======================================
// UPDATE HISTORY
// ======================================

function updateHistory() {

    historyList.innerHTML = "";

    if (history.length === 0) {

        const emptyMessage = document.createElement("li");

        emptyMessage.textContent = "No calculations yet.";
        emptyMessage.classList.add("empty-history");

        historyList.appendChild(emptyMessage);

        return;
    }

    [...history].reverse().forEach(item => {

        const li = document.createElement("li");

        li.textContent = item;

        li.addEventListener("click", () => {

            const result = item.split("=").pop().trim();

            updateDisplay(result);

        });

        historyList.appendChild(li);

    });

}


// ======================================
// UPDATE FONT SIZE
// ======================================

function updateFontSize() {
    const length = display.value.length;

    if (length <= 8) {
        display.style.fontSize = "2.5rem";
    } else if (length <= 12) {
        display.style.fontSize = "2rem";
    } else if (length <= 16) {
        display.style.fontSize = "1.6rem";
    } else if (length <= 20) {
        display.style.fontSize = "1.3rem";
    } else if (length <= 25) {
        display.style.fontSize = "1rem";
    } else {
        display.style.fontSize = "0.8rem";
    }
}


// ======================================
// APPEND INPUT TO DISPLAY
// ======================================

function appendToDisplay(input) {
    resetIfError();

    const lastChar = display.value.slice(-1);


    if (display.value.length >= MAX_DISPLAY_LENGTH) return;

    if (display.value === "0" && input === "0") return;

    // Prevent starting with an operator
    if (display.value === "0" && operators.includes(input)) {
        return;
    }

    if (display.value === "0" && input === ".") {
        display.value = "0.";
        updateFontSize();
        return;
    }

    if (display.value === "0" && input !== ".") {
        display.value = input;
        updateFontSize();
        return;
    }


    // Prevent two operators together
    if (operators.includes(lastChar) && operators.includes(input)) {
        return;
    }

    // Prevent multiple decimal points in the current number
if (input === ".") {

    const currentNumber =
        display.value.split(/[+\-×÷]/).pop();

    if (currentNumber.includes(".")) {
        return;
    }

    if (currentNumber === "") {
        display.value += "0.";
        updateFontSize();
        return;
    }
}

    display.value += input;

    updateFontSize();
}



// ======================================
// CLEAR DISPLAY
// ======================================

function clearDisplay() {

    updateDisplay("0");

}


// ======================================
// DELETE LAST
// ======================================

function deleteLast() {

    if (display.value === "Error") {
        clearDisplay();
        return;
    }

    const newValue = display.value.slice(0, -1);

    updateDisplay(newValue || "0");
}


// ======================================
// PERCENTAGE
// ======================================

function percentage() {

    if (display.value === "Error") {
        return;
    }

    if (/[+\-×÷]/.test(display.value)) {
        showError();
        return;
    }

    const value = Number(display.value);

    if (!Number.isFinite(value)) {
        showError();
        return;
    }

    const result = value / 100;

    const finalResult = Number.isInteger(result)
        ? result
        : Number(result.toFixed(DECIMAL_PLACES));

    updateDisplay(finalResult);
}


// ======================================
// SHOW ERROR
// ======================================

function showError() {
    
    updateDisplay("Error");

}


// ======================================
// RESET ERROR
// ======================================

function resetIfError() {

    if (display.value === "Error") {

        updateDisplay("0");

    }

}


// ======================================
// SAVE HISTORY
// ======================================

function saveHistory() {
    localStorage.setItem("history", JSON.stringify(history));
}



// ======================================
// EVALUATE EXPRESSION
// ======================================

function evaluateExpression(expression) {

    const numbers = expression.split(/[+\-×÷]/);
    const operatorsList = expression.match(/[+\-×÷]/g) || [];

    if (numbers.some(number => number === "" || number === ".")) {
        throw new Error("Invalid expression");
    }

    const values = numbers.map(Number);

    if (values.some(value => !Number.isFinite(value))) {
        throw new Error("Invalid number");
    }

    // ======================================
    // MULTIPLICATION AND DIVISION
    // ======================================

    for (let i = 0; i < operatorsList.length; i++) {

        const operator = operatorsList[i];

        if (operator === "×" || operator === "÷") {

            const left = values[i];
            const right = values[i + 1];

            if (operator === "÷" && right === 0) {
                throw new Error("Division by zero");
            }

            const result =
                operator === "×"
                    ? left * right
                    : left / right;

            values.splice(i, 2, result);
            operatorsList.splice(i, 1);

            i--;
        }
    }

    // ======================================
    // ADDITION AND SUBTRACTION
    // ======================================

    let result = values[0];

    for (let i = 0; i < operatorsList.length; i++) {

        const operator = operatorsList[i];
        const nextValue = values[i + 1];

        if (operator === "+") {
            result += nextValue;
        }

        if (operator === "-") {
            result -= nextValue;
        }
    }

    return result;
}



// ======================================
// CALCULATE
// ======================================

function calculate() {

    if (display.value === "Error") {
        return;
    }

    const lastChar = display.value.slice(-1);

    if (operators.includes(lastChar)) {
        showError();
        return;
    }

    try {

        const originalExpression = display.value;

        const result = evaluateExpression(originalExpression);

        if (!Number.isFinite(result)) {
            showError();
            return;
        }

        const finalResult = Number.isInteger(result)
            ? result
            : Number(result.toFixed(DECIMAL_PLACES));

        history.push(
            `${originalExpression} = ${finalResult}`
        );

        if (history.length > MAX_HISTORY) {
            history.shift();
        }

        saveHistory();

        updateDisplay(finalResult);
        updateHistory();

    } catch {

        showError();

    }

}
 


// ======================================
// KEYBOARD INPUT
// ======================================

document.addEventListener("keydown", (event) => {

    if (event.ctrlKey || event.metaKey) {
    return;
    }

    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
       appendToDisplay(key);
    }

   if (keyMap[key]) {
        appendToDisplay(keyMap[key]);
   }

    if (key === "Enter") {
        event.preventDefault();
        calculate();
    }

    if (key === "Delete") {
    clearDisplay();
    }

    if (key === "Backspace") {
        deleteLast();
    }

    if (key === "Escape") {
        clearDisplay();
    }

    if (key === "%") {
        percentage();
    }
});


// ======================================
// BUTTON RIPPLE EFFECT
// ======================================

const buttons = document.querySelectorAll("#keys button");

buttons.forEach(button => {
    button.addEventListener("click", (e) => {

        const ripple = document.createElement("span");
        ripple.classList.add("ripple");

        const size = Math.max(button.clientWidth, button.clientHeight);

        ripple.style.width = size + "px";
        ripple.style.height = size + "px";

        ripple.style.left = (e.offsetX - size / 2) + "px";
        ripple.style.top = (e.offsetY - size / 2) + "px";

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, RIPPLE_DURATION);

    });
});


// ======================================
// HISTORY CONTROLS
// ======================================

historyBtn.addEventListener("click", () => {

    const isOpen = historyContainer.classList.toggle("show");

    historyBtn.setAttribute("aria-expanded", isOpen);

});


clearHistoryBtn.addEventListener("click", () => {

    history = [];

    saveHistory();

    updateHistory();

});




// ======================================
// THEME
// ======================================

function updateThemeButton(isLightMode) {

    themeToggle.querySelector("i").className =
        isLightMode
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";

    themeToggle.setAttribute(
        "aria-label",
        isLightMode
            ? "Switch to dark theme"
            : "Switch to light theme"
    );

}



themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light-theme");

    const isLightMode =
        document.body.classList.contains("light-theme");

    updateThemeButton(isLightMode);

    localStorage.setItem(
        "theme",
        isLightMode ? "light" : "dark"
    );

});



function loadTheme() {

    const savedTheme =
        localStorage.getItem("theme") || "dark";

    const isLightMode = savedTheme === "light";

    if (isLightMode) {
        document.body.classList.add("light-theme");
    }

    updateThemeButton(isLightMode);
}

// ======================================
// INITIALIZATION
// ======================================

loadTheme();
updateHistory();
updateFontSize();
