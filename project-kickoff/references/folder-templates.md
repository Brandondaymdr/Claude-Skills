# Folder Structure Templates

## Table of Contents
1. [Universal Files](#universal-files)
2. [Next.js + Supabase + Vercel](#nextjs-supabase-vercel)
3. [Python API / FastAPI](#python-api-fastapi)
4. [Node.js CLI Tool](#nodejs-cli-tool)
5. [Monorepo (Turborepo)](#monorepo-turborepo)
6. [Static Site / Content](#static-site)
7. [Mobile App (React Native / Expo)](#mobile-app)
8. [Automation / Scripts Project](#automation-project)

---

## Universal Files

Every project should have these regardless of stack:

```
project-root/
├── .claude/                    # Claude Code configuration
│   ├── settings.json           # Tool permissions
│   ├── commands/               # Custom slash commands
│   ├── rules/                  # Path-scoped rules
│   ├── skills/                 # Project-specific skills
│   └── agents/                 # Subagent definitions
├── .gitignore                  # Stack-appropriate ignores
├── CLAUDE.md                   # AI assistant instructions
├── README.md                   # Human documentation
└── .env.example                # Environment variable template
```

Files that should be gitignored:
- `.claude/settings.local.json` — personal permission overrides
- `CLAUDE.local.md` — personal instruction overrides
- `.env` / `.env.local` — actual secrets
- `node_modules/` / `venv/` / `__pycache__/` — dependencies and caches

---

## Next.js + Supabase + Vercel

The most common web app stack. Uses App Router (Next.js 14+).

```
project-root/
├── .claude/
│   ├── settings.json
│   ├── commands/
│   │   ├── dev.md              # Start dev environment
│   │   ├── test.md             # Run tests
│   │   └── deploy.md           # Deploy checklist
│   ├── rules/
│   │   ├── api-rules.md        # API route conventions (paths: src/app/api/**)
│   │   └── component-rules.md  # Component conventions (paths: src/components/**)
│   ├── skills/
│   │   └── supabase-patterns/  # Supabase query patterns, RLS, etc.
│   └── agents/
│       └── reviewer.md         # Code review agent
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── api/                # API routes
│   │   │   └── trpc/[trpc]/
│   │   └── dashboard/          # Protected pages
│   │       ├── page.tsx
│   │       └── _components/    # Colocated components
│   ├── components/             # Shared components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Shared utilities
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   └── admin.ts        # Service role client
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   │   ├── database.ts         # Auto-generated from Supabase
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── supabase/
│   ├── migrations/             # Database migrations
│   ├── seed.sql                # Seed data
│   └── config.toml             # Supabase config
├── public/                     # Static assets
├── docs/
│   ├── architecture.md
│   └── database-schema.md
├── scripts/
│   └── setup.sh                # First-time setup script
├── CLAUDE.md
├── README.md
├── .env.example
├── .env.local                  # (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── vercel.json
```

---

## Python API / FastAPI

```
project-root/
├── .claude/
│   ├── settings.json
│   ├── commands/
│   │   ├── dev.md
│   │   └── test.md
│   ├── rules/
│   │   └── api-rules.md        # (paths: src/api/**)
│   └── skills/
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app
│   │   ├── routes/
│   │   ├── models/             # Pydantic models
│   │   ├── services/           # Business logic
│   │   ├── db/
│   │   │   ├── connection.py
│   │   │   ├── models.py       # SQLAlchemy/ORM models
│   │   │   └── migrations/
│   │   └── utils/
│   └── config.py
├── tests/
│   ├── conftest.py
│   ├── unit/
│   └── integration/
├── scripts/
│   └── setup.sh
├── CLAUDE.md
├── README.md
├── .env.example
├── pyproject.toml
├── requirements.txt
└── Dockerfile
```

---

## Node.js CLI Tool

```
project-root/
├── .claude/
│   ├── settings.json
│   └── commands/
├── src/
│   ├── index.ts                # Entry point
│   ├── cli.ts                  # Argument parsing
│   ├── commands/               # Command implementations
│   ├── lib/                    # Core logic
│   └── utils/
├── tests/
├── CLAUDE.md
├── README.md
├── package.json
├── tsconfig.json
└── tsup.config.ts              # Build config
```

---

## Monorepo (Turborepo)

```
project-root/
├── .claude/
│   ├── settings.json
│   ├── commands/
│   ├── rules/
│   │   ├── frontend-rules.md   # (paths: apps/web/**)
│   │   ├── api-rules.md        # (paths: apps/api/**)
│   │   └── package-rules.md    # (paths: packages/**)
│   └── skills/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── CLAUDE.md           # Frontend-specific instructions
│   │   └── ...
│   └── api/                    # Backend API
│       ├── CLAUDE.md           # API-specific instructions
│       └── ...
├── packages/
│   ├── ui/                     # Shared component library
│   │   └── CLAUDE.md
│   ├── db/                     # Database client + types
│   ├── config/                 # Shared configs (eslint, tsconfig)
│   └── utils/                  # Shared utilities
├── CLAUDE.md                   # Root — shared conventions
├── README.md
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## Static Site

```
project-root/
├── .claude/
│   ├── settings.json
│   └── skills/
├── src/
│   ├── pages/
│   ├── components/
│   ├── styles/
│   └── content/                # Markdown/MDX content
├── public/
├── CLAUDE.md
├── README.md
└── package.json
```

---

## Mobile App

```
project-root/
├── .claude/
│   ├── settings.json
│   ├── rules/
│   │   ├── screen-rules.md     # (paths: src/screens/**)
│   │   └── api-rules.md        # (paths: src/api/**)
│   └── skills/
├── src/
│   ├── app/                    # Expo Router / navigation
│   ├── screens/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── api/                    # API client
│   ├── stores/                 # State management
│   └── types/
├── assets/
├── tests/
├── CLAUDE.md
├── README.md
├── app.json
├── package.json
└── tsconfig.json
```

---

## Automation Project

For scripts, workflows, and automation tools (n8n, cron jobs, etc.):

```
project-root/
├── .claude/
│   ├── settings.json
│   └── skills/
├── src/
│   ├── workflows/              # Individual automations
│   ├── lib/                    # Shared utilities
│   ├── integrations/           # API clients for external services
│   └── config/
├── tests/
├── scripts/
├── logs/                       # (gitignored)
├── CLAUDE.md
├── README.md
├── .env.example
└── package.json
```
