# Scientific Calculator Web Application

A modern, responsive, and beginner-friendly **Scientific Calculator Web App** built with HTML5, CSS3, JavaScript, and a Python Flask backend.

---

## 🌟 Features

### 1. Basic & Scientific Operations
- **Basic Math**: Addition (`+`), Subtraction (`−`), Multiplication (`×`), Division (`÷`), Percentage (`%`), Decimals (`.`), Parentheses (`(` and `)`).
- **Trigonometry**: Sine (`sin`), Cosine (`cos`), Tangent (`tan`), Inverse Sine (`sin⁻¹`), Inverse Cosine (`cos⁻¹`), Inverse Tangent (`tan⁻¹`).
- **Logarithms & Exponents**: Logarithm (`log`), Natural Logarithm (`ln`), Exponential (`eˣ`), Powers (`x²`, `x³`, `xʸ`).
- **Roots & Factorials**: Square Root (`√`), Cube Root (`∛`), Reciprocal (`1/x`), Factorial (`n!`).
- **Mathematical Constants**: Pi (`π`), Euler's constant (`e`).

### 2. Modern UX & Functionality
- 📐 **DEG / RAD Mode**: Toggle between Degree and Radian modes for trigonometric calculations.
- 📜 **Calculation History**: View past calculations and click to recall results instantly into the display.
- 🗑️ **Clear History**: One-click history reset button.
- 🌙 **Dark / Light Mode**: Seamless theme toggle for day/night usage.
- 🛡️ **Safe Math Evaluation Engine**: Built-in Shunting-Yard parser (no `eval()`), preventing crashes, `NaN`, or `Infinity` displays. Handles division-by-zero gracefully with user-friendly error messages.
- ⌨️ **Keyboard Shortcuts**: Supports full numeric, operator, parentheses, Backspace, Escape, and key combinations.

---

## 📁 Project Structure

```text
scientific-calculator/
│
├── app.py                  # Flask Web Server
├── requirements.txt        # Python Dependencies
├── README.md               # Documentation
│
├── templates/
│   └── index.html          # HTML Web Layout
│
└── static/
    ├── style.css           # Modern CSS Styles & Themes
    └── script.js            # JavaScript Calculator Engine & Shunting-Yard Evaluator
```

---

## 🚀 Installation & Running

### Prerequisites
- Python 3.8+ installed on your machine.

### Setup Instructions

1. **Clone or Navigate to Project Directory**:
   ```bash
   cd scientific-calculator
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run Flask Backend**:
   ```bash
   python app.py
   ```

4. **Open in Web Browser**:
   Open your browser and visit:
   ```text
   http://127.0.0.1:5000
   ```

---

## 💻 Technical Details

- **Frontend**: Standard Vanilla HTML5, CSS Grid/Flexbox, JavaScript (ES6+).
- **Math Engine**: Shunting-Yard algorithm parsing string input into Reverse Polish Notation (RPN) before evaluation. Floating-point precision issues like `0.1 + 0.2 = 0.30000000000000004` are automatically handled.
- **Backend**: Lightweight Python Flask development server.
