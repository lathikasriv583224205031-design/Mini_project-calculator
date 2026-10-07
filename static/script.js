/**
 * Scientific Calculator Web Application
 * Full-stack beginner mini project JavaScript engine.
 *
 * Core Features:
 * 1. Shunting-Yard algorithm math parser (eval-free security & safety)
 * 2. DEG/RAD angle mode support for trig & inverse trig functions
 * 3. Division-by-zero & domain error detection (No NaN or Infinity output)
 * 4. Keyboard shortcuts & rich interactive UI
 * 5. Calculation history logging with recall & clear functions
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. STATE VARIABLES
    // ==========================================
    let expression = '';        // Current mathematical expression string shown on display
    let lastResult = null;       // Stores previous evaluation result
    let isDegreeMode = true;    // true = DEG, false = RAD
    let isSecondMode = false;   // true = 2nd inverse function mode enabled
    let isEvaluated = false;    // true if result display currently shows final evaluation
    let historyList = [];       // Calculation history records array

    // ==========================================
    // 2. DOM ELEMENT REFERENCES
    // ==========================================
    const expressionDisplay = document.getElementById('expression-display');
    const resultDisplay = document.getElementById('result-display');
    const statusModeBadge = document.getElementById('status-mode');
    const status2ndBadge = document.getElementById('status-2nd');

    const modeToggleBtn = document.getElementById('mode-toggle-btn');
    const degIndicator = document.getElementById('deg-indicator');
    const radIndicator = document.getElementById('rad-indicator');
    const secondFnBtn = document.getElementById('second-fn-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const historyToggleBtn = document.getElementById('history-toggle-btn');
    const historyPanel = document.getElementById('history-panel');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const historyUl = document.getElementById('history-list');

    const keypad = document.querySelector('.calculator-keypad');

    // ==========================================
    // 3. UI DISPLAY UPDATES & STATE HELPERS
    // ==========================================

    /**
     * Updates the calculator screen with expression & result
     * @param {string} resText Optional custom result text or error message
     * @param {boolean} isError Sets red text color for error states
     */
    function updateDisplay(resText = null, isError = false) {
        expressionDisplay.textContent = expression || '';
        
        if (resText !== null) {
            resultDisplay.textContent = resText;
        } else if (expression === '') {
            resultDisplay.textContent = '0';
        }

        if (isError) {
            resultDisplay.classList.add('error-text');
        } else {
            resultDisplay.classList.remove('error-text');
        }

        // Scroll display lines to the right as input grows
        expressionDisplay.scrollLeft = expressionDisplay.scrollWidth;
        resultDisplay.scrollLeft = resultDisplay.scrollWidth;
    }

    /**
     * Toggles between DEG and RAD trigonometric modes
     */
    function toggleAngleMode() {
        isDegreeMode = !isDegreeMode;
        if (isDegreeMode) {
            modeToggleBtn.className = 'mode-btn active-deg';
            degIndicator.classList.add('active');
            radIndicator.classList.remove('active');
            statusModeBadge.textContent = 'DEG';
        } else {
            modeToggleBtn.className = 'mode-btn active-rad';
            radIndicator.classList.add('active');
            degIndicator.classList.remove('active');
            statusModeBadge.textContent = 'RAD';
        }
    }

    /**
     * Toggles 2nd mode for inverse trig functions
     */
    function toggle2ndMode() {
        isSecondMode = !isSecondMode;
        if (isSecondMode) {
            document.body.classList.add('mode-2nd-active');
            secondFnBtn.classList.add('active');
            status2ndBadge.classList.remove('badge-hidden');
        } else {
            document.body.classList.remove('mode-2nd-active');
            secondFnBtn.classList.remove('active');
            status2ndBadge.classList.add('badge-hidden');
        }
    }

    // ==========================================
    // 4. MATHEMATICAL ENGINE & EVALUATOR
    // ==========================================

    /**
     * Tokenizes raw mathematical string into numbers, functions & operators
     * @param {string} expr Input expression string
     * @returns {Array} Array of token objects
     */
    function tokenize(expr) {
        // Normalize visual unicode symbols into standard math symbols
        let cleanExpr = expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/sin⁻¹\(/g, 'asin(')
            .replace(/cos⁻¹\(/g, 'acos(')
            .replace(/tan⁻¹\(/g, 'atan(')
            .replace(/√\(/g, 'sqrt(')
            .replace(/1\/\(/g, 'inv(')
            .replace(/e\^\(/g, 'exp(')
            .replace(/π/g, ' PI ')
            .replace(/e/g, ' E ');

        const rawTokens = [];
        let i = 0;

        while (i < cleanExpr.length) {
            const ch = cleanExpr[i];

            // Skip spaces
            if (/\s/.test(ch)) {
                i++;
                continue;
            }

            // Numeric literals (e.g. 123, 45.67)
            if (/[0-9\.]/.test(ch)) {
                let numStr = '';
                while (i < cleanExpr.length && /[0-9\.]/.test(cleanExpr[i])) {
                    numStr += cleanExpr[i];
                    i++;
                }
                if ((numStr.match(/\./g) || []).length > 1) {
                    throw new Error("Invalid Expression");
                }
                rawTokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
                continue;
            }

            // Word identifiers (constants PI, E or function names sin, cos, etc.)
            if (/[a-zA-Z]/.test(ch)) {
                let word = '';
                while (i < cleanExpr.length && /[a-zA-Z0-9]/.test(cleanExpr[i])) {
                    word += cleanExpr[i];
                    i++;
                }

                if (word === 'PI') {
                    rawTokens.push({ type: 'NUMBER', value: Math.PI });
                } else if (word === 'E') {
                    rawTokens.push({ type: 'NUMBER', value: Math.E });
                } else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'exp', 'inv', 'cbrt'].includes(word)) {
                    rawTokens.push({ type: 'FUNCTION', value: word });
                } else {
                    throw new Error("Invalid Expression");
                }
                continue;
            }

            // Operators
            if (['+', '-', '*', '/', '%', '^', '!'].includes(ch)) {
                rawTokens.push({ type: 'OPERATOR', value: ch });
                i++;
                continue;
            }

            // Parentheses
            if (ch === '(') {
                rawTokens.push({ type: 'LPAREN', value: '(' });
                i++;
                continue;
            }
            if (ch === ')') {
                rawTokens.push({ type: 'RPAREN', value: ')' });
                i++;
                continue;
            }

            throw new Error("Invalid Expression");
        }

        // Insert implicit multiplication (e.g. 2PI -> 2 * PI, 3(4+5) -> 3 * (4+5), 5sin(30) -> 5 * sin(30))
        const tokens = [];
        for (let j = 0; j < rawTokens.length; j++) {
            const curr = rawTokens[j];
            tokens.push(curr);

            if (j < rawTokens.length - 1) {
                const next = rawTokens[j + 1];

                const currCanMultiply = (curr.type === 'NUMBER' || curr.type === 'RPAREN' || (curr.type === 'OPERATOR' && curr.value === '!'));
                const nextCanMultiply = (next.type === 'NUMBER' || next.type === 'FUNCTION' || next.type === 'LPAREN');

                if (currCanMultiply && nextCanMultiply) {
                    tokens.push({ type: 'OPERATOR', value: '*' });
                }
            }
        }

        // Convert unary minus/plus signs
        const finalTokens = [];
        for (let k = 0; k < tokens.length; k++) {
            const t = tokens[k];
            if (t.type === 'OPERATOR' && (t.value === '-' || t.value === '+')) {
                const prev = k > 0 ? tokens[k - 1] : null;
                const isUnary = !prev || prev.type === 'OPERATOR' || prev.type === 'LPAREN' || prev.type === 'FUNCTION';
                
                if (isUnary) {
                    if (t.value === '-') {
                        finalTokens.push({ type: 'UNARY_MINUS', value: 'u-' });
                    }
                    // ignore unary plus
                    continue;
                }
            }
            finalTokens.push(t);
        }

        return finalTokens;
    }

    /**
     * Shunting-Yard Algorithm: Converts tokens to Reverse Polish Notation (RPN)
     */
    function toRPN(tokens) {
        const outputQueue = [];
        const operatorStack = [];

        const precedence = {
            '!': 5,
            'u-': 4,
            '^': 4,
            '*': 3,
            '/': 3,
            '%': 3,
            '+': 2,
            '-': 2
        };

        const rightAssociative = {
            'u-': true,
            '^': true
        };

        for (const token of tokens) {
            if (token.type === 'NUMBER') {
                outputQueue.push(token);
            } else if (token.type === 'FUNCTION') {
                operatorStack.push(token);
            } else if (token.type === 'OPERATOR' || token.type === 'UNARY_MINUS') {
                const p1 = precedence[token.value];
                while (operatorStack.length > 0) {
                    const top = operatorStack[operatorStack.length - 1];
                    if (top.type === 'LPAREN') break;

                    if (top.type === 'FUNCTION') {
                        outputQueue.push(operatorStack.pop());
                        continue;
                    }

                    const p2 = precedence[top.value];
                    if (p2 > p1 || (p2 === p1 && !rightAssociative[token.value])) {
                        outputQueue.push(operatorStack.pop());
                    } else {
                        break;
                    }
                }
                operatorStack.push(token);
            } else if (token.type === 'LPAREN') {
                operatorStack.push(token);
            } else if (token.type === 'RPAREN') {
                let foundParen = false;
                while (operatorStack.length > 0) {
                    const top = operatorStack.pop();
                    if (top.type === 'LPAREN') {
                        foundParen = true;
                        break;
                    }
                    outputQueue.push(top);
                }
                if (!foundParen) {
                    throw new Error("Unbalanced Parentheses");
                }
                if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
                    outputQueue.push(operatorStack.pop());
                }
            }
        }

        while (operatorStack.length > 0) {
            const top = operatorStack.pop();
            if (top.type === 'LPAREN' || top.type === 'RPAREN') {
                throw new Error("Unbalanced Parentheses");
            }
            outputQueue.push(top);
        }

        return outputQueue;
    }

    /**
     * Evaluates RPN Queue into a single number
     */
    function evaluateRPN(rpnQueue) {
        const stack = [];

        for (const token of rpnQueue) {
            if (token.type === 'NUMBER') {
                stack.push(token.value);
            } else if (token.type === 'UNARY_MINUS') {
                if (stack.length < 1) throw new Error("Invalid Expression");
                const val = stack.pop();
                stack.push(-val);
            } else if (token.type === 'OPERATOR') {
                if (token.value === '!') { // Postfix Factorial
                    if (stack.length < 1) throw new Error("Invalid Expression");
                    const n = stack.pop();
                    if (n < 0 || !Number.isInteger(n)) {
                        throw new Error("Domain Error");
                    }
                    if (n > 170) {
                        throw new Error("Overflow Error");
                    }
                    let fact = 1;
                    for (let i = 2; i <= n; i++) fact *= i;
                    stack.push(fact);
                } else {
                    if (stack.length < 2) throw new Error("Invalid Expression");
                    const b = stack.pop();
                    const a = stack.pop();

                    switch (token.value) {
                        case '+': stack.push(a + b); break;
                        case '-': stack.push(a - b); break;
                        case '*': stack.push(a * b); break;
                        case '/':
                            if (b === 0) throw new Error("Cannot divide by 0");
                            stack.push(a / b);
                            break;
                        case '%':
                            if (b === 0) throw new Error("Cannot divide by 0");
                            stack.push(a % b);
                            break;
                        case '^':
                            const powVal = Math.pow(a, b);
                            if (isNaN(powVal)) throw new Error("Domain Error");
                            stack.push(powVal);
                            break;
                    }
                }
            } else if (token.type === 'FUNCTION') {
                if (stack.length < 1) throw new Error("Invalid Expression");
                const x = stack.pop();
                let res;

                switch (token.value) {
                    case 'sin':
                        res = isDegreeMode ? sinDeg(x) : Math.sin(x);
                        if (Math.abs(res) < 1e-15) res = 0;
                        break;
                    case 'cos':
                        res = isDegreeMode ? cosDeg(x) : Math.cos(x);
                        if (Math.abs(res) < 1e-15) res = 0;
                        break;
                    case 'tan':
                        if (isDegreeMode) {
                            let norm = Math.abs(x % 180);
                            if (Math.abs(norm - 90) < 1e-9) {
                                throw new Error("Cannot divide by 0");
                            }
                            res = Math.tan(x * Math.PI / 180);
                        } else {
                            res = Math.tan(x);
                        }
                        break;
                    case 'asin':
                        if (x < -1 || x > 1) throw new Error("Domain Error");
                        res = Math.asin(x);
                        if (isDegreeMode) res = res * (180 / Math.PI);
                        break;
                    case 'acos':
                        if (x < -1 || x > 1) throw new Error("Domain Error");
                        res = Math.acos(x);
                        if (isDegreeMode) res = res * (180 / Math.PI);
                        break;
                    case 'atan':
                        res = Math.atan(x);
                        if (isDegreeMode) res = res * (180 / Math.PI);
                        break;
                    case 'log':
                        if (x <= 0) throw new Error("Domain Error");
                        res = Math.log10(x);
                        break;
                    case 'ln':
                        if (x <= 0) throw new Error("Domain Error");
                        res = Math.log(x);
                        break;
                    case 'sqrt':
                        if (x < 0) throw new Error("Domain Error");
                        res = Math.sqrt(x);
                        break;
                    case 'cbrt':
                        res = Math.cbrt(x);
                        break;
                    case 'exp':
                        res = Math.exp(x);
                        break;
                    case 'inv':
                        if (x === 0) throw new Error("Cannot divide by 0");
                        res = 1 / x;
                        break;
                }
                stack.push(res);
            }
        }

        if (stack.length !== 1) throw new Error("Invalid Expression");

        const finalVal = stack[0];

        if (isNaN(finalVal)) throw new Error("Invalid Input");
        if (!isFinite(finalVal)) throw new Error("Cannot divide by 0");

        return finalVal;
    }

    // Exact degree trig helpers
    function sinDeg(deg) {
        let norm = deg % 360;
        if (norm < 0) norm += 360;
        if (norm === 0 || norm === 180) return 0;
        if (norm === 90) return 1;
        if (norm === 270) return -1;
        return Math.sin(deg * Math.PI / 180);
    }

    function cosDeg(deg) {
        let norm = deg % 360;
        if (norm < 0) norm += 360;
        if (norm === 90 || norm === 270) return 0;
        if (norm === 0) return 1;
        if (norm === 180) return -1;
        return Math.cos(deg * Math.PI / 180);
    }

    /**
     * Formats floating numbers nicely, resolving float precision errors (e.g. 0.1 + 0.2 = 0.3)
     */
    function formatResultNumber(num) {
        if (Math.abs(num) < 1e-12 && num !== 0) return '0';
        // Use 12 significant digits precision
        const formatted = parseFloat(num.toPrecision(12)).toString();
        return formatted;
    }

    /**
     * Master function to evaluate expression string
     */
    function calculate() {
        if (!expression.trim()) return;

        try {
            const tokens = tokenize(expression);
            const rpn = toRPN(tokens);
            const numResult = evaluateRPN(rpn);
            const formattedResult = formatResultNumber(numResult);

            // Log to History
            addHistoryRecord(expression, formattedResult);

            lastResult = formattedResult;
            updateDisplay(formattedResult, false);
            isEvaluated = true;
        } catch (err) {
            updateDisplay(err.message || "Invalid Expression", true);
            isEvaluated = true;
        }
    }

    // ==========================================
    // 5. INPUT HANDLING & ACTIONS
    // ==========================================

    function appendInput(str) {
        if (isEvaluated) {
            // If user clicks a digit after evaluation, clear and start fresh
            if (/[0-9\.]|sin|cos|tan|log|ln|√|π|e/.test(str) && !isOperator(str)) {
                expression = '';
            } else if (lastResult !== null && isOperator(str)) {
                // If user clicks operator after evaluation, chain previous result
                expression = lastResult;
            }
            isEvaluated = false;
        }
        expression += str;
        updateDisplay();
    }

    function isOperator(char) {
        return ['+', '−', '×', '÷', '^', '%'].some(op => char.includes(op));
    }

    function handleClear() {
        expression = '';
        lastResult = null;
        isEvaluated = false;
        updateDisplay('0');
    }

    function handleDelete() {
        if (isEvaluated) {
            handleClear();
            return;
        }

        if (!expression) return;

        // Smart multi-char function deletion (e.g. sin⁻¹(, cos⁻¹(, sin(, sqrt()
        const fnPatterns = ['sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sqrt(', 'log(', 'cbrt(', 'sin(', 'cos(', 'tan(', '1/(', 'e^('];
        let deletedFn = false;

        for (const pattern of fnPatterns) {
            if (expression.endsWith(pattern)) {
                expression = expression.slice(0, -pattern.length);
                deletedFn = true;
                break;
            }
        }

        if (!deletedFn) {
            // Remove single trailing character
            expression = expression.slice(0, -1);
        }

        updateDisplay();
    }

    function handleButtonClick(action, value, secondAction) {
        // If 2nd mode is active and secondary action exists
        let activeAction = (isSecondMode && secondAction) ? secondAction : action;

        switch (activeAction) {
            case 'number':
                appendInput(value);
                break;
            case 'decimal':
                appendInput('.');
                break;
            case 'operator':
                appendInput(` ${value} `);
                break;
            case 'sin': appendInput('sin('); break;
            case 'cos': appendInput('cos('); break;
            case 'tan': appendInput('tan('); break;
            case 'asin': appendInput('sin⁻¹('); break;
            case 'acos': appendInput('cos⁻¹('); break;
            case 'atan': appendInput('tan⁻¹('); break;
            case 'log': appendInput('log('); break;
            case 'ln': appendInput('ln('); break;
            case 'pow10': appendInput('10^('); break;
            case 'exp': appendInput('e^('); break;
            case 'sqrt': appendInput('√('); break;
            case 'cbrt': appendInput('cbrt('); break;
            case 'square': appendInput('^2'); break;
            case 'cube': appendInput('^3'); break;
            case 'power': appendInput('^'); break;
            case 'reciprocal': appendInput('1/('); break;
            case 'factorial': appendInput('!'); break;
            case 'pi': appendInput('π'); break;
            case 'e': appendInput('e'); break;
            case 'percent': appendInput('%'); break;
            case 'paren-open': appendInput('('); break;
            case 'paren-close': appendInput(')'); break;
            case 'clear': handleClear(); break;
            case 'delete': handleDelete(); break;
            case 'equals': calculate(); break;
        }

        // Auto-disable 2nd mode after function press
        if (isSecondMode && secondAction) {
            toggle2ndMode();
        }
    }

    // ==========================================
    // 6. KEYBOARD EVENT LISTENERS
    // ==========================================

    document.addEventListener('keydown', (e) => {
        // Prevent default browser shortcuts for math keys
        if (['/', '*', '+', '-', '=', 'Enter', 'Backspace', 'Escape'].includes(e.key)) {
            // Allow native input focus if user ever focuses outside
        }

        const key = e.key;

        if (key >= '0' && key <= '9') {
            appendInput(key);
        } else if (key === '.') {
            appendInput('.');
        } else if (key === '+') {
            appendInput(' + ');
        } else if (key === '-') {
            appendInput(' − ');
        } else if (key === '*') {
            appendInput(' × ');
        } else if (key === '/') {
            e.preventDefault();
            appendInput(' ÷ ');
        } else if (key === '%') {
            appendInput('%');
        } else if (key === '^') {
            appendInput('^');
        } else if (key === '(' || key === ')') {
            appendInput(key);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculate();
        } else if (key === 'Backspace') {
            e.preventDefault();
            handleDelete();
        } else if (key === 'Escape' || key.toLowerCase() === 'c') {
            e.preventDefault();
            handleClear();
        } else if (key.toLowerCase() === 's') {
            appendInput('sin(');
        } else if (key.toLowerCase() === 'l') {
            appendInput('log(');
        } else if (key.toLowerCase() === 'p') {
            appendInput('π');
        }
    });

    // Event Delegation for Calculator Buttons
    keypad.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;

        const action = btn.dataset.action;
        const value = btn.dataset.value;
        const secondAction = btn.dataset.secondAction;

        handleButtonClick(action, value, secondAction);
    });

    // Control Bar Buttons
    modeToggleBtn.addEventListener('click', toggleAngleMode);
    secondFnBtn.addEventListener('click', toggle2ndMode);

    // Theme Toggle
    themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.replace('dark-theme', 'light-theme');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            document.body.classList.replace('light-theme', 'dark-theme');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    });

    // History Toggle & Drawer Controls
    historyToggleBtn.addEventListener('click', () => {
        historyPanel.classList.toggle('hidden');
    });

    closeHistoryBtn.addEventListener('click', () => {
        historyPanel.classList.add('hidden');
    });

    clearHistoryBtn.addEventListener('click', () => {
        historyList = [];
        renderHistory();
    });

    // ==========================================
    // 7. CALCULATION HISTORY FUNCTIONS
    // ==========================================

    function addHistoryRecord(exprStr, resStr) {
        historyList.unshift({
            expression: exprStr,
            result: resStr,
            mode: isDegreeMode ? 'DEG' : 'RAD'
        });
        if (historyList.length > 20) historyList.pop(); // Keep top 20
        renderHistory();
    }

    function renderHistory() {
        if (historyList.length === 0) {
            historyUl.innerHTML = '<li class="empty-history-msg">No calculations yet</li>';
            return;
        }

        historyUl.innerHTML = historyList.map((item, index) => `
            <li class="history-item" data-index="${index}">
                <div class="history-expr">${item.expression} (${item.mode})</div>
                <div class="history-res">= ${item.result}</div>
            </li>
        `).join('');
    }

    // Clicking a history entry recalls expression into display
    historyUl.addEventListener('click', (e) => {
        const itemLi = e.target.closest('.history-item');
        if (!itemLi) return;

        const idx = itemLi.dataset.index;
        const record = historyList[idx];
        if (record) {
            expression = record.result;
            isEvaluated = true;
            updateDisplay();
        }
    });

    // Initial Display Setup
    updateDisplay();
});
