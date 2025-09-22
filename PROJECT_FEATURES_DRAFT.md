# Contract Flow Planning Document (Draft)

## Purpose

Design and implement a robust contract flow for project-based work, enabling clear agreement, milestone/payment negotiation, and transparent progress for both clients and contractors.

## Key Goals

- Allow both parties to negotiate and agree on contract terms and milestones before work begins
- Make milestone/payment breakdowns visible and editable during the proposal/negotiation phase
- Ensure all changes and agreements are tracked and auditable
- Provide a user-friendly, step-by-step contract finalization process

## User Stories / Use Cases

- As both parties, I want to be able to review the contract history and any changes made

## High-Level Flow

1. Client posts a project with a draft milestone/payment plan

- Proposal submission and selection
- Contract review and final agreement
- Advanced search and filtering for projects and point history
- Responsive design and improved accessibility
- E2E testing and automation
- Admin dashboard
- User rating and review system
- AI-powered suggestions and progress support

## 3. Screen Structure & Navigation (Examples)

- Project list
- Tabs for ongoing, completed, and proposed projects
- Project detail
  - Contract details and history
- Point-related modals
  - Purchase, send, receive, and history

---

# Enhanced Project Posting Screen: Wireframe & Requirements (Draft)

## Purpose

Design a project/job posting screen that maximizes trust, transparency, and risk awareness for both clients and contractors.

## Key Elements to Include

1. **Client Trust Information**
2. **Project Transparency & Legal Risk**
   - Clear scope, deliverables, acceptance criteria
   - AI/guide-based legal risk or ambiguity warnings
   - Total budget, milestone-by-milestone breakdown (amount, due date, deliverable)
3. **Resale/Subcontracting Risk**
   - AI or historical risk indicator ("Possible Resale/Outsourcing Risk: Low/Medium/High")
4. **Notices & Agreements**
   - Checklist of key terms and mutual agreements
5. **AI Advice & Templates**
   | [Client Info] [Verification Badge] [Rating ★4.7] |
   | Company: E-Commerce X (8 projects, 1 dispute) |

---

---

## | [Resale/Subcontracting Risk: LOW] |

| [Checklist: Terms & Agreements] |
| [ ] I agree to the platform's dispute policy |
| [ ] ... |

| [AI Suggestions for Project Clarity] |
| - Consider specifying API integration details |
| - ... |

---

## | [Submit Project] |

## Notes

- All risk/verification/AI advice sections should be visually prominent
- Checklist must be completed before submission

---

# Node/Card Structure Rules for Project Visualization (Draft)

To ensure clarity, manageability, and legal/operational safety in project workflows visualized as node graphs, the following rules are recommended:

## 1. Branching Limit

- Limit the number of child nodes (out-degree) from a single node (card) to a reasonable maximum (e.g., 3).
- Prevents excessive parallelism and keeps the workflow understandable.

## 2. No Cycles (Loop Prevention)

- Prohibit cycles in the node graph (no node can be its own ancestor).

## 3. Start/End Node Clarity

- Use color, icons, or labels to highlight nodes that are branch points (multiple children) or join points (multiple parents).

## 5. Node Type/Role Metadata

- Each node should have a type/role (e.g., task, milestone, review, branch, join) for clarity and validation.

## 6. Legal/Agreement Traceability

- All node creation, connection, and changes must be logged for audit and legal traceability.
- Key agreement points (e.g., contract, milestone approval) should be explicit nodes.

## 7. Optional: Maximum Graph Depth/Size

- Optionally limit the total depth or number of nodes in a project to prevent runaway complexity.

---

These rules help balance flexibility and simplicity, ensuring that even complex projects remain manageable and legally robust.

---

# Recommended Development Process for Card/Board/Node-based Project System

1. **Document the Overall Concept**

   - Define the roles and relationships of cards, nodes, edges, and boards.
   - Clarify the user experience: adding cards, connecting cards, reordering, progress tracking, etc.

2. **Finalize Data Structures and Rules**

   - Specify Board, Card, and Edge data models.
   - Set connection rules (branching limits, no cycles, etc.).

3. **Create UI/UX Wireframes**

   - Design the board view, card details, and connection operations.
   - List required UI components.

4. **Plan and Build the MVP**

   - Start with card add/edit/connect and board visualization.
   - Add progress, history, and legal traceability features incrementally.

5. **Test, Gather Feedback, and Iterate**
   - Continuously adjust the balance between simplicity and flexibility based on real usage.

---

# Data Models and Connection Rules (Draft)

## Board

- `id`: string (unique identifier)
- `title`: string
- `description`: string
- `nodes`: Card[] (array of card/node objects)
- `edges`: Edge[] (array of edge objects)
- `createdAt`, `updatedAt`: timestamps
- (optional) `ownerId`, `collaborators`, `status`, etc.

## Card (Node)

- `id`: string (unique identifier)
- `title`: string
- `description`: string
- `type`: string (e.g., 'task', 'milestone', 'review', etc.)
- `status`: string (e.g., 'open', 'in progress', 'done')
- `parentIds`: string[] (IDs of parent nodes)
- `childIds`: string[] (IDs of child nodes)
- `createdAt`, `updatedAt`: timestamps
- (optional) `assignee`, `dueDate`, `amount`, `attachments`, etc.

- `id`: string (unique identifier)
- `source`: string (source node id)
- `target`: string (target node id)
- `type`: string (e.g., 'dependency', 'sequence', etc.)
- (optional) `label`, `createdAt`, etc.

## Connection Rules

- No cycles: Adding an edge must not create a loop in the graph.
  // ...existing code...
- Node types and edge types should be validated for allowed connections (e.g., 'review' nodes cannot be children of 'milestone' nodes).

## UI/UX Wireframe (Textual)

---

| [Board Title] [Project Description] [Progress Bar]   |
| ---------------------------------------------------- |
| [Add Card] [Zoom In/Out] [Export]                    |
| ---------------------------------------------------- |
| [Node/Card 1]---[Node/Card 2]---[Node/Card 3]        |
|                                                      |
| [Details] [Details] [Details]                        |
| ---------------------------------------------------- |
| [Edge/Connection lines visually link cards]          |
| [Drag & drop to move cards, connect, or reorder]     |
| [Click card: open detail modal (edit, history)]      |

- Board view: canvas with cards (nodes) and connections (edges)
- Sidebar or modal for card details, editing, and history
- Visual cues for start/end nodes, branches, and joins

## MVP Feature List

1. Board creation and selection
2. Add/edit/delete cards (nodes) on the board
3. Add/delete connections (edges) between cards
4. Drag & drop cards to reposition
5. Visualize connections (lines/arrows)
6. Card detail modal: edit title, description, type, status
7. Prevent cycles and enforce connection rules
8. Save/load board state (local or backend)
9. Basic progress tracking (e.g., completed cards/total)
10. Minimal UI for board/project metadata (title, description)

---

Further features (after MVP):

- Card assignment, due dates, attachments
- Comments, history/audit log
- Advanced progress metrics, filtering, search
- Multi-user collaboration
- Export/import (image, JSON, etc.)
