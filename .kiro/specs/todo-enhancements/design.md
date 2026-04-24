# Design Document — `todo-enhancements`

## Overview

This document describes the technical design for two enhancements to the Life Dashboard single-page application:

1. **Duplicate Task Prevention** — the To-Do List rejects a new task whose trimmed, lowercased text matches any existing task, and shows an inline error message beneath the input row.
2. **Light/Dark Mode Toggle** — a toggle button in the dashboard header switches the entire page between the existing light theme and a new dark theme, with the preference persisted in `localStorage` under the key `dashboard_theme`.

Both features are implemented entirely in the existing vanilla-JS / plain-CSS / single-HTML-file stack. No build tools, frameworks, or new dependencies are introduced.

---

## Architecture

The application is a single-page app with no module system. All logic lives in `js/script.js`, all styles in `css/style.css`, and the markup in `To-DoListLifeDashboard.html`. The architecture remains flat:

```
To-DoListLifeDashboard.html
├── css/style.css          ← all visual rules, including new dark-theme overrides
└── js/script.js           ← all behaviour, including duplicate check & theme manager
```

### Feature interaction map

```
User types task → addTask()
                    └─ Duplicate_Validator.isDuplicate(text, todos)
                          ├─ true  → showInlineError()  (no task added)
                          └─ false → hideInlineError() → persist → renderTodos()

User clicks Theme_Toggle → Theme_Manager.toggle()
                              ├─ flip body class  (dark-theme ↔ light-theme)
                              ├─ persist to localStorage["dashboard_theme"]
                              └─ update button label
```

---

## Components and Interfaces

### 2.1 Duplicate_Validator

A pure-function module (plain JS functions, no class needed) that encapsulates duplicate-detection logic.

```js
/**
 * Returns true if `candidate` (trimmed + lowercased) matches
 * the trimmed + lowercased text of any item in `todos`.
 *
 * @param {string}   candidate  - Raw text from the input field.
 * @param {Array<{text: string, done: boolean}>} todos - Current task list.
 * @returns {boolean}
 */
function isDuplicate(candidate, todos) { … }
```

Called inside `addTask()` before the task is pushed to the array.

### 2.2 Inline_Error element

A `<p>` element injected into the HTML immediately after the `.row` div:

```html
<p id="duplicate-error" class="duplicate-error" aria-live="polite" hidden>
  Task already exists!
</p>
```

- `hidden` attribute controls visibility (toggled by JS, not CSS `display`).
- `aria-live="polite"` announces the message to screen readers without interrupting.

**JS helpers:**

```js
function showDuplicateError() {
    document.getElementById('duplicate-error').hidden = false;
}
function hideDuplicateError() {
    document.getElementById('duplicate-error').hidden = true;
}
```

`hideDuplicateError()` is called:
- on every `input` event on `#input-box` (Requirement 1.4)
- on successful task addition (Requirement 1.5)

### 2.3 Theme_Manager

Encapsulates all theme logic:

```js
const STORAGE_KEY_THEME = 'dashboard_theme';
const DARK_CLASS        = 'dark-theme';

/**
 * Applies `theme` ('light' | 'dark') to the document and persists it.
 * Falls back to 'light' for any unrecognised value.
 *
 * @param {string} theme
 */
function applyTheme(theme) { … }

/**
 * Reads localStorage and applies the stored theme (or 'light' as default).
 * Called once on DOMContentLoaded, before first paint.
 */
function initTheme() { … }

/**
 * Toggles between 'light' and 'dark' and updates the button label.
 */
function toggleTheme() { … }

/**
 * Updates the Theme_Toggle button text to reflect the *next* action.
 * Dark active  → "☀️ Light Mode"
 * Light active → "🌙 Dark Mode"
 *
 * @param {string} currentTheme  'light' | 'dark'
 */
function updateToggleLabel(currentTheme) { … }
```

`initTheme()` is invoked at the top of the script (before `renderTodos()`) so the correct class is on `<body>` before any rendering occurs, preventing a flash of the wrong theme.

### 2.4 Theme_Toggle button

Added to the `.greeting-section` in the HTML:

```html
<button id="theme-toggle" onclick="toggleTheme()" aria-label="Switch to dark mode">
  🌙 Dark Mode
</button>
```

The `aria-label` is updated programmatically by `updateToggleLabel()` to match the current state.

---

## Data Models

### 3.1 Task (unchanged)

```ts
interface Task {
  text: string;   // raw text as entered by the user
  done: boolean;
}
```

Stored as a JSON array under `localStorage["dashboard_todos"]`. The Duplicate_Validator operates on the `text` field only; it does not mutate the stored data.

### 3.2 Theme preference

```ts
type ThemeValue = "light" | "dark";
```

Stored as a plain string under `localStorage["dashboard_theme"]`.

- Only the two string literals `"light"` and `"dark"` are written by the Theme_Manager.
- Any other value (including `null` / missing key) is treated as `"light"` (Requirement 3.3).

### 3.3 CSS class convention

| State | `<body>` class |
|---|---|
| Light_Theme (default) | *(no class)* |
| Dark_Theme | `dark-theme` |

The absence of the class is the light-theme sentinel, so no extra class is needed for the default state. All dark-theme overrides are scoped under `body.dark-theme { … }` in `style.css`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

