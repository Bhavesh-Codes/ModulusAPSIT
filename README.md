# Modulus

**Modulus** is a modern, neo-brutalist collaborative academic workspace and digital repository platform built for educational institutions. Designed for faculty, students, department heads (HODs), and developers, Modulus simplifies resource management, group collaboration, and academic organization.

## ✨ Core Features

- **📂 Multi-Window Vault**: A high-speed, secure personal storage layer backed by Cloudflare R2 object storage. Features a powerful desktop-like multi-window OS experience that allows users to preview up to 7 concurrent files/resources (PDFs, images, YouTube streams, Google Drive documents, and folders) in draggable, minimizable floating windows. Supports nested folder navigation, tagging, global search, and direct uploads.
- **🎓 Academic Groups / Modules**: Discoverable structured study and subject groups with granular role-based permissions (`Owner`, `Curator`, `Peer`). Groups support public and private visibility settings.
- **🤝 Group Vaults**: Shared collaborative repositories within groups for distributing lecture notes, syllabus materials, reference links, and past papers without redundant duplication.
- **🛡️ Role Architecture & Onboarding**: Multi-tier academic roles (`Faculty`, `HOD`, `Dev`, `Student`) with global viewing rights for department leadership, powered by a guided onboarding flow.
- **👤 Profiles & Stats**: User dashboard with Cloudflare R2 avatar uploads, academic title configuration, and live activity metrics.
- **🎨 Neo-Brutalist Design System**: High-contrast brutalist aesthetic featuring bold borders, crisp offset drop shadows, vibrant accent palettes, dark/light theme support, and smooth Framer Motion interactions.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- **Runtime & UI**: React 19, TypeScript
- **Backend/Auth**: [Supabase](https://supabase.com) (PostgreSQL, Row Level Security, Auth SSR)
- **Storage**: Cloudflare R2 (S3-compatible) via `@aws-sdk/client-s3`
- **State & Data Fetching**: TanStack Query (React Query v5) & Zustand (multi-window UI state)
- **Styling**: Tailwind CSS v4, Radix UI primitives, Lucide Icons, tw-animate-css
- **Animations & Polish**: Framer Motion, GSAP, Sonner (toast notifications)

## 💻 Getting Started

### Prerequisites

- Node.js 18.x or higher
- A Supabase account (URL, Anon Key, Service Role Key)
- A Cloudflare R2 bucket (Account ID, Access Keys, Bucket Name, Public Endpoint)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Bhavesh-Codes/MODULUS.git
   cd modulus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Copy the example environment file and add your Supabase and R2 credentials.
   ```bash
   cp .env.example .env
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- `src/actions/` - Next.js Server Actions (auth, modules, vault)
- `src/app/` - Next.js App Router (pages, layouts, api routes)
- `src/components/` - UI components, landing page sections, vault window manager
- `src/hooks/` - Custom React hooks (e.g., drag and drop)
- `src/lib/` - Utilities, Supabase clients, R2 SDK client, Zustand stores, roles configuration
- `src/types/` - TypeScript interfaces and data models

## License

This project is private and owned by [Bhavesh-Codes](https://github.com/Bhavesh-Codes).
