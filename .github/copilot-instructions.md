# COPILOT EDITS OPERATIONAL GUIDELINES

## GOAL

    Copilot must generate modern, secure, and clean code that follows best practices, KISS principles, and WCAG 2.2 standards (for frontend).
    The code should be thoroughly reviewed, avoid outdated patterns, and be easy to read and maintain.

## PRIME DIRECTIVE

    Avoid working on more than one file at a time.
    Multiple simultaneous edits to a file will cause corruption.
    Be chatting and teach about what you are doing while coding.

## LARGE FILE & COMPLEX CHANGE PROTOCOL

### MANDATORY PLANNING PHASE

    When working with large files (>300 lines) or complex changes:
    	1. ALWAYS start by creating a detailed plan BEFORE making any edits
            2. Your plan MUST include:
                   - All functions/sections that need modification
                   - The order in which changes should be applied
                   - Dependencies between changes
                   - Estimated number of separate edits required

            3. Format your plan as:

## PROPOSED EDIT PLAN

    Working with: [filename]
    Total planned edits: [number]

### MAKING EDITS

    - Focus on one conceptual change at a time
    - Show clear "before" and "after" snippets when proposing changes
    - Include concise explanations of what changed and why
    - Always check if the edit maintains the project's coding style

### Edit sequence:

    1. [First specific change] - Purpose: [why]
    2. [Second specific change] - Purpose: [why]
    3. Do you approve this plan? I'll proceed with Edit [number] after your confirmation.
    4. WAIT for explicit user confirmation before making ANY edits when user ok edit [number]

### EXECUTION PHASE

    - After each individual edit, clearly indicate progress:
    	"✅ Completed edit [#] of [total]. Ready for next edit?"
    - If you discover additional needed changes during editing:
    - STOP and update the plan
    - Get approval before continuing

### REFACTORING GUIDANCE

    When refactoring large files:
    - Break work into logical, independently functional chunks
    - Ensure each intermediate state maintains functionality
    - Consider temporary duplication as a valid interim step
    - Always indicate the refactoring pattern being applied

### RATE LIMIT AVOIDANCE

    - For very large files, suggest splitting changes across multiple sessions
    - Prioritize changes that are logically complete units
    - Always provide clear stopping points

## General Requirements

    Use modern technologies as described below for all code suggestions. Prioritize clean, maintainable code with appropriate comments.

### Accessibility

    - Ensure compliance with **WCAG 2.1** AA level minimum, AAA whenever feasible.
    - Always suggest:
    - Labels for form fields.
    - Proper **ARIA** roles and attributes.
    - Adequate color contrast.
    - Alternative texts (`alt`, `aria-label`) for media elements.
    - Semantic HTML for clear structure.
    - Tools like **Lighthouse** for audits.

## Browser Compatibility

    - Prioritize feature detection (`if ('fetch' in window)` etc.).
        - Support latest two stable releases of major browsers:
    - Firefox, Chrome, Edge, Safari (macOS/iOS)

## Requirements React + Vite + TailwindCSS + TypeScript + JWT + React Router

    - Modern and Clean Code
        - Always use latest stable features of React, Vite, and TypeScript.
        - Follow KISS principle – keep code simple, clean, and easy to maintain.
        - Avoid outdated patterns like class components and legacy lifecycle methods.
        - Use React hooks and modern state management (Context API or Redux Toolkit if needed).

    - Code Quality
        - Follow best practices for component structure and file organization.
        - Ensure code is modular, reusable, and adheres to the DRY principle.
        - Include comments and documentation where necessary for clarity.
        - Use TailwindCSS utility classes effectively for styling; avoid inline styles.
    - Performance
        - Optimize rendering performance by using `React.memo`, `useMemo`, and `useCallback` where appropriate.
        - Lazy load components and routes to improve initial load times.
        - Split large files into small, reusable components.
        - Ensure fast loading times by leveraging Vite optimizations.
    - Project Structure
        - Follow Feature-Sliced Design (FSD) for folder and module structure
        - Keep components and logic modular and scalable
    - UI & Styling
        - Use shadcn/ui for modern, accessible UI components.
        - Style with Tailwind CSS, keeping styles consistent and responsive.
        - Maintain WCAG 2.2 accessibility standards (keyboard navigation, ARIA attributes, contrast).
    - Security
        - Sanitize all user inputs in forms and UI interactions.
        - Never expose sensitive data or API keys in the frontend.
        - Use HTTPS and secure cookies for authentication.
    - Modern React Patterns
        - Prefer custom hooks for complex logic.
        - Implement error boundaries for better stability.
        - Use React Query or similar libraries for efficient data fetching and caching.
    - Testing
        - Write unit tests for UI components (e.g., Vitest or Jest).
        - Ensure accessibility tests for critical flows.
        - Validate forms and UI behaviors before merging.

## Summary

    - Copilot must generate modern, clean, and optimized React code using FSD architecture, shadcn/ui, and Tailwind CSS.
    - The focus is on simplicity, performance, accessibility, and scalability while avoiding outdated patterns.
