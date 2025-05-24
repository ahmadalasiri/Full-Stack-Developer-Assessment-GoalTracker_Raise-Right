# Full Stack Developer Assessment – Raise Right

## Project:

GoalTracker – Smart Personal & Public Goal Management Tool

## Objective:

Build a minimal, full-stack application using NestJS, Angular, and either PostgreSQL or MongoDB to allow users to create, manage, and share hierarchical goals or objectives with deadlines and visibility controls.

---

## Requirements

### 📌 Core Features

#### 1. Authentication (JWT)

- **POST /auth/register**: Register user
- **POST /auth/login**: Login and receive JWT
- Protect all user-specific endpoints with JWT

#### 2. Goals API (NestJS)

A single goal should have the following structure:

```typescript
{
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO Date
  isPublic: boolean;
  parentId?: string | null;
  order: number; // For custom ordering
  publicId?: string; // Public read-only share link
  ownerId: string;
}
```

**Constraints:**

- Nesting: max 2 levels (root > child > sub-child)
- parentId must be validated to prevent excessive depth

**Required Endpoints:**

- **GET /goals**: List authenticated user's goals
- **POST /goals**: Create a goal
- **PUT /goals/:id**: Update a goal
- **DELETE /goals/:id**: Delete a goal
- **GET /public-goals**: List all public goals
- **GET /public-goals/:publicId**: View a shared public goal by URL

#### ✅ Database

- Use PostgreSQL or MongoDB
- You must justify your choice in the README.md with pros/cons
- Use an ORM/ODM (e.g., TypeORM, Prisma, Mongoose)

---

### 🧩 Frontend (Angular)

#### Pages to Build:

- **Login/Register** (basic form)

- **Dashboard (Private Goals)**:

  - Display user's goals in a visually nested, ordered list/tree
  - Ability to:
    - Create, update, delete goals
    - Drag to re-order (within same level)
    - Nest/un-nest goals (max 2 levels)
    - Toggle public/private
    - Set/update deadline

- **Public Goals**:
  - **/public**: Browse all public goals
  - **/public/:publicId**: View a single shared goal
  - Public goals are ordered based on most recently created, only private goals prioritize ordering
  - Child and sub-child goals are displayed only in a single goal view page, browsing goals' lists publicly doesn't display all nested goals in the main view

#### Interactions:

- Basic modals/forms
- Deadline displayed with each goal
- Minimal UI – focus on function, not design polish
- Visual nesting via expandable list or indented layout

---

### 🔧 Technical Constraints

- **Backend**: NestJS (strict requirement)
- **Frontend**: Angular
- **Database**: PostgreSQL or MongoDB
- Store JWT in localStorage (for simplicity)
- API and UI must enforce 2-level nesting

---

### ✨ Bonus Points

- Implement goal completion status (completed: true/false)
- Add validation messages and loading states
- Include basic unit tests (backend or frontend)
- Use Docker + Docker Compose to run backend + database

---

### Estimated Time & Deadline

- **Estimated total time**: 5–8 hours
- **Deadline**: 72 hours after receiving the task
  (You can split time across 3 days; we're evaluating quality, not rush.)

---

### Evaluation Criteria

| Category         | Focus                                               |
| ---------------- | --------------------------------------------------- |
| Backend Quality  | Clean NestJS modules, guards, services, validation  |
| Frontend Quality | Angular services, components, and UX clarity        |
| Functionality    | Core features work as intended                      |
| Goal Nesting     | Proper enforcement of 2-level nesting with ordering |
| Database Design  | Appropriate modeling, indexing, and rationale given |
| Security         | Authenticated access, proper route protection       |
| Clarity          | Code readability, commit history, docs              |
