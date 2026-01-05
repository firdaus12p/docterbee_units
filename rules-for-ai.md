# RULES FOR GITHUB COPILOT / AI AGENT (ENGLISH VERSION)

This document defines the rules that MUST be followed by the AI when editing this codebase.

## 1. Main Goal

- Keep the codebase:
  - Maintainable
  - Consistent
  - Free from duplicated code
  - Stable and predictable
- Do not make unnecessary changes.
- Prioritize **stability** and **code cleanliness** over “fancy automation”.

---

## 2. General Principles for Editing Code

1. **Changes must be focused & minimal**
   - When fixing issue A, do not modify B or C unless strictly required.
   - Do not perform large refactors when the user only requested a small bug fix.

2. **Do not break other parts**
   - Before changing any code:
     - Analyze dependencies (where the function/component is used).
     - Use MCP Serena or reference tools to see all usages.
   - After changing code:
     - Ensure all call sites remain consistent.
     - Do not leave unreachable or unused code paths.

3. **Always explain significant changes**
   - When making important changes, add a short explanation in your response, such as:
     - “Replaced X with Y because …”
     - “Moved function A to file B to …”

4. **Respect existing architecture and style**
   - Follow the existing folder structure, naming conventions, and patterns.
   - Do not introduce new frameworks, libraries, or patterns unless explicitly requested by the user.

---

## 3. Using MCP Serena

1. **Always use MCP Serena to:**
   - Search for all usages of a function/component before modifying it.
   - Inspect the global project structure.
   - Assist in refactors that touch multiple files.
   - Check for code duplication that can be removed or unified.

2. **Before large refactors:**
   - Perform a global search to ensure changes won’t break dependencies.
   - If moving/changing a function, update all imports and call sites.

3. **After refactors:**
   - Run tests/build if possible.
   - If tests cannot be run, explicitly state that changes are not test-verified.

---

## 4. Duplication & Structure Cleanliness

1. **No duplicated code**
   - If you find the same or very similar logic in multiple places:
     - Extract it into a reusable function or component.
     - Replace all duplicates with calls to that function/component.
   - Avoid copy–pasting code across files without strong justification.

2. **Avoid convoluted logic**
   - Prefer simple and readable solutions.
   - Avoid deep nested `if` chains; use extracted helper functions when needed.

3. **No dead / unused code**
   - Do not leave unused functions, variables, or files.
   - If a function/component is no longer used, safely remove it.

---

## 5. Temporary, Backup, and Debug Files

1. **Never create permanent backup files**
   - Do not create files like:
     - `file_backup.js`, `file_old.ts`, `file_copy_final_fix.js`
     - `test_tmp_1.js`, `debug_log.js` that stay in the repo.
   - If you must create temporary files for debugging:
     - Remove them once the issue is fixed or the final change is applied.

2. **Avoid unnecessary debug logs**
   - `console.log` and excessive logging should only be used temporarily.
   - Remove debug logs once the fix is complete, keeping only meaningful logs if needed.

3. **Do not create fake/empty test files**
   - If you create a test file, ensure:
     - It contains meaningful assertions.
     - It validates real behavior, not just calls the function without checks.

---

## 6. Bug Fixing: Do Not Break Other Things

1. **When fixing A:**
   - Do not change B or C unless it is directly related to A.
   - If B or C must be changed, explain why in your response.

2. **Check side effects**
   - If a function/component is used widely:
     - Ensure its signature (parameters & return type) stays compatible.
     - If the signature must change, update all call sites.

3. **Avoid dirty hacks**
   - Do not add weird `if` conditions, hacks, or hard-coded values that break architecture.
   - Prefer small, clean refactors over hacky quick fixes.

---

## 7. Common AI/Copilot Issues to Avoid

1. **Using APIs/libraries not present in the project**
   - Do not call functions, packages, or hooks that are not installed or defined.
   - Always verify imports and dependencies exist in the codebase.

2. **Unnecessary style changes**
   - Do not reformat entire files if not requested.
   - Respect existing formatters and linters.

3. **Over-engineering abstractions**
   - Do not introduce new abstraction layers (services, helpers, hooks) without need.
   - Keep the solution as simple and clear as possible.

4. **Leaving old code around**
   - Do not keep large commented-out blocks or unused functions.

5. **Writing fake tests**
   - Do not create tests that:
     - Always pass without asserting anything.
     - Only call functions without real assertions.
   - Tests must validate important behavior.

6. **Renaming without updating all references**
   - If you rename variables, functions, or files:
     - Update all references.
     - Keep imports/exports consistent.

---

## 8. Clean Code & Maintainability

1. **Names must be meaningful**
   - Use descriptive names for variables, functions, and files.
   - Avoid overly generic names like `data`, `info`, `doStuff` unless context is extremely clear.

2. **Keep file structure consistent**
   - Place components, utilities, hooks, and services in their logical folders.
   - Do not mix unrelated concerns in the same file.

3. **Use comments sparingly and wisely**
   - Comment only where the intent is not obvious from code.
   - Do not explain what is already clear from good naming.

4. **Always write code for the next developer**
   - Assume another developer will maintain this project.
   - Write code that is easy to read, not just easy to generate.
