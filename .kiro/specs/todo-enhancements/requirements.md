# Requirements Document

## Introduction

This document covers two enhancements to the Life Dashboard single-page application:

1. **Duplicate Task Prevention** — the To-Do List must reject attempts to add a task whose text matches an existing task (case-insensitive), and must inform the user with a clear inline message.
2. **Light/Dark Mode Toggle** — a toggle button that switches the entire dashboard between the existing light theme and a new dark theme, with the chosen preference persisted in `localStorage` so it survives page reloads.

---

## Glossary

- **Dashboard**: The single-page Life Dashboard application (`To-DoListLifeDashboard.html`).
- **To-Do List**: The task-management section of the Dashboard rendered inside `.todo-section`.
- **Task**: A single to-do item stored as `{ text: string, done: boolean }` in `localStorage` under the key `dashboard_todos`.
- **Task_Input**: The `<input id="input-box">` element used to type a new task.
- **Duplicate_Validator**: The logic component responsible for comparing a candidate task text against existing tasks.
- **Inline_Error**: A non-modal, in-page message element displayed beneath the Task_Input row.
- **Theme_Toggle**: The button element that switches the Dashboard between light and dark themes.
- **Theme_Manager**: The logic component responsible for applying, persisting, and restoring the active theme.
- **Light_Theme**: The default visual theme — green/blue gradient background, white card sections, dark text.
- **Dark_Theme**: The alternative visual theme — dark background, dark card sections, light text.
- **localStorage**: The browser Web Storage API used for client-side persistence.

---

## Requirements

### Requirement 1: Prevent Duplicate Tasks

**User Story:** As a user, I want the To-Do List to block me from adding a task that already exists, so that my list stays clean and free of repeated entries.

#### Acceptance Criteria

1. WHEN the user submits a new task, THE Duplicate_Validator SHALL compare the trimmed, lowercased candidate text against the trimmed, lowercased text of every existing Task.
2. IF the candidate task text matches an existing Task (case-insensitive), THEN THE To-Do List SHALL not add the task to the list.
3. IF the candidate task text matches an existing Task (case-insensitive), THEN THE To-Do List SHALL display an Inline_Error message reading "Task already exists!" beneath the Task_Input row.
4. WHEN the user modifies the text in Task_Input after a duplicate is detected, THE To-Do List SHALL hide the Inline_Error.
5. WHEN the user successfully adds a non-duplicate task, THE To-Do List SHALL hide the Inline_Error.
6. WHEN the user submits a task whose trimmed text is empty, THE To-Do List SHALL not display the duplicate Inline_Error (empty-input handling is unchanged).
7. THE Duplicate_Validator SHALL treat tasks that differ only in letter case as duplicates (e.g., "Buy milk" and "buy milk" are the same task).

---

### Requirement 2: Light/Dark Mode Toggle

**User Story:** As a user, I want to switch the Dashboard between a light and a dark theme, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL render a Theme_Toggle button that is visible and accessible at all times.
2. WHEN the user activates the Theme_Toggle, THE Theme_Manager SHALL switch the active theme from Light_Theme to Dark_Theme, or from Dark_Theme to Light_Theme.
3. WHEN Dark_Theme is active, THE Dashboard SHALL apply a dark background color to the `<body>`, dark background colors to all card sections (`.timer-section`, `.todo-section`), and light text colors to all visible text.
4. WHEN Light_Theme is active, THE Dashboard SHALL restore the original green/blue gradient background, white card backgrounds, and dark text colors.
5. WHEN the user activates the Theme_Toggle, THE Theme_Manager SHALL persist the selected theme preference in `localStorage` under the key `dashboard_theme`.
6. WHEN the Dashboard loads, THE Theme_Manager SHALL read the `dashboard_theme` key from `localStorage` and apply the stored theme before the first paint.
7. IF no theme preference is stored in `localStorage`, THE Theme_Manager SHALL apply Light_Theme as the default.
8. WHEN Dark_Theme is active, THE Theme_Toggle SHALL display a label or icon indicating that clicking it will switch to Light_Theme (e.g., "☀️ Light Mode").
9. WHEN Light_Theme is active, THE Theme_Toggle SHALL display a label or icon indicating that clicking it will switch to Dark_Theme (e.g., "🌙 Dark Mode").

---

### Requirement 3: Theme Persistence Round-Trip

**User Story:** As a user, I want my theme preference to be remembered across sessions, so that I do not have to re-select my preferred theme every time I open the Dashboard.

#### Acceptance Criteria

1. THE Theme_Manager SHALL write exactly one of the string values `"light"` or `"dark"` to `localStorage` under the key `dashboard_theme` when a theme is applied.
2. FOR ALL theme values written by the Theme_Manager, reading the `dashboard_theme` key from `localStorage` and applying it SHALL produce the same visual theme that was active when the value was written (round-trip property).
3. WHEN `localStorage` contains an unrecognised value under `dashboard_theme`, THE Theme_Manager SHALL fall back to Light_Theme.
