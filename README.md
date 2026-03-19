# μLearn Dashboard

A modern, comprehensive dashboard and community management platform for the **μLearn** foundation. Built with a focus on visual excellence, performance, and developer experience using the latest Next.js and React ecosystems.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Bun

### Installation

1. Clone the repository:=

   ```bash
   git clone <repository-url>
   cd mulearn-dashboard
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Setup environment variables:
   Copy `.env.example` to `.env` and fill in the required values.

4. Run the development server:

   ```bash
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Linting & Formatting**: [Biome](https://biomejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives

---

## ✨ Features

- **Auth System**: Integrated token-based authentication with automatic redirection on expiry/invalid sessions.
- **Dynamic Leaderboard**: Real-time tracking of community member progress.
- **Campus & Learning Circles**: Dedicated modules for managing and viewing campus-level activities and learning groups.
- **Profile Management**: Personalized user profiles with progression tracking and gamification elements.
- **Optimized Data Layer**: Centralized API client with built-in schema validation using Zod.
- **Responsive Design**: Mobile-first architecture built with Tailwind CSS.

---

## 📂 Project Structure

```text
src/
├── api/          # API client, endpoints, and response schemas
├── app/          # Next.js App Router (auth, dashboard, onboarding)
├── components/   # Shared UI components and layout elements
├── features/     # Feature-scoped logic, components, and hooks
├── hooks/        # Shared custom React hooks
├── lib/          # Utilities, shared constants, and core logic
├── stores/       # Zustand global state stores
└── config/       # Environment and global configuration
```

---

## 👨‍💻 Development

### Linting & Formatting

We use **Biome** for fast linting and formatting.

```bash
bun run lint      # Check for issues
bun run lint:fix  # Automatically fix issues
bun run format    # Format the entire codebase
```

### Type Checking

```bash
bun run typecheck
```

---

## 📄 License

This project is licensed under the MIT License.
