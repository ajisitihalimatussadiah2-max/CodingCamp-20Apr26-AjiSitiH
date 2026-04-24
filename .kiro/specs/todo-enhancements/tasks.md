# Implementation Plan: Todo Enhancements

## Overview

Implement two enhancements to the Life Dashboard by editing the three existing files only:
- `To-DoListLifeDashboard.html` — structural markup additions
- `js/script.js` — all new behaviour (duplicate check, theme manager)
- `css/style.css` — inline error styling and dark-theme overrides

No new files are created.

---

## Tasks

- [x] 1. Add inline error element to HTML
  - In `To-DoListLifeDashboard.html`, insert `<p id="duplicate-error" class="duplicate-error" aria-live="polite" hidden>Task already exists!</p>` immediately after the `.row` div inside `.todo-section`
  - _Requirements: 1.3_

- [x] 2. Add theme toggle button to HTML
  - In `To-DoListLifeDashboard.html`, insert `<button id="theme-toggle" onclick="toggleTheme()" aria-label="Switch to dark mode">🌙 Dark Mode</button>` inside `.greeting-section`, after the `#datetime-text` div
  - _Requirements: 2.1, 2.8, 2.9_

- [x] 3. Implement duplicate detection and inline error in `js/script.js`
  - [x] 3.1 Implement `isDuplicate(candidate, todos)` function
    - Returns `true` when `candidate.trim().toLowerCase()` matches the trimmed, lowercased `text` of any item in `todos`
    - _Requirements: 1.1, 1.7_
  - [x] 3.2 Implement `showDuplicateError()` and `hideDuplicateError()` helpers
    - Toggle the `hidden` attribute on `#duplicate-error`
    - _Requirements: 1.3, 1.4, 1.5_
  - [x] 3.3 Update `addTask()` to use duplicate detection
    - After the empty-input guard, call `isDuplicate(text, todos)`; if `true`, call `showDuplicateError()` and return early without adding the task
    - On successful add, call `hideDuplicateError()` before returning
    - _Requirements: 1.2, 1.3, 1.5, 1.6_
  - [x] 3.4 Attach `input` event listener on `#input-box` to call `hideDuplicateError()`
    - Add listener so any keystroke after a duplicate error clears the message
    - _Requirements: 1.4_
  - [ ]* 3.5 Write unit tests for `isDuplicate`
    - Test: exact match returns `true`
    - Test: case-insensitive match returns `true` (e.g. "Buy milk" vs "buy milk")
    - Test: no match returns `false`
    - Test: empty candidate with non-empty list returns `false`
    - _Requirements: 1.1, 1.7_

- [x] 4. Checkpoint — verify duplicate prevention
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Theme_Manager in `js/script.js`
  - [x] 5.1 Declare `STORAGE_KEY_THEME` and `DARK_CLASS` constants
    - `STORAGE_KEY_THEME = 'dashboard_theme'`, `DARK_CLASS = 'dark-theme'`
    - _Requirements: 2.5, 3.1_
  - [x] 5.2 Implement `applyTheme(theme)`
    - If `theme === 'dark'`, add `dark-theme` class to `<body>` and persist `"dark"` to `localStorage`
    - Otherwise (including unrecognised values), remove `dark-theme` class and persist `"light"`
    - Call `updateToggleLabel(theme)` at the end
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 3.1, 3.3_
  - [x] 5.3 Implement `initTheme()`
    - Read `localStorage.getItem('dashboard_theme')`; pass the value (or `'light'` if null) to `applyTheme()`
    - _Requirements: 2.6, 2.7, 3.2_
  - [x] 5.4 Implement `toggleTheme()`
    - Read current state from `document.body.classList.contains(DARK_CLASS)`; call `applyTheme('light')` or `applyTheme('dark')` accordingly
    - _Requirements: 2.2_
  - [x] 5.5 Implement `updateToggleLabel(currentTheme)`
    - When `currentTheme === 'dark'`: set button `textContent` to `"☀️ Light Mode"` and `aria-label` to `"Switch to light mode"`
    - Otherwise: set button `textContent` to `"🌙 Dark Mode"` and `aria-label` to `"Switch to dark mode"`
    - _Requirements: 2.8, 2.9_
  - [x] 5.6 Call `initTheme()` near the top of the script, before `renderTodos()`
    - Ensures the correct class is on `<body>` before any rendering, preventing a flash of the wrong theme
    - _Requirements: 2.6_
  - [ ]* 5.7 Write unit tests for Theme_Manager
    - Test: `applyTheme('dark')` adds `dark-theme` class to body and writes `"dark"` to localStorage
    - Test: `applyTheme('light')` removes `dark-theme` class and writes `"light"` to localStorage
    - Test: `applyTheme('unknown')` falls back to light theme
    - Test: `initTheme()` with no stored value defaults to light theme
    - Test: `initTheme()` with stored `"dark"` applies dark theme
    - Test: `toggleTheme()` switches from light to dark and back
    - _Requirements: 2.2, 2.6, 2.7, 3.1, 3.2, 3.3_

- [x] 6. Add dark-theme CSS overrides to `css/style.css`
  - [x] 6.1 Add `body.dark-theme` rule
    - Override `background` to a dark solid color (e.g. `#1a1a2e`)
    - Override `color` to a light value (e.g. `#e0e0e0`)
    - _Requirements: 2.3, 2.4_
  - [x] 6.2 Add `body.dark-theme .timer-section` and `body.dark-theme .todo-section` rules
    - Override `background` to a dark card color (e.g. `#16213e`)
    - Override `color` to match the body light text
    - _Requirements: 2.3, 2.4_
  - [x] 6.3 Add `body.dark-theme` overrides for headings and other text elements
    - Ensure `h2`, `.countdown`, and any other dark-colored text elements are readable on the dark background
    - _Requirements: 2.3_
  - [x] 6.4 Add `body.dark-theme .row` and `body.dark-theme .task-edit` overrides
    - Override the light-grey input row background to a darker shade so it remains visible
    - _Requirements: 2.3_

- [x] 7. Add inline error styling to `css/style.css`
  - Add `.duplicate-error` rule: visible red text, small font, margin beneath the `.row`, and `display: none` equivalent handled via the `[hidden]` attribute (ensure `[hidden] { display: none }` is present or rely on browser default)
  - _Requirements: 1.3_

- [x] 8. Final checkpoint — full integration
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All changes are confined to the three existing files; no new files are created
- `initTheme()` must be called before `renderTodos()` to avoid a theme flash on load
- The `hidden` HTML attribute is used for the inline error (not a CSS class) so screen readers respect it via `aria-live="polite"`
- Dark-theme overrides are all scoped under `body.dark-theme { … }` to avoid affecting the light theme
