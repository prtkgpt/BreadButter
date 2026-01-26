# BreadButter

A Next.js application deployed on Vercel with Neon PostgreSQL database.

## Project Structure

```
src/
├── app/           # Pages & API routes
├── components/    # UI components
└── lib/           # DB schema, auth, utilities
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and add your Neon database URL:
   ```bash
   cp .env.example .env.local
   ```
4. Push the database schema:
   ```bash
   npm run db:push
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Deployment**: Vercel

## Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migrations from schema |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema directly to database |
| `npm run db:studio` | Open Drizzle Studio |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
