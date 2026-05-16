# Superleap Lead Management CRM

A single-page React application built for the Superleap Frontend Engineering intern assessment. The app handles browsing, creating, filtering, and transitioning sales leads through a pipeline, featuring a URL-driven list view, drag-and-drop Kanban board, and scalable bulk mutation capabilities.

---

## Features

* **Core CRUD + Validation**

  * Create, read, update, and delete leads
  * Inline validation using React Hook Form + Zod

* **Centralized Transition Engine**

  * Prevents invalid status transitions across the UI
  * Shared rules between table view, modals, and Kanban board

* **URL-Driven State**

  * Search, filters, sorting, pagination, and view state synced with `useSearchParams`
  * Shareable and reload-safe URLs

* **Kanban Board**

  * Drag-and-drop lead movement
  * Invalid drops snap back with error feedback

* **Bulk Actions**

  * Multi-select lead actions
  * Bulk delete + bulk status updates

* **Performance Pipeline**

  * Memoized `Filter → Sort → Paginate` pipeline
  * Handles 5,000+ mock records without freezing the UI

---

## Setup Instructions

### 1. Install dependencies and start the mock server

```bash id="9f6pfx"
npm install
npm run server
```

Ensure the mock server is running on:

```txt id="ojx39k"
http://localhost:4000
```

### 2. Start the frontend development server

```bash id="y2h2rr"
npm run dev
```

Open:

```txt id="m6c16d"
http://localhost:5173
```

---

## Tech Stack Chosen and Why

### React + Vite

I chose Vite over CRA mainly because the development server startup and HMR speeds are much faster. While iterating on UI interactions like drag-and-drop states or bulk selections, the faster feedback loop made debugging significantly smoother.

### Zustand

Initially, I tried managing selected rows using React Context, but selecting a single checkbox caused unnecessary rerenders across the entire table. I switched to Zustand because it allowed the selection state to stay isolated and update efficiently using a `Set` of selected IDs.

### Tailwind CSS

Tailwind made it easier to rapidly iterate on visual states directly inside the components without constantly switching between JSX and CSS files. It was especially useful for conditional styling like selected rows, status badges, hover states, and responsive layouts.

### JSON Server + TanStack Query

I used the provided `json-server` to simulate REST APIs quickly during development. TanStack Query handled caching, invalidation, loading states, and mutation syncing cleanly, especially after bulk actions or status updates.

---

## Design Decisions

### 1. Component, State, and Async Logic Organization

I organized the project using a feature-based structure (`features/leads/components`, `features/leads/hooks`, etc.) instead of placing everything inside global folders. As the project grew, this made the codebase easier to navigate and reduced coupling between unrelated parts of the UI.

I tried to keep the UI components as “dumb” as possible. Components like `LeadsTable` and `BulkActionBar` don’t directly communicate with the API — they interact through hooks and service functions. Separating server state (TanStack Query) from client-side UI state (Zustand) also helped avoid synchronization issues once bulk selection and URL state became more complex.

---

### 2. Status Rule Enforcement

Instead of scattering conditional checks across multiple components, I centralized the workflow logic inside a pure TypeScript transition engine (`domain/transitionEngine.ts`).

The UI simply asks the engine which transitions are valid for a given status. This became especially useful for bulk actions because multiple selected leads can have conflicting statuses. The engine computes the intersection of allowed transitions and disables invalid actions automatically, preventing impossible states from reaching the mutation layer.

---

### 3. Offline Support and Concurrent Editing

Currently, the app assumes a stable network and a single active user. If two users edited the same lead simultaneously, the latest request would overwrite the previous one.

To improve this, I would add optimistic concurrency control using timestamps or version numbers. The client would send the version it currently has, and the server could reject outdated updates using a `409 Conflict` response.

For offline support, I would likely use IndexedDB to queue pending mutations locally and replay them once the connection is restored. Combined with optimistic updates, this would make actions like Kanban card movement feel much more resilient.

---

### 4. Improvements I Would Add With Another Week

#### Continuous Virtualization

Right now, the app uses URL-based pagination to avoid rendering thousands of DOM nodes simultaneously. It performs well, but moving to a fully virtualized scrolling experience using `@tanstack/react-virtual` would make the table feel much smoother for very large datasets.

#### Undo Support

Delete actions currently use a `window.confirm` prompt for safety. A better UX would be optimistic deletion combined with a temporary “Undo” toast before the mutation becomes permanent.

#### Keyboard Accessibility

Basic keyboard navigation works, but there’s room for improvement. Features like arrow-key table navigation, Shift+Click row selection, and stronger focus management would make the dashboard much faster to use.

#### Mobile Experience

The current mobile experience relies on horizontal scrolling for the table. Given more time, I would build a dedicated stacked-card mobile layout instead of forcing the desktop table structure onto smaller screens.

---

## AI Usage Note

I used AI tools mainly as a development assistant for brainstorming implementation approaches, generating repetitive boilerplate, and exploring architectural ideas quickly. It was helpful for speeding up setup work like TypeScript interfaces, hook scaffolding, and some Tailwind layout experimentation.

At the same time, a lot of the implementation still required manual debugging and adaptation. I rejected suggestions that added unnecessary complexity, and several issues had to be solved manually — especially around React hook ordering, event bubbling conflicts between rows and checkboxes, and keeping pagination/search state synchronized with the URL without causing invalid states or blank screens.

---

## Repository Checklist

* [x] Source code with organized project structure
* [x] README with architecture and design explanations
* [x] `.gitignore` configured correctly
* [x] Mock API integration
* [x] URL-driven state management
* [x] Bulk actions implementation
* [x] Demo video included

---

