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
- **Campus Management**: Real-time tools for Campus Leads and Enablers to manage leadership teams and social presence.
- **Analytics & Insights**: Performance tracking via Karma by Cluster, Event Distribution, and individual student progress.
- **Event Lifecycle**: Comprehensive tracking of campus-level meetups, hackathons, and workshops.
- **Responsive Architecture**: Premium, mobile-first design system with optimized charts and interactive elements.
- **Dynamic Navigation**: Config-driven sidebar with recursive RBAC filtering and collapsible sub-menus.

---

## 🧭 Sidebar & Navigation System

The navigation is entire config-driven, allowing for rapid updates without touching layout logic.

### 1. Configuration (`src/lib/nav-config.ts`)
Each menu link is defined in the `NAV_ITEMS` array. A typical `NavItem` includes:
- **`roles` / `permission`**: Automatically filters visibility based on current user roles.
- **`children`**: Nest items to create a collapsible sub-menu (e.g., the Management folder).
- **`isUnderConstruction`**: Set to `true` to disable navigation and show a "Coming Soon" toast instead of a 404.

### 2. Visibility & RBAC
The system uses the `useFilteredNav()` hook to recursively check permissions. For nested menus:
- The **Parent Folder** is only visible if the user has access to at least *one* child item.
- **Sub-menus** are filtered individually based on user specific roles (e.g., an IG Lead only sees the Interest Groups link inside Management).

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
