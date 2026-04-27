# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev          # Hot-reload dev server (port 3000)
npm run start:debug        # Debug mode

# Build & production
npm run build              # Compile TypeScript to dist/
npm run start:prod         # Run compiled dist/main.js

# Code quality
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting

# Tests
npm run test               # Unit tests (Jest)
npm run test:watch         # Unit tests in watch mode
npm run test:cov           # Coverage report
npm run test:e2e           # End-to-end tests

# Database
npm run migration:generate -- --name=<MigrationName>   # Generate migration from entity changes
npm run migration:run      # Apply pending migrations
npm run migration:revert   # Revert last migration
npm run migration:show     # Show migration status
npm run seed               # Seed DB with sample data (src/database/seeds/seed.ts)
```

## Environment Setup

Copy `.env.example` to `.env`. Required variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow
DB_USER=taskflow
DB_PASSWORD=taskflow
JWT_SECRET=<change-in-production>
JWT_EXPIRES_IN=86400
PORT=3000
```

The project requires a running PostgreSQL instance. Run migrations before seeding.

## Architecture

**TaskFlow API** — a NestJS task-management backend with TypeORM + PostgreSQL.

### Module Structure

```
src/
├── auth/           # JWT + Passport authentication
├── users/          # User entity + CRUD + ownership checks
├── teams/          # Team entity + member management
├── projects/       # Project entity (belongs to Team)
├── tasks/          # Task entity (belongs to Project, assignee nullable)
├── comments/       # Comment entity (belongs to Task + User, create/read only)
├── common/         # GlobalExceptionFilter, LoggingInterceptor
└── database/
    ├── data-source.ts      # TypeORM DataSource (used by CLI)
    ├── migrations/         # All migrations live here
    └── seeds/seed.ts       # Sample data seed script
```

Entity relations: `User ↔ Team` (ManyToMany, join table `team_members`) → `Project` (OneToMany) → `Task` (OneToMany) → `Comment` (OneToMany). Tasks have a nullable `assignee` FK to User (SET NULL on delete).

### Authentication & Authorization

- **Two Passport strategies**: `LocalStrategy` (email/password login) and `JwtStrategy` (bearer token on all other routes).
- **JwtAuthGuard** is applied globally in `AppModule`. Use `@Public()` decorator to opt out.
- **RolesGuard** is applied globally. Use `@Roles(Role.ADMIN)` etc. to restrict endpoints. Roles live in the JWT payload (`sub`, `email`, `role`).
- `@CurrentUser()` parameter decorator extracts the validated user from the request.
- `UsersService.findByEmailWithPassword()` is the only method that selects `passwordHash` (the field has `select: false`).

### Database Conventions

- **Never use `synchronize: true`** — always generate and run migrations for schema changes.
- UUIDs as primary keys (`uuid_generate_v4()` default).
- `data-source.ts` is the single TypeORM DataSource used by both the app (`app.module.ts`) and the CLI (`migration:*` scripts).

### Global Infrastructure (main.ts + common/)

- `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` — unknown properties throw, type coercion is automatic.
- `GlobalExceptionFilter` normalises all errors (TypeORM `QueryFailedError` → 400 or 409, `HttpException` passthrough, unknown → 500) to `{ statusCode, timestamp, path, message }`.
- `LoggingInterceptor` logs every request: method, URL, status, duration.
- Global route prefix: `/api`.

### HTTP Test Files

`src/http/*.http` — REST Client files for manual testing of auth, users, teams, and validation flows. Useful for exploring the API without a UI.
