---
name: diagrams
description: Generate diagrams as PNG images using Mermaid — flowcharts, sequence, ERD, class, state, Gantt, mind maps, git graphs, and more
---

# Diagrams with Mermaid

Generate diagrams by writing Mermaid syntax to a `.mmd` file, then rendering with `mmdc`.

## Rendering

```bash
# Write diagram to temp file, render to outbox
cat > /tmp/diagram.mmd << 'EOF'
graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Do something]
  B -->|No| D[Do other thing]
EOF
mmdc -i /tmp/diagram.mmd -o outbox/diagram.png -b transparent -p /root/.puppeteerrc.json
```

### Options

| Flag | Description |
|------|-------------|
| `-i <file>` | Input `.mmd` file |
| `-o <file>` | Output file (`.png`, `.svg`, `.pdf`) |
| `-b <color>` | Background color (`transparent`, `white`, `#hex`) |
| `-t <theme>` | Theme: `default`, `dark`, `forest`, `neutral` |
| `-w <px>` | Width in pixels (default: 800) |
| `-s <scale>` | Scale factor (default: 1, use 2 for high-res) |

Always use `-b transparent` or `-b white` for clean output.

## Diagram types

### Flowchart

```mermaid
graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great!]
  B -->|No| D[Debug]
  D --> B
```

Direction: `TD` (top-down), `LR` (left-right), `BT`, `RL`.

Node shapes: `[rectangle]`, `(rounded)`, `{diamond}`, `([stadium])`, `[[subroutine]]`, `[(cylinder)]`, `((circle))`.

### Sequence diagram

```mermaid
sequenceDiagram
  participant C as Client
  participant S as Server
  participant DB as Database
  C->>S: POST /login
  S->>DB: SELECT user
  DB-->>S: user record
  alt valid
    S-->>C: 200 OK + token
  else invalid
    S-->>C: 401 Unauthorized
  end
```

Arrows: `->>` (solid), `-->>` (dashed), `--)` (async).

### Entity-relationship diagram

```mermaid
erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : "is in"
  USER {
    int id PK
    string name
    string email UK
  }
  ORDER {
    int id PK
    date created
    string status
  }
```

Cardinality: `||` (one), `o{` (zero or more), `|{` (one or more), `o|` (zero or one).

### Class diagram

```mermaid
classDiagram
  class Animal {
    +String name
    +int age
    +makeSound() void
  }
  class Dog {
    +fetch() void
  }
  class Cat {
    +purr() void
  }
  Animal <|-- Dog
  Animal <|-- Cat
```

### State diagram

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Processing : submit
  Processing --> Success : ok
  Processing --> Error : fail
  Error --> Idle : retry
  Success --> [*]
```

### Gantt chart

```mermaid
gantt
  title Project Plan
  dateFormat YYYY-MM-DD
  section Design
    Wireframes     :a1, 2024-01-01, 7d
    Mockups        :a2, after a1, 5d
  section Development
    Backend API    :b1, after a1, 14d
    Frontend       :b2, after a2, 14d
  section Testing
    QA             :c1, after b1, 7d
```

### Mind map

```mermaid
mindmap
  root((Project))
    Frontend
      React
      TypeScript
      Tailwind
    Backend
      Node.js
      PostgreSQL
      Redis
    Infrastructure
      Docker
      AWS
      CI/CD
```

### Git graph

```mermaid
gitGraph
  commit
  branch feature
  checkout feature
  commit
  commit
  checkout main
  merge feature
  commit
```

### Pie chart

```mermaid
pie title Revenue by Region
  "North America" : 45
  "Europe" : 30
  "Asia" : 20
  "Other" : 5
```

### Architecture / C4 (using flowchart)

```mermaid
graph TB
  subgraph External
    U[User]
    API[External API]
  end
  subgraph Backend
    GW[API Gateway]
    SVC1[Auth Service]
    SVC2[Order Service]
    DB[(PostgreSQL)]
    Q[Message Queue]
  end
  U --> GW
  GW --> SVC1
  GW --> SVC2
  SVC2 --> DB
  SVC2 --> Q
  SVC1 --> DB
  API --> GW
```

Use `subgraph` blocks for grouping components.

## Tips

- Keep diagrams focused — one concept per diagram
- Use aliases for long names: `participant S as AuthService`
- Use `subgraph` to group related nodes
- For high-res output use `-s 2`
- Always output to `outbox/` for delivery back to chat
